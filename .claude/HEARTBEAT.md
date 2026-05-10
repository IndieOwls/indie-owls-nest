# Heartbeat — Periodic Maintenance Tasks

Keep this file empty or with only comments to skip heartbeat checks.
(Claude Code doesn't support automatic heartbeat scheduling — this file is checked on demand during long-running sessions or when asked to "check in.")

Add tasks below when you want periodic maintenance. In long-running sessions or when explicitly asked to "check in," run through the active items below to see if any need attention.

## Maintenance checklist

<!-- Move items from "pending" to "done" as they're completed. Delete completed items after they've been verified. -->

- [ ] **DB migrations**: Run `pnpm db:generate` to check for schema drift. If new `.sql` files appear in `drizzle/`, review and apply them.
- [ ] **Dependency updates**: Check `package.json` for outdated major-version dependencies. Pin to working versions — don't upgrade blindly.
- [ ] **Test suite**: Run `pnpm test` to confirm existing tests still pass after recent changes.
- [ ] **Security scan**: Check for hardcoded secrets, missing input validation on new DTOs, fire-and-forget promises without catch handlers.
- [ ] **Memory refresh**: If the codebase has changed significantly, flag that project memory may need updating.
