---
paths: ['apps/api/src/**/*.ts', 'apps/api/.env*', 'CLAUDE.md']
---

# Security Rules

IMPORTANT — These rules exist because they address real vulnerabilities. Violations should be flagged.

## PII handling

- `<rule>` Email addresses, altEmails, and any PII-classified fields MUST use `@PiiField(category)` decorator, never bare `@Field()`.
- The `PiiGuard` middleware automatically masks these for non-owners and non-admins.
- PII fields MUST be `nullable: true` — returning null is how masking works.
- Check `PII_REGISTRY` before exposing new entity fields in GraphQL. </rule>

## Auth

- `<rule>` User-facing queries that return user data MUST use `@Auth()` or `@Auth(ADMIN)`.
- Never expose a `findByEmail` or admin-level query without admin role check.
- Session tokens are the DB primary key — treat them as secrets. </rule>

## Input validation

- `<rule>` All mutation/endpoint inputs SHOULD use `class-validator` decorators.
- Currently only auth DTOs have validation — this is a known gap. New DTOs must include validation.
- Use `@MaxLength(72)` on password fields (bcrypt truncates at 72 bytes). </rule>

## OWASP

- No CSRF protection currently — be aware when designing cookie-based endpoints.
- No request body size limiting — flag large payload vectors.
- Rate limiting: 60 req/60s default via `@nestjs/throttler` — don't bypass.
- SQL injection: prevented by Drizzle ORM parameterized queries — don't use raw SQL strings.
