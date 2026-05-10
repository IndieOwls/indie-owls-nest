import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'

import { NotificationType } from '../dto'
import { User, users } from '../../../users/entities/user.entity'

@ObjectType()
export class Notification {
  @Field(() => Int)
  id!: number

  @Field(() => Int)
  userId: User['id']

  @Field(() => NotificationType)
  type: NotificationType

  @Field(() => Int, { nullable: true })
  referenceId?: number | null

  @Field(() => String, { nullable: true })
  referenceType?: string | null

  @Field(() => Boolean, { defaultValue: false })
  isRead: boolean

  @Field(() => String, { nullable: true })
  title?: string | null

  @Field(() => String)
  message: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => Date, { nullable: true })
  readAt?: Date | null
}

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  type: text('type').$type<NotificationType>().notNull(),
  referenceId: integer('reference_id'),
  referenceType: text('reference_type'),
  isRead: boolean('is_read').default(false).notNull(),
  title: text('title'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  readAt: timestamp('read_at', { withTimezone: true }),
})

export type NotificationRow = typeof notifications.$inferSelect
export type NewNotificationRow = typeof notifications.$inferInsert
