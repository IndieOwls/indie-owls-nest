import { Module } from '@nestjs/common'

import { FeatureFlagsResolver } from './feature-flags.resolver'
import { FeatureFlagsService } from './feature-flags.service'

@Module({
  providers: [FeatureFlagsResolver, FeatureFlagsService],
  exports: [FeatureFlagsService],
})
export class FeatureFlagsModule {}
