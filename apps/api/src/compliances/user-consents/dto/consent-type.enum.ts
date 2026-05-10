import { registerEnumType } from '@nestjs/graphql'

export enum ConsentType {
  ANALYTICS = 'ANALYTICS',
  ESSENTIAL = 'ESSENTIAL',
  FUNCTIONAL = 'FUNCTIONAL',
  MARKETING = 'MARKETING',
  // Utility
  TEST = 'TEST',
}

registerEnumType(ConsentType, { name: 'ConsentType' })
