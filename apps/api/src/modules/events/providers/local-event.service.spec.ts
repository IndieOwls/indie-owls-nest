import { Test, TestingModule } from '@nestjs/testing'
import { LocalEventService } from './local-event.service'

describe('LocalEventService', () => {
  let service: LocalEventService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalEventService],
    }).compile()

    service = module.get<LocalEventService>(LocalEventService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('emit / on', () => {
    it('should call listeners when an event is emitted', async () => {
      const handler = jest.fn()
      service.on('test:event', handler)

      await service.emit('test:event', { data: 123 })
      expect(handler).toHaveBeenCalledWith({ data: 123 })
    })

    it('should not call listeners for different events', async () => {
      const handler = jest.fn()
      service.on('event:a', handler)

      await service.emit('event:b', {})
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('once', () => {
    it('should only fire once', async () => {
      const handler = jest.fn()
      service.once('only-once', handler)

      await service.emit('only-once', 1)
      await service.emit('only-once', 2)
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('off', () => {
    it('should remove a listener', async () => {
      const handler = jest.fn()
      service.on('ev', handler)
      service.off('ev', handler)

      await service.emit('ev', {})
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('removeAllListeners', () => {
    it('should remove all listeners for an event', async () => {
      const a = jest.fn()
      const b = jest.fn()
      service.on('ev', a)
      service.on('ev', b)
      service.removeAllListeners('ev')

      await service.emit('ev', {})
      expect(a).not.toHaveBeenCalled()
      expect(b).not.toHaveBeenCalled()
    })
  })
})
