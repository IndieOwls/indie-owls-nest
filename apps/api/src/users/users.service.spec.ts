import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { DRIZZLE } from '../databases'
import { LoggerService } from '../modules/logger'
import { CacheService } from '../modules/cache'

describe('UsersService', () => {
  let service: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DRIZZLE, useValue: {} },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
        { provide: CacheService, useValue: { get: jest.fn(), set: jest.fn(), delete: jest.fn() } },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
