export interface CreateCustomerInput {
  email: string
  name: string
  metadata?: Record<string, string>
}

export interface CreateCheckoutSessionInput {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export interface CreatePortalSessionInput {
  customerId: string
  returnUrl: string
}

export abstract class BillingService {
  abstract createCustomer(input: CreateCustomerInput): Promise<{ id: string }>
  abstract createCheckoutSession(input: CreateCheckoutSessionInput): Promise<{ url: string | null }>
  abstract createPortalSession(input: CreatePortalSessionInput): Promise<{ url: string }>
  abstract cancelSubscription(subscriptionId: string): Promise<void>
  abstract getSubscription(subscriptionId: string): Promise<{
    id: string
    status: string
    items: { price: { id: string } }[]
    currentPeriodStart: number
    currentPeriodEnd: number
    metadata: Record<string, string>
  }>
}
