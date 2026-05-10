import { Injectable, Inject, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { AccessBan, accessBans } from './entities/access-ban.entity'
import { CreateAccessBanInput, UpdateAccessBanInput } from './dto'

import { LoggerService } from '../../modules/logger'
import { DRIZZLE, type DrizzleDB } from '../../databases'

@Injectable()
export class AccessBansService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly logger: LoggerService,
  ) {}
  async create(createAccessBanInput: CreateAccessBanInput) {
    try {
      const [accessBan] = await this.db
        .insert(accessBans)
        .values(createAccessBanInput)
        .returning()

      return accessBan
    } catch (err: any) {
      this.logger.error('Error creating access ban:', err)
      throw new InternalServerErrorException('Unable to create access ban')
    }
  }

  async findAll() {
    try {
      return await this.db.select().from(accessBans)
    } catch (err: any) {
      this.logger.error('Error fetching access bans:', err)
      throw new InternalServerErrorException('Unable to fetch access bans')
    }
  }

  async findOne(userId: AccessBan['userId']) {
    try {
      const [accessBan] = await this.db
        .select()
        .from(accessBans)
        .where(eq(accessBans.userId, userId))
        .limit(1)

      if (!accessBan) {
        throw new NotFoundException(`Access ban for user ${userId} not found`)
      }

      return accessBan
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error fetching access ban for user ID ${userId}:`, err)
      throw new InternalServerErrorException('Unable to fetch access ban')
    }
  }

  async update(userId: AccessBan['userId'], updateAccessBanInput: UpdateAccessBanInput) {
    try {
      const [accessBan] = await this.db
        .update(accessBans)
        .set(updateAccessBanInput)
        .where(eq(accessBans.userId, userId))
        .returning()

      if (!accessBan) {
        throw new NotFoundException(`Access ban for user ${userId} not found`)
      }

      return accessBan
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error updating access ban for user ID ${userId}:`, err)
      throw new InternalServerErrorException('Unable to update access ban')
    }
  }

  async remove(userId: AccessBan['userId']) {
    try {
      const [accessBan] = await this.db.delete(accessBans).where(eq(accessBans.userId, userId)).returning()

      if (!accessBan) {
        throw new NotFoundException(`Access ban for user ${userId} not found`)
      }
      return accessBan
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error deleting access ban for user ID ${userId}:`, err)
      throw new InternalServerErrorException('Unable to delete access ban')
    }
  }
}
