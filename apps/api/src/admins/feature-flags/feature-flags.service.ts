import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { FeatureFlag, featureFlags } from './entities/feature-flag.entity'
import { CreateFeatureFlagInput, UpdateFeatureFlagInput } from './dto/'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { LoggerService } from '../../modules/logger'

@Injectable()
export class FeatureFlagsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly logger: LoggerService,
  ) {}

  async create(createFeatureFlagInput: CreateFeatureFlagInput) {
    try {
      const [featureFlag] = await this.db
        .insert(featureFlags)
        .values(createFeatureFlagInput)
        .returning()

      return featureFlag
    } catch (error) {
      this.logger.error('Error creating feature flag:', error)
      throw new InternalServerErrorException()
    }
  }

  async findAll() {
    try {
      return await this.db.select().from(featureFlags)
    } catch (error) {
      this.logger.error('Error fetching feature flags:', error)
    }
  }

  async findOne(id: FeatureFlag['id']) {
    try {
      const [featureFlag] = await this.db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.id, id))
        .limit(1)

      return featureFlag
    } catch (error) {
      this.logger.error(`Error fetching feature flag with ID ${id}:`, error)
      throw new InternalServerErrorException()
    }
  }

  async update(id: FeatureFlag['id'], updateFeatureFlagInput: UpdateFeatureFlagInput) {
    try {
      const [featureFlag] = await this.db
        .update(featureFlags)
        .set(updateFeatureFlagInput)
        .where(eq(featureFlags.id, id))
        .returning()

      return featureFlag
    } catch (error) {
      this.logger.error(`Error updating feature flag with ID ${id}:`, error)
    }
  }

  async remove(id: FeatureFlag['id']) {
    try {
      const [featureFlag] = await this.db
        .delete(featureFlags)
        .where(eq(featureFlags.id, id))
        .returning()

      return featureFlag
    } catch (error) {
      this.logger.error(`Error removing feature flag with ID ${id}:`, error)
      throw new InternalServerErrorException()
    }
  }
}
