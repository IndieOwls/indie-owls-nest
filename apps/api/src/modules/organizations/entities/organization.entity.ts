import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

@ObjectType()
export class Organization {
  @Field(() => Int)
  id!: number

  @Field(() => String)
  name: string

  @Field(() => String)
  slug: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type OrganizationRow = typeof organizations.$inferSelect
export type NewOrganizationRow = typeof organizations.$inferInsert
