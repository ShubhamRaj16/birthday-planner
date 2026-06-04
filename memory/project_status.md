---
name: project-status
description: Current build state of birthday-planner — completed phases, active branch, next stories
metadata:
  type: project
---

As of 2026-06-04, Phases 1–7 (SCRUM-66) are complete. Next: SCRUM-63 (WebSocket sync).

## Phases done

- **Phase 1 — Core Shell (SCRUM-5):** Express/Prisma/WAL, children, events, tasks, reminders, cron, Dashboard, Calendar
- **Phase 2 — Event Planning (SCRUM-14):** guests+RSVP+CSV, tasks UI, budget/expenses+chart, gift tracker, 30s polling
- **Phase 3 — Invitations & MyGate (SCRUM-20):** card upload, wa.me composer, bulk send queue, MyGate link + reminder
- **Phase 4 — AI & Memories (SCRUM-25):** AI suggestions (Claude SDK), photo gallery, timeline, backup script
- **Phase 5 — Automated Testing (SCRUM-30):** Vitest + Supertest; 38 test files / 239 tests; 95% coverage gate on redux/api/lib
- **Phase 6 — Deferred Gaps (SCRUM-35):** 13 polish/bug items shipped
- **Phase 7 — Shared-packages monorepo (SCRUM-66):** `backend/` → `packages/core`; `frontend/` → `packages/ui` + `apps/web`; SSR dropped; AI deleted; CI updated

## Current branch
`feat/scrum-66-shared-packages` — PR #8 open against `master`

## Stack (actual)
- `packages/core`: Node.js + Express + Prisma/SQLite (WAL), node-cron, multer, archiver
- `packages/ui`: Webpack + Redux Toolkit + styled-components + React Router
- `apps/web`: thin SPA shell

## Port map
- 3001 = Core API (`packages/core`)
- 3000 = Web dev-server / production static server (`apps/web`)

## Story order (Phase 7 onwards)
SCRUM-66 (done) → 63 → 60 → 61 → 62 → 64 → 65

## Constraints
- Tests NEVER touch `birthday.db` — always `test.db`
- AI SDK mocked globally in tests (no real API calls)
- `npm test` runs full suite from repo root
