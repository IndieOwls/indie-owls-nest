import { Test, TestingModule } from '@nestjs/testing'
import { UserConsentsService } from './user-consents.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../../modules/logger'

describe('UserConsentsService', () => {
  let service: UserConsentsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserConsentsService,
        { provide: DRIZZLE, useValue: {} },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<UserConsentsService>(UserConsentsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
