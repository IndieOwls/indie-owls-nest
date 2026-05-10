import { Module } from '@nestjs/common'
import { CompliancePiiService } from './compliance-pii.service'

@Module({
  providers: [CompliancePiiService],
  exports: [CompliancePiiService],
})
export class CompliancePiiModule {}
