import { existsSync } from 'fs'

import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { sql } from 'drizzle-orm'
import IORedis from 'ioredis'

import type { ComponentStatus, HealthResult } from './app.types'

import { DRIZZLE, type DrizzleDB } from './databases'
import { WEB_CLIENT, ADMIN_CLIENT } from './constants'
import { env } from './configs/main.config'

@Injectable()
export class AppService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly config: ConfigService,
  ) {}

  async getHealth(): Promise<HealthResult> {
    const [dbStatus, redisStatus] = await Promise.all([this.checkDatabase(), this.checkRedis()])

    const overallStatus = dbStatus.status === 'ok' ? ('ok' as const) : ('degraded' as const)

    return {
      status: overallStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env,
      dependencies: {
        database: dbStatus,
        redis: redisStatus,
      },
      clients: {
        web: this.checkClientBuild(WEB_CLIENT),
        admin: this.checkClientBuild(ADMIN_CLIENT),
      },
    }
  }

  private async checkDatabase(): Promise<ComponentStatus> {
    const start = Date.now()
    try {
      const [result] = await this.db.execute(sql`SELECT 1 AS ok`)
      return {
        status: 'ok',
        latencyMs: Date.now() - start,
      }
    } catch (err: any) {
      return {
        status: 'error',
        message: err.message ?? 'Database connection failed',
      }
    }
  }

  private async checkRedis(): Promise<ComponentStatus> {
    const host = this.config.get<string>('redis.host')
    if (!host) {
      return { status: 'unavailable', message: 'Redis is not configured' }
    }

    const redisPort = this.config.get<number>('redis.port') ?? 6379
    const start = Date.now()

    let redis: IORedis | null = null
    try {
      redis = new IORedis({
        host,
        port: redisPort,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      })
      await redis.connect()
      await redis.ping()
      return { status: 'ok', latencyMs: Date.now() - start }
    } catch (err: any) {
      return { status: 'error', message: err.message ?? 'Redis connection failed' }
    } finally {
      if (redis) redis.disconnect()
    }
  }

  private checkClientBuild(clientPath: string): ComponentStatus {
    const path = clientPath
    if (!existsSync(path)) {
      return { status: 'unavailable', message: `Build not found at ${path}` }
    }

    const index = existsSync(`${path}/index.html`)
    if (!index) {
      return {
        status: 'error',
        message: `Build directory exists but index.html is missing at ${path}`,
      }
    }

    return { status: 'ok' }
  }
}
