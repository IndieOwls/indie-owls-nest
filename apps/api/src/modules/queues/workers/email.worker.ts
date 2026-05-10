import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { EmailService } from '../../emails'

export interface EmailJobData {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

@Processor('email')
export class EmailWorker extends WorkerHost {
  constructor(private readonly email: EmailService) {
    super()
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    await this.email.send(job.data)
  }
}
