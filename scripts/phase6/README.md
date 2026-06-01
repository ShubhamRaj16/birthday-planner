# Phase 6 — Group B cleanup scripts

Deterministic, idempotent fixes for the mechanical Phase 6 tech-debt tickets.
Run each from the **repo root**. Each script verifies before/after and is safe to
re-run.

| Script | Ticket | What it does | Scriptable? |
|--------|--------|--------------|-------------|
| `scrum-53-dedupe.sh` | SCRUM-53 | `git rm` 6 stale `.js` twins; repoint vitest `setupFiles` → `setup.ts`; drop `setup.js` | ✅ fully |
| `scrum-55-reminder-read.sh` | SCRUM-55 | Delete dead `Reminder.read?` from `types.ts` (guards against real usage first) | ✅ fully |
| `scrum-54-port-coerce.sh` | SCRUM-54 | Coerce `PORT` to `Number(...)` in SSR `index.ts` (the safe 1/3 of SCRUM-54) | ⚠️ partial |

## Not scriptable (need code judgment — done as direct edits, not sed)

- **SCRUM-56** — aiService `require()` → top-level `import`. Structured edit; a
  regex sed would be fragile. Applied directly in the same PR.
- **SCRUM-54 (rest)** — `Provider` JSX generics typing + `seoService` `string|undefined`
  guards, plus widening `tsconfig.json` `include`. Needs review, not a transform.
- **SCRUM-39/40/44/45/46/47/48/57/58** — feature builds. Not mechanical.

## Recommended order

```bash
bash scripts/phase6/scrum-53-dedupe.sh
cd frontend && npm test && npm run build && cd ..   # verify dedupe
bash scripts/phase6/scrum-55-reminder-read.sh
bash scripts/phase6/scrum-54-port-coerce.sh
```

Then commit per ticket. `npm test` (frontend) should report **fewer** test files
after SCRUM-53 (waLink no longer double-counted) with the same assertions passing.
