import { ObjectType, Field, Int, ID } from '@nestjs/graphql'
import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'

import { User, users } from '../../../users/entities/user.entity'

@ObjectType()
export class File {
  @Field(() => ID)
  id!: number

  @Field(() => Int)
  userId: number

  @Field(() => Int, { nullable: true })
  organizationId?: number | null

  @Field(() => String)
  key: string

  @Field(() => String)
  originalName: string

  @Field(() => String)
  mimeType: string

  @Field(() => Int)
  size: number

  @Field(() => Int, { nullable: true })
  width?: number | null

  @Field(() => Int, { nullable: true })
  height?: number | null

  @Field(() => String)
  folder: string

  @Field(() => Date)
  createdAt: Date
}

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  organizationId: integer('organization_id'),
  key: text('key').notNull().unique(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  folder: text('folder').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type FileRow = typeof files.$inferSelect
export type NewFileRow = typeof files.$inferInsert
