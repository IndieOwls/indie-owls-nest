import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { UserPreferences, userPreferences } from './entities/user-preferences.entity'

type PrefsRow = Omit<UserPreferences, 'preferences'> & { preferences: unknown }

@Injectable()
export class PreferencesService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findByUser(userId: number): Promise<UserPreferences | null> {
    const [prefs] = await this.db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1) as PrefsRow[]

    if (!prefs) return null
    return { ...prefs, preferences: prefs.preferences as Record<string, any> }
  }

  async upsert(userId: number, preferences: Record<string, any>): Promise<UserPreferences> {
    const existing = await this.findByUser(userId)

    if (existing) {
      const merged = { ...(existing.preferences as Record<string, any>), ...preferences }
      const [updated] = await this.db
        .update(userPreferences)
        .set({ preferences: merged })
        .where(eq(userPreferences.userId, userId))
        .returning() as unknown as PrefsRow[]

      return { ...updated, preferences: updated.preferences as Record<string, any> }
    }

    const [created] = await this.db
      .insert(userPreferences)
      .values({ userId, preferences })
      .returning() as unknown as PrefsRow[]

    return { ...created, preferences: created.preferences as Record<string, any> }
  }
}
