import { ObjectType, Field, Int, ID } from '@nestjs/graphql'
import { pgTable, serial, integer, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

import { User, users } from '../../../users/entities/user.entity'

@ObjectType()
export class AuditEvent {
  @Field(() => ID)
  id!: number

  @Field(() => Int, { nullable: true })
  actorId?: number | null

  @Field(() => String)
  action: string

  @Field(() => String)
  resource: string

  @Field(() => String, { nullable: true })
  resourceId?: string | null

  @Field(() => String, { nullable: true })
  description?: string | null

  @Field(() => String, { nullable: true })
  ipAddress?: string | null

  @Field(() => Date)
  createdAt: Date
}

export const auditEvents = pgTable('audit_events', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => users.id),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'),
  description: text('description'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type AuditEventRow = typeof auditEvents.$inferSelect
export type NewAuditEventRow = typeof auditEvents.$inferInsert
