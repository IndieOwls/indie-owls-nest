import { Module } from '@nestjs/common'

import { DataRequestModule } from './data-requests/data-request.module'
import { CompliancePiiModule } from './pii'
import { UserConsentsModule } from './user-consents/user-consents.module'

@Module({
  imports: [DataRequestModule, CompliancePiiModule, UserConsentsModule],
  exports: [DataRequestModule, CompliancePiiModule, UserConsentsModule],
})
export class ComplianceModule {}
