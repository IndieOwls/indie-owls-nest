import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'

import { organizations } from '../../organizations/entities/organization.entity'
import { SubscriptionTier } from '../dto/subscription-tier.enum'
import { SubscriptionStatus } from '../dto/subscription-status.enum'

@ObjectType()
export class Subscription {
  @Field(() => Int)
  id!: number

  @Field(() => Int)
  organizationId: number

  @Field(() => String)
  stripeCustomerId: string

  @Field(() => String)
  stripeSubscriptionId: string

  @Field(() => String)
  stripePriceId: string

  @Field(() => SubscriptionTier)
  tier: SubscriptionTier

  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus

  @Field(() => Date)
  currentPeriodStart: Date

  @Field(() => Date)
  currentPeriodEnd: Date

  @Field(() => Int)
  seats: number

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organizations.id),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripePriceId: text('stripe_price_id').notNull(),
  tier: text('tier').$type<SubscriptionTier>().default(SubscriptionTier.FREE).notNull(),
  status: text('status').$type<SubscriptionStatus>().default(SubscriptionStatus.ACTIVE).notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  seats: integer('seats').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type SubscriptionRow = typeof subscriptions.$inferSelect
export type NewSubscriptionRow = typeof subscriptions.$inferInsert
