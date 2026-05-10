import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { MaintenanceService } from './maintenance.service'
import { MaintenanceController } from './maintenance.controller'
import { MaintenanceGuard } from '../../common/guards/maintenance.guard'

@Module({
  controllers: [MaintenanceController],
  providers: [
    MaintenanceService,
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
  ],
})
export class MaintenanceModule {}
