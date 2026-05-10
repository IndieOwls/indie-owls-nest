import { registerEnumType } from '@nestjs/graphql'

export enum UserTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

registerEnumType(UserTier, { name: 'UserTier' })
