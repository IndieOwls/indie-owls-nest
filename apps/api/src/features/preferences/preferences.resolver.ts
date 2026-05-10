import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { PreferencesService } from './preferences.service'
import { UserPreferences } from './entities/user-preferences.entity'

@Resolver(() => UserPreferences)
export class PreferencesResolver {
  constructor(private readonly service: PreferencesService) {}

  @Query(() => UserPreferences, { name: 'myPreferences', nullable: true })
  myPreferences() {
    return this.service.findByUser(0)
  }

  @Mutation(() => UserPreferences)
  async updatePreferences(
    @Args('preferences', { type: () => Object }) preferences: Record<string, any>,
  ): Promise<UserPreferences> {
    return this.service.upsert(0, preferences)
  }
}
