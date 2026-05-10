import { Test, TestingModule } from '@nestjs/testing'
import { NotificationsService } from './notifications.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../../modules/logger'

describe('NotificationsService', () => {
  let service: NotificationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: DRIZZLE, useValue: {} },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
