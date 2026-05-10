import { Test, TestingModule } from '@nestjs/testing'
import { AccessBansService } from './access-bans.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../../modules/logger'

describe('AccessBansService', () => {
  let service: AccessBansService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessBansService,
        { provide: DRIZZLE, useValue: {} },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<AccessBansService>(AccessBansService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
