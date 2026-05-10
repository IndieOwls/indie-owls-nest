import { existsSync } from 'fs'
import { join } from 'path'

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ThrottlerModule } from '@nestjs/throttler'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import mainConfig from './configs/main.config'
import { DatabaseModule } from './databases/database.module'

import { AdminModule } from './admins/admin.module'
import { ComplianceModule } from './compliances/compliance.module'

import { CacheModule } from './modules/cache'
import { EmailModule } from './modules/emails'
import { EventModule } from './modules/events'

import { AuditModule } from './modules/audit'
import { BillingModule } from './modules/billing'
import { FilesModule } from './modules/files'
import { LoggerModule } from './modules/logger/logger.module'
import { QueueModule } from './modules/queues'
import { OrganizationsModule } from './modules/organizations/organizations.module'
import { RedisThrottlerStorage } from './modules/cache'
import { UsersModule } from './users/users.module'

import { MaintenanceModule } from './modules/maintenance/maintenance.module'
import { MetaModule } from './features/meta'
import { NotificationsModule } from './features/notifications/notifications.module'

import { OrganizationResolverMiddleware } from './modules/organizations/middleware/organization-resolver.middleware'

import * as constants from './constants'

@Module({
  imports: [
    ...(existsSync(constants.WEB_CLIENT)
      ? [
          ServeStaticModule.forRoot({
            rootPath: constants.WEB_CLIENT,
            exclude: [`/${constants.API_GRAPHQL}{*path}`],
          }),
        ]
      : []),
    ...(existsSync(constants.ADMIN_CLIENT)
      ? [
          ServeStaticModule.forRoot({
            rootPath: constants.ADMIN_CLIENT,
            serveRoot: '/admin',
          }),
        ]
      : []),
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, // env.ts preloads .env cascade before ConfigModule boots
      load: [mainConfig],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ ttl: constants.THROTTLE_TTL, limit: constants.THROTTLE_LIMIT }],
        storage: config.get<string>('redis.host') ? new RedisThrottlerStorage(config) : undefined,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      // Apollo Server 5 ships its own embedded Sandbox landing page by default
      // in non-production — no plugin needed. Introspection is explicitly enabled
      // above so the Sandbox explorer shows the full schema with documentation.
      path: constants.API_GRAPHQL,
      context: ({ req }: { req: any }) => ({ req }),
    }),
    AdminModule,
    ComplianceModule,
    AuditModule,
    BillingModule,
    CacheModule,
    DatabaseModule,
    EmailModule,
    EventModule,
    FilesModule,
    LoggerModule,
    MaintenanceModule,
    MetaModule,
    NotificationsModule,
    OrganizationsModule,
    QueueModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OrganizationResolverMiddleware).forRoutes('*')
  }
}
