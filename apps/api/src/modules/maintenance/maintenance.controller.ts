import { Controller, Post, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'

import { MaintenanceService } from './maintenance.service'
import { API_MAINTENANCE } from '../../constants'

@ApiTags('Maintenance')
@Controller(API_MAINTENANCE)
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @ApiOperation({ summary: 'Enable maintenance mode — returns 503 to all non-bypass traffic' })
  @Post('enable')
  async enable() {
    await this.service.enable()
    return { status: 'maintenance_mode_enabled' }
  }

  @ApiOperation({ summary: 'Disable maintenance mode — restores normal traffic flow' })
  @Post('disable')
  async disable() {
    await this.service.disable()
    return { status: 'maintenance_mode_disabled' }
  }

  @ApiOperation({ summary: 'Check whether maintenance mode is currently active' })
  @Get('status')
  async status() {
    return this.service.getStatus()
  }
}
