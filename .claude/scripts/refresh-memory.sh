#!/usr/bin/env bash
# Removes the refresh flag and writes the current commit hash.
# Claude runs this via Bash after it has refreshed the project memory files.
set -euo pipefail

MEMORY_DIR="$(dirname "$0")/.."
CURRENT_HASH=$(git -C "$MEMORY_DIR/.." rev-parse HEAD 2>/dev/null || echo "no-git")

echo "$CURRENT_HASH" > "$MEMORY_DIR/last_commit_hash"
rm -f "$MEMORY_DIR/needs_memory_refresh"
echo "Memory refresh acknowledged. Commit $CURRENT_HASH recorded."
