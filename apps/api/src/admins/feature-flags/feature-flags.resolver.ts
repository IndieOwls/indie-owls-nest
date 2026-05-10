import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'

import { FeatureFlagsService } from './feature-flags.service'
import { FeatureFlag } from './entities/feature-flag.entity'
import { CreateFeatureFlagInput, UpdateFeatureFlagInput } from './dto'

import { LoggerService } from '../../modules/logger'

@Resolver(() => FeatureFlag)
export class FeatureFlagsResolver {
  constructor(
    private readonly service: FeatureFlagsService,
    private readonly logger: LoggerService,
  ) {}

  @Mutation(() => FeatureFlag, { name: 'createFeatureFlag' })
  createFeatureFlag(
    @Args('createFeatureFlagInput') createFeatureFlagInput: CreateFeatureFlagInput,
  ) {
    this.logger.log(
      `Creating feature flag with input: ${JSON.stringify(createFeatureFlagInput)}`,
      'FeatureFlagsResolver.createFeatureFlag',
    )
    return this.service.create(createFeatureFlagInput)
  }

  @Query(() => [FeatureFlag], { name: 'featureFlags' })
  findAll() {
    this.logger.log('Fetching all feature flags', 'FeatureFlagsResolver.findAll')
    return this.service.findAll()
  }

  @Query(() => FeatureFlag, { name: 'featureFlag' })
  findOne(@Args('id', { type: () => Int }) id: FeatureFlag['id']) {
    this.logger.log(`Fetching feature flag with ID: ${id}`, 'FeatureFlagsResolver.findOne')
    return this.service.findOne(id)
  }

  @Mutation(() => FeatureFlag, { name: 'updateFeatureFlag' })
  updateFeatureFlag(
    @Args('updateFeatureFlagInput') updateFeatureFlagInput: UpdateFeatureFlagInput,
  ) {
    this.logger.log(
      `Updating feature flag with ID: ${updateFeatureFlagInput.id}`,
      'FeatureFlagsResolver.updateFeatureFlag',
    )
    return this.service.update(updateFeatureFlagInput.id, updateFeatureFlagInput)
  }

  @Mutation(() => FeatureFlag, { name: 'removeFeatureFlag' })
  removeFeatureFlag(@Args('id', { type: () => Int }) id: FeatureFlag['id']) {
    this.logger.log(
      `Removing feature flag with ID: ${id}`,
      'FeatureFlagsResolver.removeFeatureFlag',
    )
    return this.service.remove(id)
  }
}
