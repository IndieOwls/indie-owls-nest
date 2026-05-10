---
paths: ["apps/api/src/databases/**/*.ts", "apps/api/drizzle.config.ts"]
---

# Database Rules

## Schema pattern (Drizzle ORM)
- IMPORTANT: Each entity file defines BOTH `pgTable()` (DB) and `@ObjectType()` class (GraphQL)
- Use `serial('id').primaryKey()` for auto-increment IDs
- Use `text('name')` for string columns, not `varchar`
- Use `{ withTimezone: true }` for all timestamp columns
- Use `.$type<T>()` for enum columns (e.g., `.$type<UserRole>()`)
- Use `.$onUpdate(() => new Date())` for `updated_at` columns
- Foreign keys: `.references(() => tableName.id)`
- Unique constraints: `.unique()` on the column definition
- Composite primary keys: use the table's second argument `(t) => ({ pk: primaryKey(...) })`

## Migration workflow
- LOCAL DEVELOPMENT: Use `pnpm db:push` for rapid iteration (no migration files)
- STABLE SCHEMA: Use `pnpm db:generate` to create migration SQL files
- REVIEW: Always review generated `.sql` files in `drizzle/` before applying
- APPLY: `pnpm db:migrate` applies pending migrations
- ROLLBACK: drizzle-kit v0.x has NO rollback — take a `pg_dump` snapshot before production migrations

## New tables
When adding a new table:
1. Create the entity file in the appropriate module's `entities/` directory
2. Export the `pgTable` from `databases/schema/index.ts`
3. Run `pnpm db:generate` to create the migration
4. Review the generated SQL
5. Run `pnpm db:migrate` to apply
