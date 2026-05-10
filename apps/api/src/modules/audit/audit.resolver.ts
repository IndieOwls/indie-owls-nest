import { Resolver, Query, Args, Int } from '@nestjs/graphql'

import { AuditService } from './audit.service'
import { AuditEvent } from './entities/audit-event.entity'

@Resolver(() => AuditEvent)
export class AuditResolver {
  constructor(private readonly audit: AuditService) {}

  @Query(() => [AuditEvent], { name: 'auditEvents' })
  findAll(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    return this.audit.findAll(limit ?? 100, offset ?? 0)
  }

  @Query(() => [AuditEvent], { name: 'auditEventsByResource' })
  findByResource(
    @Args('resource') resource: string,
    @Args('resourceId') resourceId: string,
  ) {
    return this.audit.findByResource(resource, resourceId)
  }
}
