import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { eq } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { organizations } from '../../modules/organizations/entities/organization.entity'
import { organizationMembers } from '../../modules/organizations/entities/organization-member.entity'

/**
 * Resolves the current organization from `req.organization` (set by middleware)
 * or from the authenticated user's first membership.
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = this.getRequest(context)

    // If already resolved by middleware, no lookup needed
    if (req.organization) return true

    const user = req?.user
    if (!user) return true // auth not implemented yet

    const [membership] = await this.db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))
      .limit(1)

    if (!membership) return true

    const [org] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, membership.organizationId))
      .limit(1)

    if (!org) return true

    req.organization = org
    return true
  }

  private getRequest(context: ExecutionContext): any {
    if (context.getType<'graphql' | 'http'>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req
    }
    return context.switchToHttp().getRequest()
  }
}
