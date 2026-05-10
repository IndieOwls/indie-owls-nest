import { Module } from '@nestjs/common'

import { JSONScalar } from '../../common/scalars/json.scalar'

import { PreferencesService } from './preferences.service'
import { PreferencesResolver } from './preferences.resolver'

@Module({
  providers: [PreferencesResolver, PreferencesService, JSONScalar],
  exports: [PreferencesService],
})
export class PreferencesModule {}
