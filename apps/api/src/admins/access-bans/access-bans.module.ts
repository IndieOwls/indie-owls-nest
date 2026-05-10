import { Module } from '@nestjs/common'

import { AccessBansResolver } from './access-bans.resolver'
import { AccessBansService } from './access-bans.service'

@Module({
  providers: [AccessBansResolver, AccessBansService],
  exports: [AccessBansService],
})
export class AccessBansModule {}
