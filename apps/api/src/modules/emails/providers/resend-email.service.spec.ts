import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { ResendEmailService } from './resend-email.service'

describe('ResendEmailService', () => {
  let service: ResendEmailService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendEmailService,
        { provide: ConfigService, useValue: { get: jest.fn(() => '') } }, // no API key
      ],
    }).compile()

    service = module.get<ResendEmailService>(ResendEmailService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('send', () => {
    it('should log instead of sending when no API key is configured', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      await service.send({ to: 'test@test.com', subject: 'Hi', html: '<p>Hi</p>' })
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
