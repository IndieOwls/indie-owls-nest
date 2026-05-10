export interface AddJobOptions {
  delay?: number
  attempts?: number
  backoff?: { type: 'fixed' | 'exponential'; delay: number }
}

export abstract class QueueService {
  abstract add<T extends Record<string, any>>(
    queue: string,
    data: T,
    options?: AddJobOptions,
  ): Promise<string>
}
