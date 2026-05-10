export interface ComponentStatus {
  status: 'ok' | 'unavailable' | 'error'
  latencyMs?: number
  message?: string
}

export interface HealthResult {
  status: 'ok' | 'degraded'
  uptime: number
  timestamp: string
  env: string
  dependencies: {
    database: ComponentStatus
    redis: ComponentStatus
  }
  clients: {
    web: ComponentStatus
    admin: ComponentStatus
  }
}
