import { Test, TestingModule } from '@nestjs/testing'

import { AppNewsArticlesService } from './app-news-articles.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../../modules/logger'

describe('AppNewsArticlesService', () => {
  let service: AppNewsArticlesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppNewsArticlesService,
        { provide: DRIZZLE, useValue: {} },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
      ],
    }).compile()

    service = module.get<AppNewsArticlesService>(AppNewsArticlesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
