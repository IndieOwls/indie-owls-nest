#!/usr/bin/env bash
# ============================================================================
# safe-migrate.sh — Maintenance-mode-gated migration with pg_dump rollback
# ============================================================================
# Usage:
#   ADMIN_TOKEN="<admin-session-token>" bash scripts/safe-migrate.sh
#
# Get an admin token:
#   TOKEN=$(curl -s -X POST http://localhost:3000/api/$(date +%Y-%m-%d)/auth/login \
#     -H "Content-Type: application/json" \
#     -d '{"email":"admin@test.com","password":"admin123"}' | jq -r '.sessionToken')
#   ADMIN_TOKEN=$TOKEN bash scripts/safe-migrate.sh
#
# On failure, restore from the generated snapshot:
#   dropdb <db_name> && createdb <db_name> && psql <db_name> < .claude/migration-snapshots/20260516_120000_pre.sql
# ============================================================================

set -euo pipefail

# --- Env cascade (mirrors src/env.ts) ----------------------------------------
# Load .env.{NODE_ENV} first (higher priority), then .env (base defaults).
# Neither overrides already-set values, matching dotenv.config() behavior.
# Values with spaces or special chars may need manual export. Variable
# references (e.g. ${PORT}) are NOT expanded.
ENV_FILE="${NODE_ENV:-development}"
for f in ".env.${ENV_FILE}" ".env"; do
  if [ -f "$f" ]; then
    while IFS='=' read -r key value || [ -n "$key" ]; do
      case "$key" in ''|\#*) continue ;; esac
      # Strip surrounding quotes
      value="${value%\"}"; value="${value#\"}"
      value="${value%\'}"; value="${value#\'}"
      # dotenv never overrides existing values
      if [ -z "${!key+x}" ]; then
        export "$key"="$value"
      fi
    done < "$f"
  fi
done

# --- Config ----------------------------------------------------------------
ADMIN_TOKEN="${ADMIN_TOKEN:-}"
API_URL="${API_URL:-http://localhost:3000}"
SNAPSHOT_DIR=".claude/migration-snapshots"
TAG_V1="${TAG_V1:-YYYY-MM-DD}"
API_PREFIX="api/${TAG_V1}"
MAINTENANCE_URL="${API_URL}/${API_PREFIX}/maintenance"

# --- Pre-flight ------------------------------------------------------------
if [ -z "$ADMIN_TOKEN" ]; then
  echo "Error: ADMIN_TOKEN environment variable is required."
  echo ""
  echo "  TOKEN=\$(curl -s -X POST ${API_URL}/${API_PREFIX}/auth/login \\"
  echo '    -H "Content-Type: application/json" \'
  echo '    -d '\''{"email":"admin@test.com","password":"admin123"}'\'' | jq -r ".sessionToken")'
  echo "  ADMIN_TOKEN=\$TOKEN $0"
  echo ""
  exit 1
fi

echo "=== Safe Migration ==="
echo "  API prefix:    ${API_PREFIX}"
echo "  Snapshot dir:  ${SNAPSHOT_DIR}"
echo ""

# --- Step 1: Enable maintenance mode --------------------------------------
echo "[1/5] Enabling maintenance mode ..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${MAINTENANCE_URL}/enable" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

if [ "$HTTP_CODE" != "201" ]; then
  echo "  FAILED (HTTP ${HTTP_CODE}). Is the server running? Is ADMIN_TOKEN valid?"
  exit 1
fi
echo "  Maintenance mode ON — new requests will receive 503."

# --- Step 2: Drain in-flight requests -------------------------------------
echo "[2/5] Draining in-flight requests (5 s) ..."
sleep 5

# --- Step 3: pg_dump snapshot ---------------------------------------------
mkdir -p "${SNAPSHOT_DIR}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_FILE="${SNAPSHOT_DIR}/${TIMESTAMP}_pre.sql"

DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-indie}"
DB_PASSWORD="${DATABASE_PASSWORD:-indie}"
DB_NAME="${DATABASE_NAME:-indie}"
DATABASE_URL="${DATABASE_URL:-postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}}"

echo "[3/5] Snapshotting database ..."
pg_dump "${DATABASE_URL}" > "${SNAPSHOT_FILE}"
echo "  Snapshot: ${SNAPSHOT_FILE} ($(wc -c < "${SNAPSHOT_FILE}") bytes)"

# --- Step 4: Run migration ------------------------------------------------
echo "[4/5] Running drizzle-kit migrate ..."
npx --yes drizzle-kit migrate

# --- Step 5: Disable maintenance mode -------------------------------------
echo "[5/5] Disabling maintenance mode ..."
curl -s -X POST "${MAINTENANCE_URL}/disable" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" > /dev/null
echo "  Maintenance mode OFF — traffic resumed."

echo ""
echo "=== Done ==="
echo "  Snapshot saved at: ${SNAPSHOT_FILE}"
echo ""
echo "  To restore from snapshot:"
echo "    pg_restore or: dropdb ${DB_NAME} && createdb ${DB_NAME} && psql ${DB_NAME} < ${SNAPSHOT_FILE}"
