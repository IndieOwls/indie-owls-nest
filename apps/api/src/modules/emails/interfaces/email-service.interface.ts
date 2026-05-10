export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export abstract class EmailService {
  abstract send(options: SendEmailOptions): Promise<void>
}
