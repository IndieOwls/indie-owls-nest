import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DRIZZLE } from './databases'
import { LoggerService } from './modules/logger'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: DRIZZLE, useValue: { execute: jest.fn().mockResolvedValue([[{ ok: 1 }]]) } },
        { provide: ConfigService, useValue: { get: jest.fn(() => null) } },
        { provide: LoggerService, useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() } },
      ],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('health', () => {
    it('should return health status', async () => {
      const result = await appController.getHealth()
      expect(result).toHaveProperty('status', 'ok')
      expect(result).toHaveProperty('dependencies')
      expect(result).toHaveProperty('clients')
    })
  })
})
