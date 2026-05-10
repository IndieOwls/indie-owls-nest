import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core'

import { DataRequestStatus, DataRequestType } from '../dto'
import { User, users } from '../../../users/entities/user.entity'
import { PiiCategory } from '../../pii'
import { PiiField } from '../../../common/decorators'

@ObjectType()
export class DataRequest {
  @Field(() => Int)
  id!: number

  @PiiField(PiiCategory.IDENTIFIER, () => Int, { nullable: true })
  userId?: User['id']

  // Value for when the user is deleted but we want to keep the data request for record-keeping
  @PiiField(PiiCategory.EMAIL, () => String)
  userEmail: string

  @Field(() => String)
  type: DataRequestType

  @Field(() => String, { defaultValue: DataRequestStatus.PENDING })
  status?: DataRequestStatus

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}

export const dataRequests = pgTable('data_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  userEmail: text('user_email').notNull(),
  type: text('type').$type<DataRequestType>().notNull(),
  status: text('status').$type<DataRequestStatus>().default(DataRequestStatus.PENDING).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export type DataRequestRow = typeof dataRequests.$inferSelect
export type NewDataRequestRow = typeof dataRequests.$inferInsert
