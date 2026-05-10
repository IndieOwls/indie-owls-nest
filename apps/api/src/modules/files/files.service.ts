import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { extname } from 'path'
import crypto from 'crypto'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { LoggerService } from '../logger'

import { StorageService } from './interfaces/storage-service.interface'
import { ImageService } from './image.service'
import { File, files } from './entities/file.entity'

@Injectable()
export class FilesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly storage: StorageService,
    private readonly images: ImageService,
    private readonly logger: LoggerService,
  ) {}

  async upload(
    userId: number,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string,
    organizationId?: number,
  ): Promise<File> {
    try {
      const ext = extname(originalName)
      const key = `${folder}/${crypto.randomUUID()}${ext}`

      // Detect image dimensions
      const info = mimeType.startsWith('image/') ? await this.images.getInfo(buffer) : null

      // If it's an avatar, process it
      let uploadBuffer = buffer
      if (folder === 'avatars') {
        const processed = await this.images.saveAvatar(buffer)
        uploadBuffer = processed.buffer
        // Also save thumbnail
        const thumbKey = `${folder}/thumb_${crypto.randomUUID()}${ext}`
        await this.storage.upload(thumbKey, processed.thumbnail, mimeType).catch((err) =>
          this.logger.warn(`Thumbnail upload failed: ${err}`, 'FilesService'),
        )
      }

      const result = await this.storage.upload(key, uploadBuffer, mimeType)

      const [file] = await this.db
        .insert(files)
        .values({
          userId,
          organizationId: organizationId ?? null,
          key,
          originalName,
          mimeType,
          size: result.size,
          width: info?.width ?? null,
          height: info?.height ?? null,
          folder,
        })
        .returning()

      return file
    } catch (err: any) {
      this.logger.error('Error uploading file:', err)
      throw new InternalServerErrorException('Failed to upload file')
    }
  }

  async findByUser(userId: number): Promise<File[]> {
    return this.db.select().from(files).where(eq(files.userId, userId))
  }

  async findOne(id: number): Promise<File> {
    const [file] = await this.db.select().from(files).where(eq(files.id, id)).limit(1)
    if (!file) throw new NotFoundException(`File ${id} not found`)
    return file
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const file = await this.findOne(id)
    if (file.userId !== userId) {
      throw new NotFoundException(`File ${id} not found`)
    }
    await this.storage.delete(file.key)
    await this.db.delete(files).where(eq(files.id, id))
    return true
  }

  generateKey(originalName: string, folder: string): string {
    const ext = extname(originalName)
    return `${folder}/${crypto.randomUUID()}${ext}`
  }

  async getSignedUploadUrl(
    originalName: string,
    mimeType: string,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    const key = this.generateKey(originalName, folder)
    const result = await this.storage.getSignedUploadUrl(key, mimeType)
    return { url: result.url, key }
  }

  async confirmUpload(
    userId: number,
    key: string,
    originalName: string,
    mimeType: string,
    folder: string,
    organizationId?: number,
    size?: number,
  ): Promise<File> {
    try {
      const url = this.storage.getUrl(key)
      // For local dev, try to read file info from local storage
      let width: number | null = null
      let height: number | null = null

      const [file] = await this.db
        .insert(files)
        .values({
          userId,
          organizationId: organizationId ?? null,
          key,
          originalName,
          mimeType,
          size: size ?? 0,
          width,
          height,
          folder,
        })
        .returning()

      return file
    } catch (err: any) {
      this.logger.error('Error confirming file upload:', err)
      throw new InternalServerErrorException('Failed to confirm file upload')
    }
  }
}
