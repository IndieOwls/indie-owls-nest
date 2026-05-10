import { registerEnumType } from '@nestjs/graphql'

export enum DataRequestType {
  ACCESS = 'ACCESS',
  DELETION = 'DELETION',
  PORTABILITY = 'PORTABILITY',
}

registerEnumType(DataRequestType, { name: 'DataRequestType' })
