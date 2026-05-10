import { registerEnumType } from '@nestjs/graphql'

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  TRIALING = 'TRIALING',
  INCOMPLETE = 'INCOMPLETE',
}

registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' })
