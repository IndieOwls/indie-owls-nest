import { Injectable } from '@nestjs/common'
import { CacheService } from '../cache'

const MAINTENANCE_KEY = 'maintenance:mode'

@Injectable()
export class MaintenanceService {
  constructor(private readonly cache: CacheService) {}

  async enable(): Promise<void> {
    // 1-hour TTL as a safety net — if disable() never gets called (crash), the
    // lock auto-releases rather than permanently blocking traffic.
    await this.cache.set(MAINTENANCE_KEY, true, 3600)
  }

  async disable(): Promise<void> {
    await this.cache.delete(MAINTENANCE_KEY)
  }

  async isEnabled(): Promise<boolean> {
    const val = await this.cache.get<boolean>(MAINTENANCE_KEY)
    return val === true
  }

  async getStatus(): Promise<{ enabled: boolean }> {
    return { enabled: await this.isEnabled() }
  }
}
