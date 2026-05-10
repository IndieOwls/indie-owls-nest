import { Inject } from '@nestjs/common'
import { Resolver, Query } from '@nestjs/graphql'
import { eq, and, count, isNull } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { OrganizationsService } from '../../modules/organizations/organizations.service'
import { FeatureFlagsService } from '../../admins/feature-flags/feature-flags.service'
import { PreferencesService } from '../../features/preferences/preferences.service'
import { notifications } from '../../features/notifications/entities/notification.entity'
import { featureFlags } from '../../admins/feature-flags/entities/feature-flag.entity'

import { Meta } from './entities/meta.entity'

@Resolver(() => Meta)
export class MetaResolver {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly organizationsService: OrganizationsService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly preferences: PreferencesService,
  ) {}

  @Query(() => Meta, { name: 'meta' })
  async getMeta(): Promise<Meta> {
    const [flags] = await Promise.all([
      this.featureFlagsService.findAll(),
    ])

    return {
      user: null,
      organizations: [],
      featureFlags: flags ?? [],
      unreadNotifications: 0,
      serverTime: Date.now(),
    }
  }
}
