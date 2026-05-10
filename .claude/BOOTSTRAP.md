# BOOTSTRAP — Workspace Onboarding

This file exists only for first-time setup. If the project memory files and workspace conventions are already established, this file should be deleted.

## Purpose

This workspace uses the following file-based memory and startup system:

| File | Purpose | Loaded |
|------|---------|--------|
| `CLAUDE.md` | Project-level instructions for Claude Code | Every session start |
| `.claude/IDENTITY.md` | Project identity card (name, description, origin) | Session start |
| `.claude/SOUL.md` | Agent operating philosophy (role, tone, behavior) | Session start |
| `.claude/BOOT.md` | Startup task list (memory refresh, env checks, sub-agent protocol) | Referenced from CLAUDE.md |
| `.claude/BOOTSTRAP.md` | This file — first-time workspace orientation | Once, then deleted |
| `.claude/TOOLS.md` | Dev environment reference (commands, runtimes, integrations) | On demand |
| `.claude/USER.md` | User profile and communication preferences | On demand |
| `.claude/HEARTBEAT.md` | Periodic maintenance checklist | On demand during long sessions |
| `.claude/settings.json` | Hooks configuration (session-start git check) | Claude Code harness |
| `.claude/scripts/` | Hook scripts (detect-codebase-changes, refresh-memory) | On demand |
| `.claude/rules/` | Path-scoped coding rules (NestJS, TS, DB, security, testing) | On demand — load when matching files are touched |
| `.claude/projects/*/memory/MEMORY.md` | Memory index — always loaded (first 200 lines) | Every session |
| `.claude/projects/*/memory/*.md` | Individual memory files (loaded on demand) | When referenced |

## First-time setup checklist

When this file is first encountered:

1. **Read the memory index** at `.claude/projects/*/memory/MEMORY.md`
2. **Read project memory** at `.claude/projects/*/memory/project_indie_owls_nest.md`
3. **Read ORM reference** at `.claude/projects/*/memory/orm_reference.md` (if relevant)
4. **Read user preferences** at `.claude/projects/*/memory/user_role.md`
5. **Read `.claude/IDENTITY.md`** and **`.claude/SOUL.md`**
6. **Read `.claude/TOOLS.md`**
7. **Read `.claude/USER.md`**
8. **Verify `.claude/BOOT.md`** exists and is accessible
9. **Read `.claude/rules/`** to understand project-specific coding standards
10. **Confirm the flow**: CLAUDE.md → .claude/IDENTITY.md/.claude/SOUL.md → .claude/BOOT.md is the session start sequence

## Deletion

After the first-time setup is complete:
```bash
rm .claude/BOOTSTRAP.md
```

This file is not needed again. All persistent configuration lives in `CLAUDE.md`, `.claude/BOOT.md`, `.claude/IDENTITY.md`, `.claude/SOUL.md`, `.claude/TOOLS.md`, `.claude/USER.md`, and the memory files.
