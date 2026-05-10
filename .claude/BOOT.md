# BOOT — Startup Instructions

These instructions execute at the beginning of every session (triggered by CLAUDE.md step 2). The bootstrap first-time setup is handled by CLAUDE.md step 1 (checking for `.claude/BOOTSTRAP.md`).

## 1. Memory refresh check

If `.claude/needs_memory_refresh` exists, the codebase has changed since the last session:
1. Run `git log --oneline -10` to see recent changes
2. Read the changed files (key architecture, schema, resolvers)
3. Update the project memory at `.claude/projects/*/memory/project_indie_owls_nest.md` (resolve the actual `*` glob to the project's full path) with any new modules, routes, schema, or conventions
4. Run `bash .claude/scripts/refresh-memory.sh` to clear the flag

## 2. Environment check

Verify the infrastructure is available before making changes that depend on it:
- `pg_isready -h localhost -p 5433` (or 5432 for docker) — PostgreSQL
- `redis-cli ping` — Redis
- If either is down, note it before attempting DB-related work

## 3. Sub-agent protocol

When spawning sub-agents via the Agent tool, append to your prompt:

```
Read SOUL.md and BOOT.md at .claude/, then read the relevant memory
files at .claude/projects/*/memory/ (resolve the glob) before working.
When done, reply with NO_REPLY so the parent knows you finished.
```

This ensures sub-agents have startup context (SOUL.md for behavioral norms, BOOT.md for tasks) and signal completion cleanly.

## 4. Completion signal

After completing the startup tasks (1-3 above), no further reply is needed unless there are issues. This file is read-only and persists across sessions.
