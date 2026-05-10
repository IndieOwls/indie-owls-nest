import { registerEnumType } from '@nestjs/graphql'

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

registerEnumType(SubscriptionTier, { name: 'SubscriptionTier' })
