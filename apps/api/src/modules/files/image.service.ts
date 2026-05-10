import { Injectable } from '@nestjs/common'
import sharp from 'sharp'

export interface ResizeOptions {
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export interface ImageInfo {
  width: number
  height: number
}

@Injectable()
export class ImageService {
  async getInfo(buffer: Buffer): Promise<ImageInfo | null> {
    try {
      const meta = await sharp(buffer).metadata()
      return meta.width && meta.height ? { width: meta.width, height: meta.height } : null
    } catch {
      return null
    }
  }

  async resize(buffer: Buffer, options: ResizeOptions): Promise<Buffer> {
    return sharp(buffer)
      .resize({
        width: options.width,
        height: options.height,
        fit: options.fit ?? 'cover',
        withoutEnlargement: true,
      })
      .toBuffer()
  }

  async generateThumbnail(buffer: Buffer, size = 200): Promise<Buffer> {
    return sharp(buffer)
      .resize(size, size, { fit: 'cover', withoutEnlargement: true })
      .toBuffer()
  }

  async saveAvatar(buffer: Buffer): Promise<{ buffer: Buffer; thumbnail: Buffer }> {
    const resized = await this.resize(buffer, { width: 400, height: 400, fit: 'cover' })
    const thumbnail = await this.generateThumbnail(resized, 64)
    return { buffer: resized, thumbnail }
  }
}
