import { Test, TestingModule } from '@nestjs/testing'
import { InMemoryCacheService } from './in-memory-cache.service'

describe('InMemoryCacheService', () => {
  let service: InMemoryCacheService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryCacheService],
    }).compile()

    service = module.get<InMemoryCacheService>(InMemoryCacheService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('set / get', () => {
    it('should store and retrieve values', async () => {
      await service.set('key1', { hello: 'world' })
      const val = await service.get('key1')
      expect(val).toEqual({ hello: 'world' })
    })

    it('should return null for missing keys', async () => {
      const val = await service.get('nonexistent')
      expect(val).toBeNull()
    })

    it('should respect TTL expiry', async () => {
      await service.set('ephemeral', 'value', 0) // 0 seconds = immediate expiry
      await new Promise((r) => setTimeout(r, 10))
      const val = await service.get('ephemeral')
      expect(val).toBeNull()
    })
  })

  describe('delete', () => {
    it('should remove a stored value', async () => {
      await service.set('key', 'value')
      await service.delete('key')
      const val = await service.get('key')
      expect(val).toBeNull()
    })
  })

  describe('eviction', () => {
    it('should evict oldest entries when over capacity', async () => {
      const small = new InMemoryCacheService(3)
      await small.set('a', 1)
      await small.set('b', 2)
      await small.set('c', 3)
      await small.set('d', 4) // exceeds maxSize 3 — evicts 'a'
      expect(await small.get('a')).toBeNull()
      expect(await small.get('b')).toBe(2)
      expect(await small.get('c')).toBe(3)
      expect(await small.get('d')).toBe(4)
    })

    it('should not evict recently accessed entries', async () => {
      const small = new InMemoryCacheService(3)
      await small.set('a', 1)
      await small.set('b', 2)
      await small.set('c', 3)
      await small.get('a') // marks 'a' as recently used
      await small.set('d', 4) // evicts 'b' instead of 'a'
      expect(await small.get('a')).toBe(1)
      expect(await small.get('b')).toBeNull()
      expect(await small.get('c')).toBe(3)
      expect(await small.get('d')).toBe(4)
    })
  })

  describe('clear', () => {
    it('should clear all values when called without pattern', async () => {
      await service.set('a', 1)
      await service.set('b', 2)
      await service.clear()
      expect(await service.get('a')).toBeNull()
      expect(await service.get('b')).toBeNull()
    })

    it('should clear values matching a pattern', async () => {
      await service.set('user:1', 'alice')
      await service.set('user:2', 'bob')
      await service.set('config', 'data')
      await service.clear('user:')
      expect(await service.get('user:1')).toBeNull()
      expect(await service.get('user:2')).toBeNull()
      expect(await service.get('config')).toBe('data')
    })
  })
})
