import { Module } from '@nestjs/common'

import { DataRequestResolver } from './data-request.resolver'
import { DataRequestService } from './data-request.service'
import { CompliancePiiModule } from '../pii/compliance-pii.module'

@Module({
  imports: [CompliancePiiModule],
  providers: [DataRequestResolver, DataRequestService],
  exports: [DataRequestService],
})
export class DataRequestModule {}
