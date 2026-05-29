---
name: project-overview
description: Core facts about the birthday-planner project — stack, architecture, data model, build status
metadata:
  type: project
---

Local-first birthday party planner for kids. No auth. Runs on owner's machine; co-host accesses over home WiFi (backend on 0.0.0.0:3001).

**Why:** Personal household tool — no need for cloud, auth, or multi-tenancy.

**How to apply:** Keep all decisions local-first. No cloud hosting, auth flows, or realtime sync.

## Stack
- Frontend: React (Vite), React Router, TailwindCSS, dayjs, recharts, axios — port 5173
- Backend: Node.js + Express, Prisma ORM, SQLite (WAL), node-cron, multer — port 3001
- AI: @anthropic-ai/sdk, model `claude-sonnet-4-20250514`, key in `.env`

## Architecture
- Backend: Routes (thin, validate) → Services (all logic) → Prisma. No controllers.
- Frontend: page-driven, no global store. Custom hooks per resource.
  - `useEvent(id)` — aggregates all event sub-resources, polls every 30s
  - `useReminders()` — polls unread count every 60s
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

## Build order (phased)
1. Core shell: setup, child profiles, dashboard, calendar (custom MonthGrid), reminders, basic events
2. Event planning: events, guests+RSVP, tasks, budget, gifts
3. Invitations & MyGate: card upload, wa.me composer, MyGate link, bulk send
4. AI & memories: Claude suggestions, photo gallery, Google Photos embed, timeline, backup

## Out of scope (v1)
auth, cloud hosting, guest-contributed uploads, realtime editing, WhatsApp Business API, per-guest card rendering, push/email, i18n, native app
