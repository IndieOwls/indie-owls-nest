import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { eq } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { organizationMembers } from '../../modules/organizations/entities/organization-member.entity'

import { SubscriptionTier, SubscriptionStatus } from '../../modules/billing/dto'
import { REQUIRED_PLAN_KEY } from '../decorators/requires-plan.decorator'
import { BillingOrchestratorService } from '../../modules/billing/billing.service'

const TIER_ORDER: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.PRO]: 1,
  [SubscriptionTier.ENTERPRISE]: 2,
}

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly billing: BillingOrchestratorService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<SubscriptionTier[]>(REQUIRED_PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required?.length) return true

    const req = this.getRequest(context)
    const user = req?.user
    if (!user) return true // auth not implemented yet

    const organizationId = await this.resolveOrganizationId(req, user)
    if (!organizationId) {
      throw new ForbiddenException('No organization found for subscription check')
    }

    const sub = await this.billing.getSubscriptionForOrg(organizationId)
    if (!sub) throw new ForbiddenException('No active subscription')

    if (sub.status !== SubscriptionStatus.ACTIVE && sub.status !== SubscriptionStatus.TRIALING) {
      throw new ForbiddenException('Subscription is not active')
    }

    const userTier = TIER_ORDER[sub.tier] ?? -1
    const minRequired = Math.min(...required.map((t) => TIER_ORDER[t] ?? Infinity))

    if (userTier < minRequired) {
      const sorted = [...required].sort((a, b) => TIER_ORDER[a] - TIER_ORDER[b])
      throw new ForbiddenException(`This action requires at least the ${sorted[0]} plan`)
    }

    return true
  }

  private async resolveOrganizationId(req: any, user: any): Promise<number | null> {
    if (req.organization?.id) return req.organization.id

    const [membership] = await this.db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id))
      .limit(1)

    return membership?.organizationId ?? null
  }

  private getRequest(context: ExecutionContext): any {
    if (context.getType<'graphql' | 'http'>() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req
    }
    return context.switchToHttp().getRequest()
  }
}
