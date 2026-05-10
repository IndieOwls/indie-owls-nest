import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'

import { QueueService, AddJobOptions } from '../interfaces/queue-service.interface'

@Injectable()
export class BullMqQueueService extends QueueService {
  private readonly connection: { host: string; port: number }
  private queues = new Map<string, Queue>()

  constructor(config: ConfigService) {
    super()
    this.connection = {
      host: config.get<string>('redis.host') ?? 'localhost',
      port: config.get<number>('redis.port') ?? 6379,
    }
  }

  async add<T extends Record<string, any>>(
    queue: string,
    data: T,
    options?: AddJobOptions,
  ): Promise<string> {
    const q = this.getOrCreateQueue(queue)
    const job = await q.add(queue, data, {
      attempts: options?.attempts ?? 3,
      backoff: options?.backoff ?? { type: 'exponential', delay: 2000 },
      delay: options?.delay,
      removeOnComplete: { age: 3600 * 24 },
      removeOnFail: { age: 3600 * 24 * 7 },
    })
    return job.id ?? ''
  }

  private getOrCreateQueue(name: string): Queue {
    let q = this.queues.get(name)
    if (!q) {
      q = new Queue(name, { connection: this.connection })
      this.queues.set(name, q)
    }
    return q
  }
}
