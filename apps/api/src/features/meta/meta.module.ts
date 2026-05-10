import { Module } from '@nestjs/common'

import { FeatureFlagsModule } from '../../admins/feature-flags/feature-flags.module'
import { OrganizationsModule } from '../../modules/organizations/organizations.module'
import { PreferencesModule } from '../preferences/preferences.module'

import { MetaResolver } from './meta.resolver'

@Module({
  imports: [OrganizationsModule, FeatureFlagsModule, PreferencesModule],
  providers: [MetaResolver],
})
export class MetaModule {}
