import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BullMqQueueService } from './bull-mq-queue.service'

describe('BullMqQueueService', () => {
  let service: BullMqQueueService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BullMqQueueService,
        { provide: ConfigService, useValue: { get: jest.fn(() => 'localhost') } },
      ],
    }).compile()

    service = module.get<BullMqQueueService>(BullMqQueueService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
