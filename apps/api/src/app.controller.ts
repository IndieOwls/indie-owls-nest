import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { AppService } from './app.service'
import type { HealthResult } from './app.types'

import { LoggerService } from './modules/logger'

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly service: AppService,
    private readonly logger: LoggerService,
  ) {}

  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns server status, dependency connectivity (PostgreSQL, Redis), and client build status (web, admin).',
  })
  @Get(['/', 'health'])
  async getHealth(): Promise<HealthResult> {
    this.logger.log('Health check requested', 'AppController.getHealth')
    return this.service.getHealth()
  }
}
