import { Field, Int, ObjectType } from '@nestjs/graphql'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { User, users } from '../../../users/entities/user.entity'
import { AccessBanReasonType, AccessBanType } from '../dto'
import type { BannedBy } from '../dto'

@ObjectType()
export class AccessBan {
  @Field(() => Int)
  userId: User['id']

  @Field(() => String)
  bannedBy: BannedBy

  @Field(() => String)
  reasonType: AccessBanReasonType

  @Field(() => String, { nullable: true })
  reason?: string | null

  @Field(() => String, { defaultValue: AccessBanType.TEMPORARY })
  type: AccessBanType

  @Field(() => Date, { nullable: true })
  expiresAt?: Date | null

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

export const accessBans = pgTable('access_bans', {
  userId: integer('user_id')
    .primaryKey()
    .references(() => users.id),
  bannedBy: text('banned_by').notNull(),
  type: text('type').$type<AccessBanType>().default(AccessBanType.TEMPORARY).notNull(),
  reasonType: text('reason_type').$type<AccessBanReasonType>().notNull(),
  reason: text('reason'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type AccessBanRow = typeof accessBans.$inferSelect
export type NewAccessBanRow = typeof accessBans.$inferInsert
