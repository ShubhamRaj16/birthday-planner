#!/usr/bin/env bash
# SCRUM-53 — Remove stale .js twins left by the TS migration + fix vitest setupFiles.
# Idempotent: skips files already gone. Run from repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
FE="frontend"

echo "== SCRUM-53: dedupe stale .js twins =="

# Stale .js files whose .ts/.cjs replacement is the one the build/tests use.
STALE=(
  "$FE/src/server/index.js"
  "$FE/src/client/errorHandler.js"
  "$FE/src/tests/utils/waLink.test.js"
  "$FE/scripts/dev.js"
  "$FE/config/webpack.client.js"
  "$FE/config/webpack.server.js"
  "$FE/src/routes/clientRoutes.js"
  "$FE/src/routes/createRoutes.js"
  "$FE/src/routes/pageLoaders.js"
  "$FE/src/routes/serverRoutes.js"
  "$FE/src/server/html.js"
  "$FE/src/services/seoService.js"
)

for f in "${STALE[@]}"; do
  if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    git rm -q "$f"
    echo "  removed (tracked): $f"
  elif [ -e "$f" ]; then
    rm -f "$f"
    echo "  removed (untracked): $f"
  else
    echo "  skip (absent): $f"
  fi
done

# Repoint vitest setupFiles from the old .js mock to the .ts mock, then drop .js.
VITEST="$FE/vitest.config.mjs"
if grep -q "src/test/setup.js" "$VITEST"; then
  # macOS/BSD sed in-place
  sed -i '' "s#'./src/test/setup.js'#'./src/test/setup.ts'#" "$VITEST"
  echo "  patched: $VITEST -> setup.ts"
else
  echo "  skip: $VITEST already on setup.ts (or pattern changed)"
fi

SETUP_JS="$FE/src/test/setup.js"
if git ls-files --error-unmatch "$SETUP_JS" >/dev/null 2>&1; then
  git rm -q "$SETUP_JS"
  echo "  removed (tracked): $SETUP_JS"
elif [ -e "$SETUP_JS" ]; then
  rm -f "$SETUP_JS"
  echo "  removed (untracked): $SETUP_JS"
fi

echo "== verify: no remaining .js/.ts twins =="
TWINS=0
while IFS= read -r ts; do
  base="${ts%.ts}"
  if [ -f "$base.js" ]; then echo "  TWIN: $base.js + .ts"; TWINS=$((TWINS+1)); fi
done < <(git ls-files "$FE/src/**/*.ts" 2>/dev/null || true)
[ "$TWINS" -eq 0 ] && echo "  none" || { echo "  $TWINS twin(s) remain"; }

echo "== done. Next: cd frontend && npm test && npm run build =="
