import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { eq } from 'drizzle-orm'

import { CreateUserConsentInput, UpdateUserConsentInput } from './dto'

import { LoggerService } from '../../modules/logger'
import { DRIZZLE, type DrizzleDB } from '../../databases'
import { UserConsent, userConsents } from './entities/user-consent.entity'

@Injectable()
export class UserConsentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly logger: LoggerService,
  ) {}

  async create(input: CreateUserConsentInput): Promise<UserConsent> {
    try {
      const [consent] = await this.db.insert(userConsents).values(input).returning()
      return consent
    } catch (err: any) {
      this.logger.error('Error creating user consent:', err)
      throw new InternalServerErrorException('Failed to create user consent')
    }
  }

  async findAll(): Promise<UserConsent[]> {
    try {
      return await this.db.select().from(userConsents)
    } catch (err: any) {
      this.logger.error('Error fetching user consents:', err)
      throw new InternalServerErrorException('Failed to fetch user consents')
    }
  }

  async findOne(id: number): Promise<UserConsent> {
    try {
      const [consent] = await this.db.select().from(userConsents).where(eq(userConsents.id, id)).limit(1)
      if (!consent) throw new NotFoundException(`User consent ${id} not found`)
      return consent
    } catch (err: any) {
      this.logger.error(`Error fetching user consent ${id}:`, err)
      throw new InternalServerErrorException('Failed to fetch user consent')
    }
  }

  async update(id: number, input: UpdateUserConsentInput): Promise<UserConsent> {
    try {
      const [consent] = await this.db
        .update(userConsents)
        .set(input)
        .where(eq(userConsents.id, id))
        .returning()
      if (!consent) throw new NotFoundException(`User consent ${id} not found`)
      return consent
    } catch (err: any) {
      this.logger.error(`Error updating user consent ${id}:`, err)
      throw new InternalServerErrorException('Failed to update user consent')
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.db.delete(userConsents).where(eq(userConsents.id, id))
      return true
    } catch (err: any) {
      this.logger.error(`Error deleting user consent ${id}:`, err)
      throw new InternalServerErrorException('Failed to delete user consent')
    }
  }
}
