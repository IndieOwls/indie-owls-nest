import { Module } from '@nestjs/common'

import { UserConsentsService } from './user-consents.service'
import { UserConsentsResolver } from './user-consents.resolver'

@Module({
  providers: [UserConsentsResolver, UserConsentsService],
  exports: [UserConsentsService],
})
export class UserConsentsModule {}
