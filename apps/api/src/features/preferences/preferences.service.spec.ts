import { Test, TestingModule } from '@nestjs/testing'
import { PreferencesService } from './preferences.service'
import { DRIZZLE } from '../../databases'

describe('PreferencesService', () => {
  let service: PreferencesService
  let mockDb: any

  const mockRow = {
    id: 1,
    userId: 1,
    preferences: { theme: 'dark', fontSize: 'medium' },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    mockDb = {}
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreferencesService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<PreferencesService>(PreferencesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findByUser', () => {
    it('should return preferences when they exist', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockRow]),
          }),
        }),
      })

      const result = await service.findByUser(1)
      expect(result).not.toBeNull()
      expect(result!.preferences.theme).toBe('dark')
    })

    it('should return null when no preferences exist', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await service.findByUser(1)
      expect(result).toBeNull()
    })
  })

  describe('upsert', () => {
    it('should create new preferences when none exist', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      })
      mockDb.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockRow]),
        }),
      })

      const result = await service.upsert(1, { theme: 'dark' })
      expect(result.preferences.theme).toBe('dark')
    })

    it('should merge with existing preferences on update', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockRow]),
          }),
        }),
      })
      mockDb.update = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{
              ...mockRow,
              preferences: { ...mockRow.preferences, fontSize: 'large' },
            }]),
          }),
        }),
      })

      const result = await service.upsert(1, { fontSize: 'large' })
      expect(result.preferences.fontSize).toBe('large')
      expect(result.preferences.theme).toBe('dark')
    })
  })
})
