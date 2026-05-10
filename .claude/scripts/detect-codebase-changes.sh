#!/usr/bin/env bash
# Called by session-start hook. Detects codebase changes since last memory refresh
# and creates a flag file so Claude knows to refresh its project memory.
#
# Only refresh-memory.sh records the commit hash — this script only sets the flag.
# This way, if a session is interrupted before the refresh completes, the next
# session's hook will still see a difference and flag it again.
set -euo pipefail

MEMORY_DIR="$(dirname "$0")/.."
STORED_HASH_FILE="$MEMORY_DIR/last_commit_hash"
FLAG_FILE="$MEMORY_DIR/needs_memory_refresh"

# Get current HEAD hash
CURRENT_HASH=$(git -C "$MEMORY_DIR/.." rev-parse HEAD 2>/dev/null || echo "no-git")

# Read stored hash (written by refresh-memory.sh on last successful refresh)
STORED_HASH=""
if [ -f "$STORED_HASH_FILE" ]; then
  STORED_HASH=$(cat "$STORED_HASH_FILE")
fi

if [ "$CURRENT_HASH" = "$STORED_HASH" ] && [ -n "$STORED_HASH" ]; then
  # No changes since last completed refresh — clean up stale flag if any
  rm -f "$FLAG_FILE"
  exit 0
fi

# Codebase changed since last refresh (or first ever run) — set flag
touch "$FLAG_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Codebase changes detected (new commit)"
echo "  Memory refresh flag set."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
