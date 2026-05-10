import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { and, eq, inArray } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { users } from '../../databases/schema'
import { LoggerService } from '../logger'

import { Organization, organizations } from './entities/organization.entity'
import { OrganizationMember, organizationMembers } from './entities/organization-member.entity'
import { CreateOrganizationInput, UpdateOrganizationInput, OrganizationRole } from './dto'

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly logger: LoggerService,
  ) {}

  async create(userId: number, input: CreateOrganizationInput): Promise<Organization> {
    try {
      const slug = input.slug ?? input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const [org] = await this.db.transaction(async (tx) => {
        const [o] = await tx.insert(organizations).values({ name: input.name, slug }).returning()
        await tx.insert(organizationMembers).values({
          organizationId: o.id,
          userId,
          role: OrganizationRole.OWNER,
        })
        return [o]
      })

      return org
    } catch (err: any) {
      this.logger.error('Error creating organization:', err)
      if (err.code === '23505') throw new ConflictException('Organization slug already exists')
      throw new InternalServerErrorException('Failed to create organization')
    }
  }

  async findById(id: number): Promise<Organization> {
    try {
      const [org] = await this.db.select().from(organizations).where(eq(organizations.id, id)).limit(1)
      if (!org) throw new NotFoundException(`Organization ${id} not found`)
      return org
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error finding organization by ID ${id}:`, err)
      throw new InternalServerErrorException('Failed to find organization')
    }
  }

  async findBySlug(slug: string): Promise<Organization> {
    try {
      const [org] = await this.db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1)
      if (!org) throw new NotFoundException(`Organization "${slug}" not found`)
      return org
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error finding organization by slug "${slug}":`, err)
      throw new InternalServerErrorException('Failed to find organization')
    }
  }

  async getMyOrganizations(userId: number): Promise<Organization[]> {
    try {
      const memberships = await this.db
        .select({ organizationId: organizationMembers.organizationId })
        .from(organizationMembers)
        .where(eq(organizationMembers.userId, userId))

      if (memberships.length === 0) return []

      const orgIds = memberships.map((m) => m.organizationId)
      return await this.db.select().from(organizations).where(inArray(organizations.id, orgIds))
    } catch (err: any) {
      this.logger.error(`Error fetching organizations for user ${userId}:`, err)
      throw new InternalServerErrorException('Failed to fetch organizations')
    }
  }

  async getMembers(organizationId: number): Promise<(OrganizationMember & { username: string })[]> {
    try {
      const rows = await this.db
        .select({
          organizationId: organizationMembers.organizationId,
          userId: organizationMembers.userId,
          role: organizationMembers.role,
          joinedAt: organizationMembers.joinedAt,
          username: users.username,
        })
        .from(organizationMembers)
        .innerJoin(users, eq(users.id, organizationMembers.userId))
        .where(eq(organizationMembers.organizationId, organizationId))

      return rows
    } catch (err: any) {
      this.logger.error(`Error fetching members for organization ${organizationId}:`, err)
      throw new InternalServerErrorException('Failed to fetch organization members')
    }
  }

  async addMember(
    organizationId: number,
    userId: number,
    role: OrganizationRole = OrganizationRole.MEMBER,
  ): Promise<OrganizationMember> {
    try {
      const [member] = await this.db
        .insert(organizationMembers)
        .values({ organizationId, userId, role })
        .returning()
      return member
    } catch (err: any) {
      this.logger.error(`Error adding member to organization ${organizationId}:`, err)
      if (err.code === '23505') throw new ConflictException('User is already a member')
      throw new InternalServerErrorException('Failed to add member')
    }
  }

  async removeMember(organizationId: number, userId: number): Promise<void> {
    try {
      const [existing] = await this.db
        .select({ role: organizationMembers.role })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1)

      if (!existing) throw new NotFoundException('Membership not found')
      if (existing.role === OrganizationRole.OWNER) {
        throw new ConflictException('Cannot remove the organization owner')
      }

      await this.db
        .delete(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.userId, userId),
          ),
        )
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err
      this.logger.error(`Error removing member from organization ${organizationId}:`, err)
      throw new InternalServerErrorException('Failed to remove member')
    }
  }

  async updateMemberRole(
    organizationId: number,
    userId: number,
    role: OrganizationRole,
  ): Promise<OrganizationMember> {
    try {
      const [existing] = await this.db
        .select({ role: organizationMembers.role })
        .from(organizationMembers)
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .limit(1)

      if (!existing) throw new NotFoundException('Membership not found')
      if (existing.role === OrganizationRole.OWNER && role !== OrganizationRole.OWNER) {
        throw new ConflictException('Cannot demote the organization owner')
      }

      const [member] = await this.db
        .update(organizationMembers)
        .set({ role })
        .where(
          and(
            eq(organizationMembers.organizationId, organizationId),
            eq(organizationMembers.userId, userId),
          ),
        )
        .returning()
      return member
    } catch (err: any) {
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err
      this.logger.error(`Error updating member role in organization ${organizationId}:`, err)
      throw new InternalServerErrorException('Failed to update member role')
    }
  }

  async update(id: number, input: UpdateOrganizationInput): Promise<Organization> {
    try {
      const { id: _, ...rest } = input
      const [org] = await this.db
        .update(organizations)
        .set(rest)
        .where(eq(organizations.id, id))
        .returning()
      if (!org) throw new NotFoundException(`Organization ${id} not found`)
      return org
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err
      this.logger.error(`Error updating organization ${id}:`, err)
      if (err.code === '23505') throw new ConflictException('Organization slug already exists')
      throw new InternalServerErrorException('Failed to update organization')
    }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.db.delete(organizations).where(eq(organizations.id, id))
      return true
    } catch (err: any) {
      this.logger.error(`Error deleting organization ${id}:`, err)
      throw new InternalServerErrorException('Failed to delete organization')
    }
  }
}
