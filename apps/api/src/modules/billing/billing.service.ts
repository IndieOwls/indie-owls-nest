import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { and, eq, gte, lte, sql } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { LoggerService } from '../../modules/logger'

import { BillingService } from './interfaces/billing-service.interface'
import { StripeBillingService } from './providers/stripe-billing.service'
import { Subscription, subscriptions } from './entities/subscription.entity'
import { UsageRecord, usageRecords } from './entities/usage-record.entity'
import { SubscriptionTier, SubscriptionStatus } from './dto'

@Injectable()
export class BillingOrchestratorService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly stripe: BillingService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async createCustomer(organizationId: number, email: string, name: string): Promise<string> {
    try {
      const customer = await this.stripe.createCustomer({ email, name, metadata: { organizationId: String(organizationId) } })
      return customer.id
    } catch (err: any) {
      this.logger.error('Error creating Stripe customer:', err)
      throw new InternalServerErrorException('Failed to create billing customer')
    }
  }

  async createCheckoutSession(
    organizationId: number,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    const sub = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId))
      .limit(1)
      .then((r) => r[0])

    if (!sub) throw new InternalServerErrorException('Organization has no billing customer')

    return this.stripe.createCheckoutSession({
      customerId: sub.stripeCustomerId,
      priceId,
      successUrl,
      cancelUrl,
      metadata: { organizationId: String(organizationId) },
    })
  }

  async createPortalSession(organizationId: number, returnUrl: string) {
    const sub = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId))
      .limit(1)
      .then((r) => r[0])

    if (!sub) throw new InternalServerErrorException('Organization has no billing customer')

    return this.stripe.createPortalSession({ customerId: sub.stripeCustomerId, returnUrl })
  }

  async getSubscriptionForOrg(organizationId: number): Promise<Subscription | null> {
    const sub = await this.db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, organizationId))
      .limit(1)
      .then((r) => r[0])

    return sub ?? null
  }

  async recordUsage(organizationId: number, metric: string, value = 1): Promise<UsageRecord> {
    try {
      const [record] = await this.db.insert(usageRecords).values({ organizationId, metric, value }).returning()
      return record
    } catch (err: any) {
      this.logger.error(`Error recording usage metric "${metric}":`, err)
      throw new InternalServerErrorException('Failed to record usage')
    }
  }

  async getUsage(
    organizationId: number,
    metric: string,
    since: Date,
  ): Promise<number> {
    try {
      const [row] = await this.db
        .select({ total: sql<number>`coalesce(sum(${usageRecords.value}), 0)`.mapWith(Number) })
        .from(usageRecords)
        .where(
          and(
            eq(usageRecords.organizationId, organizationId),
            eq(usageRecords.metric, metric),
            gte(usageRecords.recordedAt, since),
          ),
        )

      return row?.total ?? 0
    } catch (err: any) {
      this.logger.error(`Error querying usage for metric "${metric}":`, err)
      throw new InternalServerErrorException('Failed to query usage')
    }
  }

  async upsertSubscription(data: {
    organizationId: number
    stripeCustomerId: string
    stripeSubscriptionId: string
    stripePriceId: string
    tier: SubscriptionTier
    status: SubscriptionStatus
    currentPeriodStart: Date
    currentPeriodEnd: Date
    seats?: number
  }): Promise<Subscription> {
    const [sub] = await this.db
      .insert(subscriptions)
      .values(data)
      .onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
        set: {
          stripePriceId: data.stripePriceId,
          tier: data.tier,
          status: data.status,
          currentPeriodStart: data.currentPeriodStart,
          currentPeriodEnd: data.currentPeriodEnd,
          seats: data.seats ?? 1,
        },
      })
      .returning()

    return sub
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await this.stripe.cancelSubscription(subscriptionId)
      await this.db
        .update(subscriptions)
        .set({ status: SubscriptionStatus.CANCELED })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
    } catch (err: any) {
      this.logger.error('Error canceling subscription:', err)
      throw new InternalServerErrorException('Failed to cancel subscription')
    }
  }
}
