import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'

import { organizations } from '../../organizations/entities/organization.entity'

@ObjectType()
export class UsageRecord {
  @Field(() => Int)
  id!: number

  @Field(() => Int)
  organizationId: number

  @Field(() => String)
  metric: string

  @Field(() => Int)
  value: number

  @Field(() => Date)
  recordedAt: Date
}

export const usageRecords = pgTable('usage_records', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organizations.id),
  metric: text('metric').notNull(),
  value: integer('value').default(1).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
})

export type UsageRecordRow = typeof usageRecords.$inferSelect
export type NewUsageRecordRow = typeof usageRecords.$inferInsert
