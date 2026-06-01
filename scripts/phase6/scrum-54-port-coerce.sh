#!/usr/bin/env bash
# SCRUM-54 (partial) — Coerce PORT to number in the SSR server.
# This fixes ONLY the app.listen(PORT) type error (string|number -> number).
# The other two SCRUM-54 errors (Provider JSX generics, seoService string|undefined)
# need judgment and are handled in code review, not this script.
# Idempotent. Run from repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
SRV="frontend/src/server/index.ts"

echo "== SCRUM-54 (partial): coerce PORT to number =="

if grep -qn "const PORT = process.env.PORT || 3000;" "$SRV"; then
  sed -i '' "s#const PORT = process.env.PORT || 3000;#const PORT = Number(process.env.PORT) || 3000;#" "$SRV"
  echo "  patched: PORT now Number(process.env.PORT) || 3000"
elif grep -qn "Number(process.env.PORT)" "$SRV"; then
  echo "  skip: already coerced"
else
  echo "  WARN: PORT declaration pattern not found — inspect $SRV manually"
fi

echo "== note: this does NOT widen tsconfig include; full SCRUM-54 still open =="
echo "== done =="
