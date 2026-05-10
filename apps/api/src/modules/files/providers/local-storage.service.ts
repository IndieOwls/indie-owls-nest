import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mkdir, unlink, writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

import { StorageService, UploadResult } from '../interfaces/storage-service.interface'

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly basePath: string
  private readonly baseUrl: string

  constructor(config: ConfigService) {
    super()
    this.basePath = config.get<string>('storage.local.path') ?? join(process.cwd(), 'uploads')
    this.baseUrl = config.get<string>('app.url') ?? 'http://localhost:3000'
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
    const filePath = join(this.basePath, key)
    const dir = dirname(filePath)

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    await writeFile(filePath, buffer)

    return {
      key,
      url: this.getUrl(key),
      size: buffer.length,
      mimeType,
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.basePath, key)
    if (existsSync(filePath)) {
      await unlink(filePath)
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`
  }

  async getSignedUploadUrl(
    key: string,
    _mimeType: string,
  ): Promise<{ url: string; fields?: Record<string, string> }> {
    // Local dev: direct upload via the API endpoint
    return { url: `${this.baseUrl}/api/file/upload/${key}` }
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    return this.getUrl(key)
  }
}
