---
paths: ['apps/api/src/**/*.ts']
---

# NestJS API Rules

YOU MUST follow these patterns when working in `apps/api/src/`.

## Module structure

```
module.ts + resolver.ts|controller.ts + service.ts + dto/ + entities/
```

- Resolvers for GraphQL, controllers for REST
- Services contain business logic, resolvers/controllers are thin wrappers

## GraphQL code-first

- Entity files contain BOTH `pgTable()` (Drizzle DB schema) AND `@ObjectType()` class (GraphQL schema) — co-located, not split
- Use `@Field()` decorators for GraphQL exposure
- Use `@PiiField(category)` for PII-classified fields (email, altEmail) — never `@Field` directly for PII data
- IMPORTANT: PII fields MUST be nullable (`nullable: true`) for the PiiGuard middleware

## Dependency injection

- Constructor-based injection with `@Inject(DRIZZLE)` for database access
- Inject `LoggerService` for logging (global module, no module import needed)
- Inject `CacheService` for caching (global module)
- Inject `QueueService` for job queuing (global module)

## Auth guards

- `@Auth()` — authentication-only (no role check). Use for user-facing queries/mutations.
- `@Auth(UserRole.ADMIN)` — authentication + admin role check. Use for admin operations.
- `@FeatureFlag('name', { bypassRoles: [UserRole.ADMIN] })` — feature flag gating.
- NEVER expose user lookup endpoints without `@Auth(ADMIN)` — user enumeration risk.

## Error handling

- Throw NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, `InternalServerErrorException`)
- NEVER throw generic `Error` — it bypasses NestJS exception filters
- Wrap DB operations in try/catch with proper HTTP exception mapping
- Log errors via `this.logger.error()` before throwing
