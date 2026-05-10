import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ThrottlerStorage } from '@nestjs/throttler'
import IORedis from 'ioredis'

interface ThrottlerStorageRecord {
  totalHits: number
  timeToExpire: number
  isBlocked: boolean
  timeToBlockExpire: number
}

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly redis: IORedis | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly storage: Record<string, any>

  constructor(config: ConfigService) {
    const host = config.get<string>('redis.host')
    if (host) {
      this.redis = new IORedis({
        host,
        port: config.get<number>('redis.port') ?? 6379,
        keyPrefix: 'throttle:',
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      })
      this.redis.connect().catch((err) => console.warn('Redis throttle connect failed:', err))
    } else {
      this.redis = null
    }
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    if (!this.redis) {
      return this.fallbackIncrement(key, ttl)
    }

    try {
      const multi = this.redis.multi()
      multi.incr(key)
      multi.pttl(key)
      const [[incrErr, count], [pttlErr, ttlRemaining]] = (await multi.exec()) as [
        [Error | null, number],
        [Error | null, number],
      ]

      if (incrErr || pttlErr) throw incrErr ?? pttlErr

      let timeToExpire = ttlRemaining
      if (timeToExpire < 0) {
        await this.redis.pexpire(key, ttl * 1000).catch((err) =>
          console.warn('Redis throttle pexpire failed:', err),
        )
        timeToExpire = ttl * 1000
      }

      const isBlocked = count > limit && blockDuration > 0
      const timeToBlockExpire = isBlocked ? timeToExpire : 0

      return { totalHits: count, timeToExpire, isBlocked, timeToBlockExpire }
    } catch {
      return this.fallbackIncrement(key, ttl)
    }
  }

  private readonly fallbackStore = new Map<string, { hits: number; expiresAt: number }>()

  private fallbackIncrement(key: string, ttl: number): ThrottlerStorageRecord {
    const now = Date.now()
    const entry = this.fallbackStore.get(key)

    if (!entry || entry.expiresAt < now) {
      this.fallbackStore.set(key, { hits: 1, expiresAt: now + ttl * 1000 })
      return { totalHits: 1, timeToExpire: ttl * 1000, isBlocked: false, timeToBlockExpire: 0 }
    }

    entry.hits++
    return {
      totalHits: entry.hits,
      timeToExpire: entry.expiresAt - now,
      isBlocked: false,
      timeToBlockExpire: 0,
    }
  }
}
