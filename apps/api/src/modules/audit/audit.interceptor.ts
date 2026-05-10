import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Observable, tap } from 'rxjs'

import { AuditService } from './audit.service'
import { LoggerService } from '../../modules/logger'

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly audit: AuditService,
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlCtx = GqlExecutionContext.create(context)
    const info = gqlCtx.getInfo()
    const args = gqlCtx.getArgs()
    const ctx = gqlCtx.getContext()
    const req = ctx?.req ?? {}

    // Only intercept GraphQL mutations
    if (info?.parentType?.name !== 'Mutation') {
      return next.handle()
    }

    const mutationName = info.fieldName
    const user = req.user
    const ipAddress = req.ip

    return next.handle().pipe(
      tap((result: any) => {
        const resource = this.inferResource(mutationName, args)

        // Extract a resource ID from the result or args
        const resourceId =
          result?.id?.toString() ??
          result?.userId?.toString() ??
          args?.id?.toString() ??
          args?.input?.id?.toString() ??
          null

        this.audit.log({
          actorId: user?.id ?? null,
          action: this.inferAction(mutationName),
          resource,
          resourceId,
          description: `${mutationName}${resourceId ? ` #${resourceId}` : ''}`,
          ipAddress,
          metadata: {
            mutationName,
            args: this.sanitizeArgs(args),
          },
        }).catch((err) => this.logger.warn(`Audit log failed: ${err}`, 'AuditInterceptor'))
      }),
    )
  }

  private inferAction(mutationName: string): string {
    if (/^create/i.test(mutationName)) return 'CREATE'
    if (/^update/i.test(mutationName)) return 'UPDATE'
    if (/^delete|^remove/i.test(mutationName)) return 'DELETE'
    if (/^restore/i.test(mutationName)) return 'RESTORE'
    if (/^login|^logout|^register/i.test(mutationName)) return 'AUTH'
    if (/^fulfill|^confirm/i.test(mutationName)) return 'COMPLETE'
    if (/^upload/i.test(mutationName)) return 'UPLOAD'
    return 'MUTATION'
  }

  private inferResource(mutationName: string, args: any): string {
    // Try to extract from common arg patterns
    if (args?.input?.constructor?.name) {
      return args.input.constructor.name.replace(/Input$/, '')
    }

    // Infer from mutation name: "createUser" → "User", "deleteOrganization" → "Organization"
    const match = mutationName.match(/^(?:create|update|delete|remove|restore)([A-Z][a-zA-Z0-9]*)/)
    if (match) return match[1]

    return 'Unknown'
  }

  private sanitizeArgs(args: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(args)) {
      if (key === 'password' || key === 'token' || key === 'secret' || key === 'base64') continue
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeArgs(value)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }
}
