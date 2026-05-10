import { Test, TestingModule } from '@nestjs/testing'
import { CompliancePiiService } from './compliance-pii.service'
import { DRIZZLE } from '../../databases'

describe('CompliancePiiService', () => {
  let service: CompliancePiiService
  let mockDb: any

  beforeEach(async () => {
    mockDb = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompliancePiiService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<CompliancePiiService>(CompliancePiiService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('collectPii', () => {
    it('should return a PII report with consolidated fields', async () => {
      mockDb.select = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockImplementation(() => ({
          where: jest.fn().mockImplementation(() => ({
            limit: jest.fn().mockResolvedValue([{ id: 1, email: 'user@test.com' }]),
          })),
        })),
      }))

      const result = await service.collectPii(1)
      expect(result.userId).toBe(1)
      expect(result.consolidated).toBeDefined()
    })
  })

  describe('anonymizePii', () => {
    it('should collect PII, nullify fields, and soft-delete the user', async () => {
      mockDb.select = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockImplementation(() => ({
          where: jest.fn().mockImplementation(() => ({
            limit: jest.fn().mockResolvedValue([{ id: 1, email: 'user@test.com' }]),
          })),
        })),
      }))
      mockDb.update = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(true),
        }),
      })
      mockDb.delete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(true),
      })

      const result = await service.anonymizePii(1)
      expect(result.userId).toBe(1)
    })
  })
})
