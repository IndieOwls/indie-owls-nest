import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common'

import { SubscriptionTier } from '../../modules/billing/dto'
import { SubscriptionGuard } from '../guards/subscription.guard'

export const REQUIRED_PLAN_KEY = 'requiredPlan'

export const RequiresPlan = (...tiers: SubscriptionTier[]) =>
  applyDecorators(SetMetadata(REQUIRED_PLAN_KEY, tiers), UseGuards(SubscriptionGuard))
