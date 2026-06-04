---
name: project-overview
description: Core facts about the birthday-planner project — stack, architecture, data model, build status
metadata:
  type: project
---

Local-first birthday party planner for kids. No auth. Runs on owner's machine; co-host accesses over home WiFi (backend on 0.0.0.0:3001).

**Why:** Personal household tool — no need for cloud, auth, or multi-tenancy.

**How to apply:** Keep all decisions local-first. No cloud hosting, auth flows, or realtime sync.

## Stack (Phase 7 / SCRUM-66)
- `packages/core`: Node.js + Express, Prisma ORM, SQLite (WAL), node-cron, multer — port 3001
- `packages/ui`: React + Webpack, Redux Toolkit, styled-components, React Router, axios
- `apps/web`: Thin SPA shell — imports from `@birthday-planner/ui`, mounts in browser — port 3000
- AI deleted in Phase 7 ADR (fully offline, zero outbound calls)

## Architecture
- Backend: Routes (thin, validate) → Services (all logic) → Prisma. No controllers.
- Frontend: SPA (no SSR). Redux global store. Page components in `packages/ui/src/pages/`.
  - `createStore()` — Redux store factory exported from `@birthday-planner/ui`
  - `createClientRoutes()` — async route factory; 7 routes
- API base URL: `http://<window.location.hostname>:3001/api/v1`
- Response envelope: `{ data, error, meta }`

## Data model
Child 1→* Event 1→* { Guest, Task, Expense, Gift, Photo, Reminder }
- No User / EventCollaborator table
- Cascade delete on Event
- Event.status: Draft → Active → Completed
  - Active→Completed: nightly cron at 00:05 when date passed

## Key behaviours
- WhatsApp invites: wa.me deep links (no Business API); card image attached manually
- Reminders: triggerAt stored; node-cron every 60s marks fired=true; in-app only
- Budget categories (fixed 9): venue, catering, cake, decorations, return gifts, entertainment, photography, invites/printing, miscellaneous; alerts at 80% & 100%
- Tasks: auto-generated default checklist on event create
- Concurrency: last-write-wins + 30s polling + SQLite WAL. No realtime.

## Out of scope (v1)
auth, cloud hosting, guest-contributed uploads, realtime editing, WhatsApp Business API, per-guest card rendering, push/email, i18n, native app
