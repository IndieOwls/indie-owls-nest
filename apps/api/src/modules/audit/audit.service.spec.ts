import { Test, TestingModule } from '@nestjs/testing'
import { AuditService } from './audit.service'
import { DRIZZLE } from '../../databases'

describe('AuditService', () => {
  let service: AuditService
  let mockDb: any

  const mockEvent = {
    id: 1,
    actorId: 1,
    action: 'CREATE',
    resource: 'User',
    resourceId: '1',
    metadata: null,
    description: 'createUser #1',
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
  }

  beforeEach(async () => {
    mockDb = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<AuditService>(AuditService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('log', () => {
    it('should insert an audit event and return it', async () => {
      mockDb.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockEvent]),
        }),
      })

      const result = await service.log({
        actorId: 1,
        action: 'CREATE',
        resource: 'User',
        resourceId: '1',
        description: 'createUser #1',
        ipAddress: '127.0.0.1',
      })

      expect(result).toEqual(mockEvent)
    })
  })

  describe('findByResource', () => {
    it('should return events filtered by resource', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([mockEvent]),
          }),
        }),
      })

      const result = await service.findByResource('User', '1')
      expect(result).toHaveLength(1)
    })
  })

  describe('findAll', () => {
    it('should return paginated events', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              offset: jest.fn().mockResolvedValue([mockEvent]),
            }),
          }),
        }),
      })

      const result = await service.findAll(10, 0)
      expect(result).toHaveLength(1)
    })
  })
})
