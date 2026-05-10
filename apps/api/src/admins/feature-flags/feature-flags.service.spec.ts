import { Test, TestingModule } from '@nestjs/testing'
import { FeatureFlagsService } from './feature-flags.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../../modules/logger'

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsService,
        { provide: DRIZZLE, useValue: {} },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<FeatureFlagsService>(FeatureFlagsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
