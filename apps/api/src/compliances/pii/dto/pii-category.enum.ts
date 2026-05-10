import { registerEnumType } from '@nestjs/graphql'

export enum PiiCategory {
  EMAIL = 'EMAIL',
  NAME = 'NAME',
  IP_ADDRESS = 'IP_ADDRESS',
  USER_AGENT = 'USER_AGENT',
  IDENTIFIER = 'IDENTIFIER',
}

registerEnumType(PiiCategory, { name: 'PiiCategory' })
