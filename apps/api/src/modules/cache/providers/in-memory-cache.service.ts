import { Injectable, Optional } from '@nestjs/common'

import { CacheService } from '../interfaces/cache-service.interface'

interface CacheEntry {
  value: any
  expiresAt: number
}

@Injectable()
export class InMemoryCacheService extends CacheService {
  private readonly store = new Map<string, CacheEntry>()
  private readonly defaultTtl = 300 // 5 minutes
  private readonly maxSize: number

  constructor(@Optional() maxSize?: number) {
    super()
    this.maxSize = maxSize ?? 1000
  }

  private isExpired(entry: CacheEntry): boolean {
    return entry.expiresAt < Date.now()
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (this.isExpired(entry)) {
      this.store.delete(key)
      return null
    }
    // LRU maintenance: re-insert to mark as recently used
    this.store.delete(key)
    this.store.set(key, entry)
    return entry.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    // Re-insert to update insertion order (LRU)
    if (this.store.has(key)) this.store.delete(key)

    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds ?? this.defaultTtl) * 1000,
    })

    this.evictIfNeeded()
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      for (const key of this.store.keys()) {
        if (key.startsWith(pattern)) this.store.delete(key)
      }
    } else {
      this.store.clear()
    }
  }

  private evictIfNeeded(): void {
    while (this.store.size > this.maxSize) {
      const oldest = this.store.keys().next().value
      if (oldest === undefined) break
      this.store.delete(oldest)
    }
  }
}
