import { Global, Module } from '@nestjs/common'

import { EventService } from './interfaces/event-service.interface'
import { LocalEventService } from './providers/local-event.service'

@Global()
@Module({
  providers: [{ provide: EventService, useClass: LocalEventService }],
  exports: [EventService],
})
export class EventModule {}
