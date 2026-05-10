import { Inject, Injectable, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { eq } from 'drizzle-orm'
import { Request, Response, NextFunction } from 'express'

import { DRIZZLE, type DrizzleDB } from '../../../databases'
import { organizations } from '../entities/organization.entity'

/**
 * Resolves the current organization from the incoming request and attaches it
 * to `req.organization`. Runs on every API request, before any guard.
 *
 * Resolution priority:
 * 1. `X-Organization-Id` header (numeric ID)
 * 2. `X-Organization-Slug` header (slug string)
 * 3. Subdomain of `Host` header (requires `ORGANIZATION_DOMAIN` env var)
 *
 * This middleware does NOT fall back to the user's first membership — that
 * is handled by `OrganizationGuard` for guarded resolvers. This keeps the
 * middleware stateless and auth-agnostic.
 */
@Injectable()
export class OrganizationResolverMiddleware implements NestMiddleware {
  private readonly baseDomain: string

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    config: ConfigService,
  ) {
    this.baseDomain = config.get<string>('organization.domain', '')
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    const org = await this.resolve(req)
    if (org) {
      ;(req as any).organization = org
    }
    next()
  }

  private async resolve(req: Request): Promise<typeof organizations.$inferSelect | null> {
    const orgId = this.extractHeaderId(req)
    if (orgId !== null) {
      const [org] = await this.db
        .select()
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1)
      if (org) return org
    }

    const slug = this.extractHeaderSlug(req)
    if (slug !== null) {
      const [org] = await this.db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, slug))
        .limit(1)
      if (org) return org
    }

    if (this.baseDomain) {
      const subdomain = this.extractSubdomain(req)
      if (subdomain) {
        const [org] = await this.db
          .select()
          .from(organizations)
          .where(eq(organizations.slug, subdomain))
          .limit(1)
        if (org) return org
      }
    }

    return null
  }

  private extractHeaderId(req: Request): number | null {
    const val = req.headers['x-organization-id']
    if (!val) return null
    const id = parseInt(Array.isArray(val) ? val[0] : val, 10)
    return isNaN(id) ? null : id
  }

  private extractHeaderSlug(req: Request): string | null {
    const val = req.headers['x-organization-slug']
    if (!val) return null
    return Array.isArray(val) ? val[0] : val
  }

  private extractSubdomain(req: Request): string | null {
    const host = req.headers['host']
    if (!host) return null
    const hostname = (Array.isArray(host) ? host[0] : host).split(':')[0]

    if (hostname === this.baseDomain) return null

    const suffix = `.${this.baseDomain}`
    if (hostname.endsWith(suffix)) {
      const sub = hostname.slice(0, -suffix.length)
      return sub && !sub.includes('.') ? sub : null
    }

    return null
  }
}
