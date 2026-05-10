import { Module } from '@nestjs/common'

import { LoggerModule } from '../logger/logger.module'

import { OrganizationsResolver } from './organizations.resolver'
import { OrganizationsService } from './organizations.service'
import { OrganizationGuard } from '../../common/guards/organization.guard'

@Module({
  imports: [LoggerModule],
  providers: [OrganizationsResolver, OrganizationsService, OrganizationGuard],
  exports: [OrganizationsService, OrganizationGuard],
})
export class OrganizationsModule {}
