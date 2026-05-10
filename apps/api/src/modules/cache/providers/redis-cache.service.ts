import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import IORedis from 'ioredis'

import { CacheService } from '../interfaces/cache-service.interface'

const PREFIX = 'cache:'

@Injectable()
export class RedisCacheService extends CacheService {
  private readonly redis: IORedis

  constructor(config: ConfigService) {
    super()
    this.redis = new IORedis({
      host: config.get<string>('redis.host') ?? 'localhost',
      port: config.get<number>('redis.port') ?? 6379,
      keyPrefix: PREFIX,
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 200, 2000)),
    })
    this.redis.connect().catch((err) => console.warn('Redis cache connect failed:', err))
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await this.redis.get(key)
      return val ? (JSON.parse(val) as T) : null
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized)
      } else {
        await this.redis.set(key, serialized)
      }
    } catch {
      // cache miss — best-effort
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch {
      // best-effort
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        let cursor = '0'
        do {
          const [nextCursor, keys] = await this.redis.scan(
            cursor,
            'MATCH',
            `${pattern}*`,
            'COUNT',
            100,
          )
          if (keys.length > 0) await this.redis.del(...keys)
          cursor = nextCursor
        } while (cursor !== '0')
      } else {
        await this.redis.flushdb()
      }
    } catch {
      // best-effort
    }
  }
}
