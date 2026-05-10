import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand as PutObjectCommandPresigner } from '@aws-sdk/client-s3'

import { StorageService, UploadResult } from '../interfaces/storage-service.interface'

@Injectable()
export class S3StorageService extends StorageService {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly baseUrl: string
  private readonly region: string

  constructor(config: ConfigService) {
    super()
    this.bucket = config.get<string>('s3.bucket') ?? ''
    this.region = config.get<string>('s3.region') ?? 'us-east-1'
    this.baseUrl = config.get<string>('s3.baseUrl') ?? `https://${this.bucket}.s3.${this.region}.amazonaws.com`

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.get<string>('s3.accessKeyId') ?? '',
        secretAccessKey: config.get<string>('s3.secretAccessKey') ?? '',
      },
    })
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    )

    return {
      key,
      url: this.getUrl(key),
      size: buffer.length,
      mimeType,
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`
  }

  async getSignedUploadUrl(
    key: string,
    mimeType: string,
  ): Promise<{ url: string; fields?: Record<string, string> }> {
    const command = new PutObjectCommandPresigner({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    })

    const url = await getSignedUrl(this.client, command, { expiresIn: 3600 })
    return { url }
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    const command = new PutObjectCommandPresigner({
      Bucket: this.bucket,
      Key: key,
    })
    return getSignedUrl(this.client, command, { expiresIn: 3600 })
  }
}
