import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'

import { User, users } from '../../../users/entities/user.entity'

@ObjectType()
export class AppNewsArticle {
  @Field(() => Int)
  id!: number

  @Field(() => Int)
  authorId: User['id']

  @Field(() => String)
  content: string

  @Field(() => Boolean)
  isPublished: boolean

  @Field(() => String)
  title: string

  @Field(() => String, { nullable: true })
  sourceUrl?: string | null

  @Field(() => Date)
  publishedAt: Date

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null
}

export const appNewsArticles = pgTable('app_news_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  authorId: integer('author_id').references(() => users.id),
  sourceUrl: text('source_url'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export type AppNewsArticleRow = typeof appNewsArticles.$inferSelect
export type NewAppNewsArticleRow = typeof appNewsArticles.$inferInsert
