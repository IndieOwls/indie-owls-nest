# Indie Owls Nest — NestJS + React SaaS Boilerplate

IMPORTANT: Read this file at every session start. It contains project-specific instructions that override general defaults.

## Session start

1. If `.claude/BOOTSTRAP.md` exists, read and follow it (first-time workspace setup). Delete it when done.
2. Read `.claude/IDENTITY.md` and `.claude/SOUL.md` for project/agent context.
3. Read `.claude/BOOT.md` and execute its startup tasks.
4. After startup tasks are complete, proceed with the user's request.

Reference files (read on demand when relevant):
- `.claude/TOOLS.md` — Dev environment, commands, and integration setup
- `.claude/HEARTBEAT.md` — Periodic maintenance checklist
- `.claude/USER.md` — User preferences and technical context

## Path-scoped rules

Project-specific coding rules live in `.claude/rules/` and load on demand when matching files are touched:

| File | Activates when touching |
|------|------------------------|
| `.claude/rules/nestjs-api.md` | `apps/api/src/**/*.ts` — NestJS module patterns, guards, DI, error handling |
| `.claude/rules/typescript.md` | `**/*.ts` or `**/*.tsx` — naming, imports, type safety, async patterns |
| `.claude/rules/database.md` | `databases/**/*.ts` or `drizzle.config.ts` — Drizzle ORM schema patterns, migration workflow |
| `.claude/rules/security.md` | `apps/api/src/**/*.ts` or `.env*` or `CLAUDE.md` — PII, auth, input validation, OWASP |
| `.claude/rules/testing.md` | `**/*.spec.ts` or `**/*.e2e-spec.ts` — test structure, mocking, coverage |

YOU MUST read the relevant rule file before editing files in those paths.

## Agent briefing convention

When spawning sub-agents via the Agent tool, include this in the prompt:

> Read BOOT.md and SOUL.md at .claude/, then read the relevant memory
> files at `.claude/projects/*/memory/` (resolve the glob) before working.
> Reply with `NO_REPLY` when done.

Sub-agents are fresh sessions — they don't inherit conversation context. This ensures they get startup context and signal completion cleanly.

## Compact instructions

<compact>
When compacting, YOU MUST preserve:
- Current task objective and progress
- List of files created or modified in this session (with paths)
- Any failing test output or compilation errors
- Uncommitted changes and branch context
- Open questions or decisions awaiting user input

You MAY discard: verbose tool output, successful intermediate steps, resolved sub-tasks, exploration dead ends.
</compact>

## Known gaps (high-priority)
- No DB migrations generated yet (run `pnpm db:generate` for first migration)
- Validation only on auth DTOs — most mutation inputs lack class-validator decorators
- No rollback support in drizzle-kit v0.x — use `pnpm db:push` for local iteration

## Quick reference

- **Stack:** NestJS 11, Apollo GraphQL 5, Drizzle ORM v0.45, PostgreSQL, Redis
- **Dev server:** `pnpm dev:server` (port 3000)
- **DB:** `pnpm db:push` (schema sync), `pnpm db:generate` + `pnpm db:migrate` (migrations)
- **Seed:** `pnpm db:seed` (creates admin + testuser accounts)
- **Auth:** Session-based (httpOnly cookie), Bearer token fallback, API keys
- **Guards:** `@Auth()` for auth-only, `@Auth(ADMIN)` for admin-gated
- **ORM:** Drizzle `pgTable()` definitions co-located with GraphQL `@ObjectType()` classes
- **Env cascade:** `.env.{NODE_ENV}` > `.env` > OS vars; loaded by `src/env.ts` at import time
- **Memory:** `.claude/projects/<id>/memory/MEMORY.md` (always loaded, 200-line limit)
- **Rules:** `.claude/rules/` — path-scoped, load on demand
