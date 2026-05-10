// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventHandler = (payload: any) => void | Promise<void>

export abstract class EventService {
  abstract emit(event: string, payload?: any): Promise<void>

  abstract on(event: string, handler: EventHandler): void

  abstract once(event: string, handler: EventHandler): void

  abstract off(event: string, handler: EventHandler): void

  abstract removeAllListeners(event?: string): void
}
