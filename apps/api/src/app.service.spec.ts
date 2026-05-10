import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AppService } from './app.service'
import { DRIZZLE } from './databases'

describe('AppService', () => {
  let service: AppService
  let mockDb: any

  beforeEach(async () => {
    mockDb = { execute: jest.fn() }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: ConfigService, useValue: { get: jest.fn(() => null) } },
      ],
    }).compile()

    service = module.get<AppService>(AppService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getHealth', () => {
    it('should return ok when database is reachable', async () => {
      mockDb.execute.mockResolvedValue([[{ ok: 1 }]])

      const result = await service.getHealth()
      expect(result.status).toBe('ok')
      expect(result.dependencies.database.status).toBe('ok')
      expect(result.dependencies.redis.status).toBe('unavailable')
    })

    it('should return degraded when database fails', async () => {
      mockDb.execute.mockRejectedValue(new Error('Connection refused'))

      const result = await service.getHealth()
      expect(result.status).toBe('degraded')
      expect(result.dependencies.database.status).toBe('error')
    })
  })
})
