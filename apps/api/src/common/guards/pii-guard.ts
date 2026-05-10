import type { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql'
import { PII_REGISTRY } from '../../compliances/pii/dto/pii.registry'

/**
 * GraphQL field middleware that masks PII-tagged fields from unauthorized viewers.
 *
 * Rules:
 *  - Field not in the PII registry → pass through.
 *  - No authenticated user → return null.
 *  - ADMIN role → pass through.
 *  - Parent object belongs to requesting user (parent.id or parent.userId matches)
 *    → pass through.
 *  - Otherwise → null (masked).
 *
 * All PII-bearing fields in the schema must declare `{ nullable: true }` so that
 * returning null is a valid GraphQL response rather than a runtime error.
 */
export const PiiGuard: FieldMiddleware = async (ctx: MiddlewareContext, next: NextFn) => {
  const entry = PII_REGISTRY.get(ctx.info.parentType.name, ctx.info.fieldName)
  if (!entry) return next()

  const req = (ctx.context as any)?.req
  const requestingUser = req?.user
  if (!requestingUser) return null

  // Admin bypass
  if (requestingUser.role === 'ADMIN') return next()

  const source = ctx.source ?? {}

  // Self-access: field is on a User object (source.id === user's own id)
  if (source.id === requestingUser.id) return next()
  // Self-access: field is on a child entity keyed to the user
  if (source.userId === requestingUser.id) return next()

  return null
}
