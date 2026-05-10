import { registerEnumType } from '@nestjs/graphql'

export enum NotificationType {
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  // Utility
  MOCK_NOTIFICATION = 'MOCK_NOTIFICATION',
  TEST_NOTIFICATION = 'TEST_NOTIFICATION',
}

registerEnumType(NotificationType, { name: 'NotificationType' })
