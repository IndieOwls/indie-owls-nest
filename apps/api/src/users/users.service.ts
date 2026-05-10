import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { and, eq, isNull } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../databases'

import { CacheService } from '../modules/cache'
import { LoggerService } from '../modules/logger'
import { User, users } from './entities/user.entity'
import { CreateUserInput, UpdateUserInput } from './dto'

import { ERR_CODE_UNIQUE } from '../constants'

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly logger: LoggerService,
    private readonly cache: CacheService,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    try {
      const [user] = await this.db.insert(users).values(input).returning()

      return user
    } catch (err: any) {
      this.logger.error('Error creating user:', err)
      if (err.code === ERR_CODE_UNIQUE) throw this.uniquenessError(err.constraint ?? '')
      throw new InternalServerErrorException()
    }
  }

  async findAll(): Promise<User[]> {
    return this.db.select().from(users).where(isNull(users.deletedAt))
  }

  async findOne(id: User['id']): Promise<User> {
    try {
      const [user] = await this.db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .limit(1)

      if (!user) throw new NotFoundException(`User ${id} not found`)
      return user
    } catch (err: any) {
      this.logger.error(`Error finding user by ID ${id}:`, err)
      throw new InternalServerErrorException()
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.db.query.users.findFirst({
        where: eq(users.email, email),
      })
    } catch (err: any) {
      this.logger.error('Error finding user by email:', err)
      throw new InternalServerErrorException()
    }
  }

  async update({ id, ...rest }: UpdateUserInput): Promise<User> {
    try {
      const [user] = await this.db
        .update(users)
        .set(rest)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .returning()
      if (!user) throw new NotFoundException(`User ${id} not found`)
      await this.cache.delete(`user:${id}`)
      return user
    } catch (err: any) {
      if (err.code === ERR_CODE_UNIQUE) throw this.uniquenessError(err.constraint ?? '')
      throw new InternalServerErrorException()
    }
  }

  async softDelete(id: User['id']): Promise<User> {
    try {
      const [user] = await this.db
        .update(users)
        .set({
          deletedAt: new Date(),
          email: null,
          altEmail: null,
          displayName: null,
          passwordHash: null,
        })
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .returning()

      if (!user) throw new NotFoundException(`User ${id} not found`)

      await this.cache.delete(`user:${id}`)

      return user
    } catch (err: any) {
      this.logger.error(`Error soft-deleting user ${id}:`, err)
      throw new InternalServerErrorException()
    }
  }

  async restore(id: User['id']): Promise<User> {
    try {
      const [user] = await this.db
        .update(users)
        .set({ deletedAt: null })
        .where(eq(users.id, id))
        .returning()

      if (!user) throw new NotFoundException(`User ${id} not found`)
      return user
    } catch (err: any) {
      this.logger.error(`Error restoring user ${id}:`, err)
      throw new InternalServerErrorException()
    }
  }

  async touchLastActive(id: User['id']): Promise<void> {
    try {
      await this.db
        .update(users)
        .set({ lastActiveAt: new Date() })
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
    } catch (err: any) {
      this.logger.error(`Error updating last active for user ${id}:`, err)
      throw new InternalServerErrorException()
    }
  }

  private uniquenessError(constraint: string): ConflictException {
    if (constraint.includes('email')) return new ConflictException('Email already in use')
    if (constraint.includes('username')) return new ConflictException('Username already in use')
    return new ConflictException('Account already exists')
  }
}
