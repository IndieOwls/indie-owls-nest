import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { DatabaseModule } from '../../databases/database.module'
import { AuditService } from './audit.service'
import { AuditResolver } from './audit.resolver'
import { AuditInterceptor } from './audit.interceptor'

@Module({
  imports: [DatabaseModule],
  providers: [
    AuditService,
    AuditResolver,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
