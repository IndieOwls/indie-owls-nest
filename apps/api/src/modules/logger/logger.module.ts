import { Global, Module } from '@nestjs/common'

import { LoggerService } from './services/logger.service'
import { ConsoleLoggerService } from './services/console-logger.service'

/**
 * To swap to a different provider (Pino, Datadog, etc.), change `useClass`
 * in the provider definition below. Every consumer injects `LoggerService`
 * — no other file needs to change.
 */
@Global()
@Module({
  providers: [{ provide: LoggerService, useClass: ConsoleLoggerService }],
  exports: [LoggerService],
})
export class LoggerModule {}
