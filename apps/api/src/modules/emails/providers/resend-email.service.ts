import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { EmailService, SendEmailOptions } from '../interfaces/email-service.interface'

@Injectable()
export class ResendEmailService extends EmailService {
  private readonly apiKey: string
  private readonly defaultFrom: string

  constructor(config: ConfigService) {
    super()
    this.apiKey = config.get<string>('resend.apiKey') ?? ''
    this.defaultFrom = config.get<string>('email.from') ?? 'noreply@example.com'
  }

  async send(options: SendEmailOptions): Promise<void> {
    if (!this.apiKey) {
      // In development, log instead of sending
      console.log('[ResendEmailService] No RESEND_API_KEY configured — email not sent')
      console.log(`  To: ${options.to}`)
      console.log(`  Subject: ${options.subject}`)
      return
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from ?? this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new InternalServerErrorException(`Resend API error ${res.status}: ${body}`)
    }
  }
}
