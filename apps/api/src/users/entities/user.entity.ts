import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core'

import { PiiField } from '../../common/decorators'
import { PiiCategory } from '../../compliances/pii'
import { UserRole, UserTier } from '../dto'

@ObjectType('User')
export class User {
  @Field(() => Int)
  id!: number

  @Field(() => String)
  username: string

  @Field(() => String, { nullable: true })
  displayName?: string | null

  @PiiField(PiiCategory.EMAIL, () => String)
  email?: string | null

  @PiiField(PiiCategory.EMAIL, () => String)
  altEmail?: string | null

  @Field(() => Boolean)
  emailVerified: boolean

  @Field(() => UserTier, { defaultValue: UserTier.FREE })
  tier: UserTier

  @Field(() => Boolean)
  completedOnboarding: boolean

  @Field(() => String, { defaultValue: UserRole.USER })
  role: UserRole

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => Date)
  lastActiveAt: Date

  // deletedAt deliberately not exposed
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  email: text('email').unique(),
  altEmail: text('alt_email'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationTokenExpiresAt: timestamp('email_verification_token_expires_at', {
    withTimezone: true,
  }),
  passwordResetToken: text('password_reset_token'),
  passwordResetTokenExpiresAt: timestamp('password_reset_token_expires_at', { withTimezone: true }),
  tier: text('tier').$type<UserTier>().default(UserTier.FREE).notNull(),
  completedOnboarding: boolean('completed_onboarding').default(false).notNull(),
  role: text('role').$type<UserRole>().default(UserRole.USER).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
  passwordHash: text('password_hash'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
