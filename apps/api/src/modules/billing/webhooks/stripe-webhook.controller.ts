import { BadRequestException, Controller, Headers, Inject, Post, Req } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

import { DRIZZLE, type DrizzleDB } from '../../../databases'
import { LoggerService } from '../../../modules/logger'
import { API_BILLING_WEBHOOK } from '../../../constants'

import { BillingOrchestratorService } from '../billing.service'
import { subscriptions } from '../entities/subscription.entity'
import { SubscriptionTier, SubscriptionStatus } from '../dto'

@ApiTags('Billing')
@Controller(API_BILLING_WEBHOOK)
export class StripeWebhookController {
  private readonly stripe: any
  private readonly webhookSecret: string

  constructor(
    config: ConfigService,
    private readonly billing: BillingOrchestratorService,
    private readonly logger: LoggerService,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {
    const key = config.get<string>('stripe.secretKey')
    this.stripe = key ? new Stripe(key) : null
    this.webhookSecret = config.get<string>('stripe.webhookSecret') ?? ''
  }

  @ApiExcludeEndpoint()
  @Post()
  async handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: any) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header')
    if (!this.stripe) throw new BadRequestException('Stripe is not configured')

    let event: any
    try {
      const raw = req.rawBody ?? JSON.stringify(req.body)
      event = this.stripe.webhooks.constructEvent(raw, signature, this.webhookSecret)
    } catch (err: any) {
      this.logger.error('Stripe webhook signature verification failed:', err)
      throw new BadRequestException('Invalid webhook signature')
    }

    try {
      await this.handleEvent(event)
    } catch (err: any) {
      this.logger.error(`Error handling webhook event ${event.id} (${event.type}):`, err)
    }

    return { received: true }
  }

  private async handleEvent(event: { type: string; data: { object: any } }): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.resumed':
        await this.upsertFromStripe(event.data.object)
        break

      case 'customer.subscription.deleted':
        await this.updateStatus(event.data.object, SubscriptionStatus.CANCELED)
        break

      case 'invoice.payment_failed':
        await this.updateStatus(event.data.object, SubscriptionStatus.PAST_DUE)
        break
    }
  }

  private async upsertFromStripe(stripeSub: any) {
    const customerId = stripeSub.customer as string
    const priceId = stripeSub.items?.data?.[0]?.price?.id ?? ''
    const tier = this.mapTier(priceId)
    const status = this.mapStatus(stripeSub.status)

    const existing = await this.db
      .select({ organizationId: subscriptions.organizationId })
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
      .limit(1)
      .then((r) => r[0])

    if (existing) {
      await this.db
        .update(subscriptions)
        .set({
          stripePriceId: priceId,
          tier,
          status,
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        })
        .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
    } else {
      const subLookup = await this.db
        .select({ organizationId: subscriptions.organizationId })
        .from(subscriptions)
        .where(eq(subscriptions.stripeCustomerId, customerId))
        .limit(1)
        .then((r) => r[0])

      if (!subLookup) {
        this.logger.error(`No organization found for Stripe customer ${customerId}`)
        return
      }

      await this.db.insert(subscriptions).values({
        organizationId: subLookup.organizationId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSub.id,
        stripePriceId: priceId,
        tier,
        status,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      })
    }
  }

  private async updateStatus(stripeSub: any, status: SubscriptionStatus) {
    await this.db
      .update(subscriptions)
      .set({ status })
      .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id))
  }

  private mapTier(_priceId: string): SubscriptionTier {
    return SubscriptionTier.FREE
  }

  private mapStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active': return SubscriptionStatus.ACTIVE
      case 'past_due': return SubscriptionStatus.PAST_DUE
      case 'canceled': return SubscriptionStatus.CANCELED
      case 'trialing': return SubscriptionStatus.TRIALING
      case 'incomplete': return SubscriptionStatus.INCOMPLETE
      case 'incomplete_expired': return SubscriptionStatus.EXPIRED
      default: return SubscriptionStatus.ACTIVE
    }
  }
}
