import { Inject, Injectable } from '@nestjs/common'
import { and, eq, desc } from 'drizzle-orm'

import { DRIZZLE, type DrizzleDB } from '../../databases'
import { auditEvents, AuditEvent } from './entities/audit-event.entity'

export interface AuditLogInput {
  actorId?: number | null
  action: string
  resource: string
  resourceId?: string | null
  metadata?: Record<string, any> | null
  description?: string | null
  ipAddress?: string | null
}

@Injectable()
export class AuditService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async log(input: AuditLogInput): Promise<AuditEvent> {
    const [event] = await this.db
      .insert(auditEvents)
      .values({
        actorId: input.actorId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId ?? null,
        metadata: input.metadata ?? null,
        description: input.description ?? null,
        ipAddress: input.ipAddress ?? null,
      })
      .returning()

    return event
  }

  async findByResource(resource: string, resourceId: string): Promise<AuditEvent[]> {
    return this.db
      .select()
      .from(auditEvents)
      .where(and(eq(auditEvents.resource, resource), eq(auditEvents.resourceId, resourceId)))
      .orderBy(desc(auditEvents.createdAt))
  }

  async findByActor(actorId: number): Promise<AuditEvent[]> {
    return this.db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.actorId, actorId))
      .orderBy(desc(auditEvents.createdAt))
  }

  async findAll(limit = 100, offset = 0): Promise<AuditEvent[]> {
    return this.db
      .select()
      .from(auditEvents)
      .orderBy(desc(auditEvents.createdAt))
      .limit(limit)
      .offset(offset)
  }
}
