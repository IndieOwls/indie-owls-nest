import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { CacheService } from './interfaces/cache-service.interface'
import { RedisCacheService } from './providers/redis-cache.service'
import { InMemoryCacheService } from './providers/in-memory-cache.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CacheService,
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('redis.host')
        if (host) return new RedisCacheService(config)
        return new InMemoryCacheService()
      },
      inject: [ConfigService],
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
