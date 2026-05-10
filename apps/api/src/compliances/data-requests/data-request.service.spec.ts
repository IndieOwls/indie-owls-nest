import { Test, TestingModule } from '@nestjs/testing'
import { DataRequestService } from './data-request.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../../modules/logger'
import { DataRequestType } from './dto'

describe('DataRequestService', () => {
  let service: DataRequestService
  let mockDb: any

  const mockRequest = {
    id: 1,
    userId: 1,
    userEmail: 'user@test.com',
    type: DataRequestType.ACCESS,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    mockDb = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataRequestService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<DataRequestService>(DataRequestService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should insert and return a data request', async () => {
      mockDb.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockRequest]),
        }),
      })

      const result = await service.create({ userId: 1, userEmail: 'user@test.com', type: DataRequestType.ACCESS })
      expect(result).toEqual(mockRequest)
    })
  })

  describe('findAll', () => {
    it('should return all requests', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockResolvedValue([mockRequest]),
      })

      const result = await service.findAll()
      expect(result).toHaveLength(1)
    })
  })

  describe('findOne', () => {
    it('should return the request when found', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockRequest]),
        }),
      })

      const result = await service.findOne(1)
      expect(result).toEqual(mockRequest)
    })

    it('should throw when not found', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      })

      await expect(service.findOne(999)).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('should delete and return true', async () => {
      mockDb.delete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(true),
      })

      const result = await service.remove(1)
      expect(result).toBe(true)
    })
  })
})
