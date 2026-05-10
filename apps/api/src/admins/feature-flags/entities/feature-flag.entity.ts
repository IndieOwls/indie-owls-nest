import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core'

@ObjectType()
export class FeatureFlag {
  @Field(() => Int)
  id!: number

  @Field(() => String)
  name: string

  @Field(() => String, { nullable: true })
  description?: string | null

  @Field(() => String, { nullable: true })
  special?: string | null

  @Field(() => Boolean)
  enabled: boolean

  @Field(() => [String], { defaultValue: [] })
  allowedRoles: string[]

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

export const featureFlags = pgTable('feature_flags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  special: text('special'),
  enabled: boolean('enabled').default(false).notNull(),
  allowedRoles: text('allowed_roles').array().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type FeatureFlagRow = typeof featureFlags.$inferSelect
export type NewFeatureFlagRow = typeof featureFlags.$inferInsert
