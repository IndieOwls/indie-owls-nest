import { Field, Int, ObjectType, Float } from '@nestjs/graphql'

import { User } from '../../../users/entities/user.entity'
import { Organization } from '../../../modules/organizations/entities/organization.entity'
import { FeatureFlag } from '../../../admins/feature-flags/entities/feature-flag.entity'

@ObjectType()
export class Meta {
  @Field(() => User, { nullable: true })
  user?: User | null

  @Field(() => [Organization])
  organizations: Organization[]

  @Field(() => [FeatureFlag])
  featureFlags: FeatureFlag[]

  @Field(() => Int)
  unreadNotifications: number

  @Field(() => Float)
  serverTime: number
}
