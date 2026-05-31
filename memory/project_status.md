---
name: project-status
description: Current build state of birthday-planner — what exists vs what needs to be built
metadata:
  type: project
---

As of 2026-05-30, Phases 1–4 complete. Phase 5 (Automated Testing) is next.

**Phases done:**
- Phase 1 — Core Shell (SCRUM-5): Express/Prisma/WAL, children, events, tasks, reminders, cron, Dashboard, Calendar
- Phase 2 — Event Planning (SCRUM-14): guests+RSVP+CSV, tasks UI, budget/expenses+chart, gift tracker, 30s polling
- Phase 3 — Invitations & MyGate (SCRUM-20): card upload, wa.me composer, bulk send queue, MyGate link + reminder
- Phase 4 — AI & Memories (SCRUM-25): AI suggestions (Claude SDK), photo gallery, timeline, backup script

**Current branch:** `feat/phase-4-ai-memories` — all Phase 4 work committed, not yet merged to master

**Stack (actual built):**
- Backend: Node.js + Express + Prisma/SQLite (WAL), node-cron, multer, archiver, @anthropic-ai/sdk
- Frontend: Webpack SSR + Redux Toolkit + styled-components + React Router (NOT Vite)

**Port map:**
- 3001 = Backend API
- 3000 = SSR server (internal)
- 3002 = Webpack Dev Server

**Phase 5 — Automated Testing (SCRUM-30) — 4 stories:**
- SCRUM-31: Test harness — Vitest + Supertest (backend), Vitest + RTL (frontend), separate test.db, Anthropic SDK mock globally, npm test/watch/coverage scripts, seed fixtures
- SCRUM-32: Backend unit tests — service layer (eventService, guestService, expenseService, giftService, reminderService, whatsappService, aiService)
- SCRUM-33: Backend integration tests — all API routes via Supertest against test.db
- SCRUM-34: Frontend tests — hooks (useEvent/useChildren/useReminders), components (GuestList, TaskChecklist, BudgetTracker, GiftTracker, InviteFlow, MonthGrid, ReminderBadge), utils (dateUtils, waLink)

**Phase 5 constraints:**
- Tests NEVER touch birthday.db — always test.db
- AI SDK mocked globally (no real API calls/cost)
- `npm test` runs full suite from repo root

**Phase 6 deferred (SCRUM-35):** 13 open items — do NOT work on during Phase 5. See [[phase6-deferred-gaps]].

**Why:** Feature build complete; testing phase needed before gaps/polish.
