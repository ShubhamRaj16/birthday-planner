#!/usr/bin/env bash
# SCRUM-55 — Remove dead `Reminder.read?: boolean` from frontend types.ts.
# Backend has no `read` column; read-state is type==='read'.
# Idempotent. Run from repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
TYPES="frontend/src/types.ts"

echo "== SCRUM-55: drop Reminder.read =="

# Guard: ensure nothing actually reads `.read` on a reminder before deleting.
HITS=$(grep -rn "\.read\b" frontend/src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  | grep -iv "isCover\|readyState\|readFileSync\|\.readonly" \
  | grep -i "reminder" || true)
if [ -n "$HITS" ]; then
  echo "  ABORT: found possible Reminder.read usage:"
  echo "$HITS"
  exit 1
fi

if grep -qn "^  read?: boolean;" "$TYPES"; then
  # Remove the exact line inside the Reminder interface
  sed -i '' "/^  read?: boolean;$/d" "$TYPES"
  echo "  removed line: read?: boolean;"
else
  echo "  skip: read? line not found (already removed?)"
fi

echo "== verify: tsc --noEmit (frontend) =="
( cd frontend && npx tsc --noEmit && echo "  tsc clean" ) || { echo "  tsc FAILED"; exit 1; }
echo "== done =="
