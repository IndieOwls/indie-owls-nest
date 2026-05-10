import { ObjectType, Field, Int } from '@nestjs/graphql'
import { pgTable, integer, text, timestamp, primaryKey } from 'drizzle-orm/pg-core'

import { OrganizationRole } from '../dto/organization-role.enum'
import { users } from '../../../users/entities/user.entity'
import { organizations } from './organization.entity'

@ObjectType()
export class OrganizationMember {
  @Field(() => Int)
  organizationId: number

  @Field(() => Int)
  userId: number

  @Field(() => OrganizationRole)
  role: OrganizationRole

  @Field(() => Date)
  joinedAt: Date
}

export const organizationMembers = pgTable(
  'organization_members',
  {
    organizationId: integer('organization_id')
      .notNull()
      .references(() => organizations.id),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').$type<OrganizationRole>().default(OrganizationRole.MEMBER).notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.organizationId, t.userId] }),
  }),
)

export type OrganizationMemberRow = typeof organizationMembers.$inferSelect
export type NewOrganizationMemberRow = typeof organizationMembers.$inferInsert
