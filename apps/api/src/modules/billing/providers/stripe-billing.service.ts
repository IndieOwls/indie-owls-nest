import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'

import { BillingService, CreateCustomerInput, CreateCheckoutSessionInput, CreatePortalSessionInput } from '../interfaces/billing-service.interface'

@Injectable()
export class StripeBillingService extends BillingService {
  private readonly stripe: any

  constructor(config: ConfigService) {
    super()
    const key = config.get<string>('stripe.secretKey')
    this.stripe = key ? new Stripe(key) : null
  }

  private get client(): any {
    if (!this.stripe) throw new InternalServerErrorException('Stripe is not configured (STRIPE_SECRET_KEY is missing)')
    return this.stripe
  }

  async createCustomer(input: CreateCustomerInput): Promise<{ id: string }> {
    const customer = await this.client.customers.create({
      email: input.email,
      name: input.name,
      metadata: input.metadata,
    })
    return { id: customer.id }
  }

  async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<{ url: string | null }> {
    const session = await this.client.checkout.sessions.create({
      customer: input.customerId,
      mode: 'subscription',
      line_items: [{ price: input.priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: input.metadata,
    })
    return { url: session.url }
  }

  async createPortalSession(input: CreatePortalSessionInput): Promise<{ url: string }> {
    const session = await this.client.billingPortal.sessions.create({
      customer: input.customerId,
      return_url: input.returnUrl,
    })
    return { url: session.url }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.client.subscriptions.cancel(subscriptionId)
  }

  async getSubscription(subscriptionId: string) {
    const sub: any = await this.client.subscriptions.retrieve(subscriptionId)
    return {
      id: sub.id,
      status: sub.status,
      items: sub.items.data.map((item: any) => ({
        price: { id: item.price.id },
      })),
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      metadata: sub.metadata,
    }
  }
}
