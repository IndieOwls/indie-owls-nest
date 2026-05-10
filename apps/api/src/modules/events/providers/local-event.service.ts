import { Injectable } from '@nestjs/common'
import { EventEmitter } from 'events'

import { EventService, EventHandler } from '../interfaces/event-service.interface'

@Injectable()
export class LocalEventService extends EventService {
  private readonly emitter = new EventEmitter()

  async emit(event: string, payload?: any): Promise<void> {
    this.emitter.emit(event, payload)
  }

  on(event: string, handler: EventHandler): void {
    this.emitter.on(event, handler)
  }

  once(event: string, handler: EventHandler): void {
    this.emitter.once(event, handler)
  }

  off(event: string, handler: EventHandler): void {
    this.emitter.off(event, handler)
  }

  removeAllListeners(event?: string): void {
    this.emitter.removeAllListeners(event)
  }
}
