import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'

import { MaintenanceService } from '../../modules/maintenance/maintenance.service'

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly maintenance: MaintenanceService) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    const enabled = await this.maintenance.isEnabled()
    if (enabled) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Service temporarily unavailable',
          error: 'Maintenance Mode',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }

    return true
  }
}
