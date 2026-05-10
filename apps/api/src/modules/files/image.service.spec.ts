import { Test, TestingModule } from '@nestjs/testing'
import { ImageService } from './image.service'

describe('ImageService', () => {
  let service: ImageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageService],
    }).compile()

    service = module.get<ImageService>(ImageService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getInfo', () => {
    it('should return null for invalid image data', async () => {
      const result = await service.getInfo(Buffer.from('not-an-image'))
      expect(result).toBeNull()
    })
  })

  describe('resize', () => {
    it('should throw for invalid input', async () => {
      await expect(service.resize(Buffer.from('bad'), { width: 100 })).rejects.toThrow()
    })
  })

  describe('generateThumbnail', () => {
    it('should throw for invalid input', async () => {
      await expect(service.generateThumbnail(Buffer.from('bad'))).rejects.toThrow()
    })
  })
})
