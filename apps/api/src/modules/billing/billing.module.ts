import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { DatabaseModule } from '../../databases/database.module'
import { LoggerModule } from '../../modules/logger/logger.module'

import { BillingService } from './interfaces/billing-service.interface'
import { StripeBillingService } from './providers/stripe-billing.service'
import { BillingOrchestratorService } from './billing.service'
import { BillingResolver } from './billing.resolver'
import { StripeWebhookController } from './webhooks/stripe-webhook.controller'
import { SubscriptionGuard } from '../../common/guards/subscription.guard'

@Module({
  imports: [ConfigModule, DatabaseModule, LoggerModule],
  controllers: [StripeWebhookController],
  providers: [
    { provide: BillingService, useClass: StripeBillingService },
    BillingOrchestratorService,
    BillingResolver,
    SubscriptionGuard,
  ],
  exports: [BillingOrchestratorService, SubscriptionGuard],
})
export class BillingModule {}
