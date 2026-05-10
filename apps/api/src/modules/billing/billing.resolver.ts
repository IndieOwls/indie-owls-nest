import { Inject } from '@nestjs/common'
import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql'
import { eq } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { organizationMembers } from '../../modules/organizations/entities/organization-member.entity'

import { BillingOrchestratorService } from './billing.service'
import { Subscription } from './entities/subscription.entity'
import { UsageRecord } from './entities/usage-record.entity'
import { RequiresPlan } from '../../common/decorators/requires-plan.decorator'
import { SubscriptionTier } from './dto'

@Resolver()
export class BillingResolver {
  constructor(
    private readonly billing: BillingOrchestratorService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  @Query(() => Subscription, { name: 'mySubscription', nullable: true })
  async getMySubscription(@Context() ctx: any): Promise<Subscription | null> {
    const orgId = await this.resolveOrgId(ctx)
    if (!orgId) return null
    return this.billing.getSubscriptionForOrg(orgId)
  }

  @Mutation(() => String, { nullable: true })
  async createBillingPortalSession(
    @Args('returnUrl') returnUrl: string,
    @Context() ctx: any,
  ): Promise<string | null> {
    const orgId = await this.resolveOrgId(ctx)
    if (!orgId) return null
    const session = await this.billing.createPortalSession(orgId, returnUrl)
    return session.url
  }

  @RequiresPlan(SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE)
  @Mutation(() => UsageRecord)
  async recordUsage(
    @Args('organizationId', { type: () => Int }) organizationId: number,
    @Args('metric') metric: string,
    @Args('value', { type: () => Int, nullable: true }) value?: number,
  ): Promise<UsageRecord> {
    return this.billing.recordUsage(organizationId, metric, value ?? 1)
  }

  private async resolveOrgId(ctx: any): Promise<number | null> {
    if (ctx.req?.organization?.id) return ctx.req.organization.id
    // No user context without auth — return null by default
    return null
  }
}
