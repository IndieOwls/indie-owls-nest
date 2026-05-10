import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'

import { User, users } from '../../../users/entities/user.entity'

@ObjectType()
export class UserPreferences {
  @Field(() => Int)
  id!: number

  @Field(() => Int)
  userId: number

  @Field(() => Object)
  preferences: Record<string, any>

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  preferences: jsonb('preferences').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type UserPreferencesRow = typeof userPreferences.$inferSelect
export type NewUserPreferencesRow = typeof userPreferences.$inferInsert
