export interface UploadResult {
  key: string
  url: string
  size: number
  mimeType: string
}

export abstract class StorageService {
  abstract upload(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<UploadResult>

  abstract delete(key: string): Promise<void>

  abstract getUrl(key: string): string

  abstract getSignedUploadUrl(
    key: string,
    mimeType: string,
  ): Promise<{ url: string; fields?: Record<string, string> }>

  abstract getSignedDownloadUrl(key: string): Promise<string>
}
