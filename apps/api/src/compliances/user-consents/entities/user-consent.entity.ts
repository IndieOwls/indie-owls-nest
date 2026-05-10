import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, integer, text, boolean, timestamp } from 'drizzle-orm/pg-core'

import { User, users } from '../../../users/entities/user.entity'
import { ConsentType } from '../dto'

@ObjectType()
export class UserConsent {
  @Field(() => Int)
  id: number

  @Field(() => Int)
  userId: User['id']

  @Field(() => ConsentType)
  consentType: ConsentType

  @Field(() => Boolean)
  granted: boolean

  @Field(() => Date)
  grantedAt: Date

  @Field(() => Date, { nullable: true })
  revokedAt?: Date | null
}

export const userConsents = pgTable('user_consents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  consentType: text('consent_type').$type<ConsentType>().notNull(),
  granted: boolean('granted').notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})

export type UserConsentRow = typeof userConsents.$inferSelect
export type NewUserConsentRow = typeof userConsents.$inferInsert
