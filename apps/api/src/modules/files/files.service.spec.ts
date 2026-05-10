import { Test, TestingModule } from '@nestjs/testing'
import { FilesService } from './files.service'
import { DRIZZLE } from '../../databases'
import { LoggerService } from '../logger'
import { StorageService } from './interfaces/storage-service.interface'
import { ImageService } from './image.service'

describe('FilesService', () => {
  let service: FilesService
  let mockDb: any
  let mockStorage: any
  let mockImages: any

  const mockFile = {
    id: 1,
    userId: 1,
    organizationId: null,
    key: 'avatars/uuid123.jpg',
    originalName: 'photo.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    width: 400,
    height: 400,
    folder: 'avatars',
    createdAt: new Date(),
  }

  beforeEach(async () => {
    mockDb = {}
    mockStorage = { upload: jest.fn(), delete: jest.fn(), getUrl: jest.fn(), getSignedUploadUrl: jest.fn() }
    mockImages = { getInfo: jest.fn(), saveAvatar: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: LoggerService, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn() } },
        { provide: StorageService, useValue: mockStorage },
        { provide: ImageService, useValue: mockImages },
      ],
    }).compile()

    service = module.get<FilesService>(FilesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('upload', () => {
    it('should store the file and create a DB record', async () => {
      mockImages.getInfo.mockResolvedValue({ width: 400, height: 400 })
      mockImages.saveAvatar.mockResolvedValue({ buffer: Buffer.from('img'), thumbnail: Buffer.from('thumb') })
      mockStorage.upload.mockResolvedValue({ key: 'avatars/uuid.jpg', url: '/url', size: 1024, mimeType: 'image/jpeg' })
      mockDb.insert = jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockFile]),
        }),
      })

      const result = await service.upload(1, Buffer.from('data'), 'photo.jpg', 'image/jpeg', 'avatars')
      expect(result.id).toBe(1)
    })
  })

  describe('findByUser', () => {
    it('should return files for a user', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockFile]),
        }),
      })

      const result = await service.findByUser(1)
      expect(result).toHaveLength(1)
    })
  })

  describe('findOne', () => {
    it('should return the file when found', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockFile]),
          }),
        }),
      })

      const result = await service.findOne(1)
      expect(result).toEqual(mockFile)
    })

    it('should throw when not found', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      await expect(service.findOne(999)).rejects.toThrow()
    })
  })

  describe('delete', () => {
    it('should delete the file record and storage', async () => {
      mockDb.select = jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockFile]),
          }),
        }),
      })
      mockStorage.delete.mockResolvedValue(undefined)
      mockDb.delete = jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(true),
      })

      const result = await service.delete(1, 1)
      expect(result).toBe(true)
      expect(mockStorage.delete).toHaveBeenCalledWith(mockFile.key)
    })
  })
})
