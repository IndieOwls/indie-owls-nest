import { registerEnumType } from '@nestjs/graphql'

export enum DataRequestStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

registerEnumType(DataRequestStatus, { name: 'DataRequestStatus' })
