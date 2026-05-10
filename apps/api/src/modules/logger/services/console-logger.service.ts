import { Injectable } from '@nestjs/common'
import { LoggerService } from './logger.service'

@Injectable()
export class ConsoleLoggerService extends LoggerService {
  log(message: string, context?: string): void {
    console.log(this.format('LOG', message, context))
  }

  error(message: string, trace?: string, context?: string): void {
    console.error(this.format('ERROR', message, context))
    if (trace) console.error(trace)
  }

  warn(message: string, context?: string): void {
    console.warn(this.format('WARN', message, context))
  }

  debug(message: string, context?: string): void {
    console.debug(this.format('DEBUG', message, context))
  }

  verbose(message: string, context?: string): void {
    console.log(this.format('VERBOSE', message, context))
  }

  private format(level: string, message: string, context?: string): string {
    const ctx = context ? `[${context}]` : ''
    const timestamp = new Date().toISOString()
    return `${timestamp}  ${level}  ${ctx} ${message}`.trim()
  }
}
