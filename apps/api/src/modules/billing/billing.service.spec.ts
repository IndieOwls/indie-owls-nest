import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BillingOrchestratorService } from './billing.service'
import { BillingService } from './interfaces/billing-service.interface'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../logger'

describe('BillingOrchestratorService', () => {
  let service: BillingOrchestratorService
  let mockDb: any
  let mockStripe: any

  beforeEach(async () => {
    mockDb = {}
    mockStripe = {
      createCustomer: jest.fn(),
      createCheckoutSession: jest.fn(),
      createPortalSession: jest.fn(),
      cancelSubscription: jest.fn(),
      getSubscription: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingOrchestratorService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: BillingService, useValue: mockStripe },
        { provide: ConfigService, useValue: { get: jest.fn(() => 'test') } },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<BillingOrchestratorService>(BillingOrchestratorService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createCustomer', () => {
    it('should create a Stripe customer and return the ID', async () => {
      mockStripe.createCustomer.mockResolvedValue({ id: 'cus_123' })

      const result = await service.createCustomer(1, 'test@test.com', 'Test')
      expect(result).toBe('cus_123')
    })
  })

  describe('getSubscriptionForOrg', () => {
    it('should return the subscription when found', async () => {
      const sub = { id: 1, organizationId: 1, status: 'ACTIVE', tier: 'FREE', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_1', stripePriceId: 'price_1', currentPeriodStart: new Date(), currentPeriodEnd: new Date(), seats: 1, createdAt: new Date(), updatedAt: new Date() }
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([sub]),
          }),
        }),
      })

      const result = await service.getSubscriptionForOrg(1)
      expect(result).not.toBeNull()
      expect(result!.organizationId).toBe(1)
    })

    it('should return null when no subscription exists', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await service.getSubscriptionForOrg(1)
      expect(result).toBeNull()
    })
  })

  describe('recordUsage', () => {
    it('should insert a usage record', async () => {
      mockDb.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 1, organizationId: 1, metric: 'api_calls', value: 5, recordedAt: new Date() }]),
        }),
      })

      await expect(service.recordUsage(1, 'api_calls', 5)).resolves.toBeDefined()
    })
  })
})
