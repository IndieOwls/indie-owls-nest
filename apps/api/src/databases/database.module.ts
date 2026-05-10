import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { DRIZZLE } from './index'
import * as schema from './schema'

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const client = postgres({
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          user: config.get<string>('database.user'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.name'),
          max: 10, // pool size — tune to taste
        })
        return drizzle(client, { schema })
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
