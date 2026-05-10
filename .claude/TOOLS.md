# TOOLS.md - Local Notes

Skills define *how* tools work. This file captures the stuff that's unique to your setup.

## What Goes Here

- Runtime versions and paths
- Database connection details and commands
- Dev server URLs and ports
- Build, test, and quality commands
- Environment file layout
- Third-party integration keys (Stripe, Resend, S3, OAuth — documented, not written)
- Filesystem paths (uploads, migrations, build output)

## Runtime

| Tool | Version / Path | Notes |
|------|---------------|-------|
| Node.js | ^22 (via nvm or system) | Required for NestJS and all apps |
| pnpm | Latest | Workspace monorepo manager |
| TypeScript | ^5.7 | Across all apps |
| Docker | Latest | For Postgres + Redis containers |

## Database tools

| Tool | Command | Purpose |
|------|---------|---------|
| PostgreSQL 16 | `docker compose up -d postgres` or local on :5433 | Primary database |
| Redis 7 | `docker compose up -d redis` or local on :6379 | Queue + cache |
| Drizzle Kit | `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push` | Schema → SQL migrations |
| Drizzle Studio | `pnpm db:studio` | GUI database browser |
| pg_isready | `pg_isready -h localhost -p 5433` | Connection health check |
| redis-cli | `redis-cli ping` | Redis connection check |
| Safe migration | `pnpm db:safe-migrate` | Maintenance mode + pg_dump + drizzle-kit migrate, one-shot |
| Seed script | `pnpm db:seed` | Creates admin + testuser accounts |

## Maintenance mode

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/{prefix}/maintenance/enable` | POST | @Auth(ADMIN) | Enable maintenance mode (returns 503 to all traffic) |
| `/{prefix}/maintenance/disable` | POST | @Auth(ADMIN) | Disable maintenance mode |
| `/{prefix}/maintenance/status` | GET | None | Check if maintenance mode is active |

- Uses CacheService (Redis if available, in-memory fallback)
- Health endpoint (`/health`) bypasses maintenance mode automatically
- 1-hour auto-expiry safety net prevents permanent lockout

## API tools

| Tool | Command / URL | Purpose |
|------|--------------|---------|
| Dev server | `pnpm dev:server` | NestJS watch mode on :3000 |
| Swagger UI | `GET /{prefix}/docs` | REST endpoint docs |
| Apollo Sandbox | Browse to GraphQL endpoint in browser | GraphQL IDE with schema explorer |
| Health check | `GET /health` or `GET /` | Server + dependency status |
| BullBoard | `GET /{prefix}/queues` | Job queue management UI |

## Frontend tools

| Tool | Command | URL |
|------|---------|-----|
| Web dev server | `pnpm dev:client` | `http://localhost:5173` |
| Admin dev server | `pnpm dev:admin` | `http://localhost:4000` |

## Build & quality

| Tool | Command | Purpose |
|------|---------|---------|
| Full build | `pnpm build` | web → admin → server |
| Lint | `pnpm lint` | ESLint across all source |
| Format | `pnpm format` | Prettier formatting |
| Test | `pnpm test` | Unit tests (NODE_ENV=test) |
| E2E test | `pnpm test:e2e` | End-to-end tests |

## Env files

| File | Role | Tracked |
|------|------|---------|
| `.env` | Base defaults (docker-compose compatible) | No |
| `.env.development` | Local dev overrides | No |
| `.env.test` | Test environment | No |
| `.env.production` | Production settings | No |
| `.env.example` | Reference template with all vars documented | Yes |

## Project tools & integrations

- **Stripe:** Billing (set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` in env)
- **Resend:** Email delivery (set `RESEND_API_KEY`)
- **S3:** File storage (set `S3_*` env vars, `STORAGE_DRIVER=s3`)
- **Google OAuth:** Set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- **GitHub OAuth:** Set `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET`

## Filesystem notes

- Uploaded files in local storage mode go to `apps/api/uploads/`
- Migration files go to `apps/api/drizzle/`
- Built frontends go to `apps/web/dist/` and `apps/admin/dist/`

---

## Why Separate?

Skills are shared. Your setup is yours. Keeping environment-specific notes in `TOOLS.md` means:
- Skills can be updated without losing your local configuration
- Skills can be shared without leaking your infrastructure
- You have a single place to check when you forget how something is set up

Add whatever helps you do your job. This is your cheat sheet.

## Related

- [Agent workspace](/concepts/agent-workspace)
