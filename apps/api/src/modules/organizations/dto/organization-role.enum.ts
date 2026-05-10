import { registerEnumType } from '@nestjs/graphql'

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

registerEnumType(OrganizationRole, { name: 'OrganizationRole' })
