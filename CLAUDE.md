# Birthday Planner — project brief for Claude Code

Local-first birthday-party planner for kids. No auth. Runs on the owner's machine;
a co-host uses it over home WiFi (backend binds 0.0.0.0:3001).

## Stack
- Frontend: React (Vite), React Router, TailwindCSS, dayjs, recharts, axios
- Backend:  Node.js + Express, Prisma ORM, SQLite (WAL mode), node-cron, multer
- AI:       @anthropic-ai/sdk (model: claude-sonnet-4-20250514), key in .env

## Architecture
- Backend layers: Routes (thin, validate) -> Services (all logic) -> Prisma. No controllers.
- Frontend: page-driven, no global store. Custom hooks per resource.
  - useEvent(id) aggregates all event sub-resources, polls every 30s.
  - useReminders() polls unread count every 60s.
- API base URL is dynamic: http://<window.location.hostname>:3001/api/v1
- Response envelope: { data, error, meta }

## Data model (camelCase fields; Prisma maps to snake_case columns)
Child 1->* Event 1->* { Guest, Task, Expense, Gift, Photo, Reminder }
- No User / EventCollaborator table.
- Cascade delete: deleting an Event removes all its sub-resources.
- Event.status: Draft -> Active -> Completed
  - Draft->Active: manual (auto-suggested on first invite sent)
  - Active->Completed: nightly cron at 00:05 when date has passed

## Key behaviours
- WhatsApp invites: wa.me deep links (no Business API). Same card for all guests;
  guest name personalised per send. MyGate link stored on event, injected into message.
  Card image attached manually by user (wa.me can't attach images).
- Reminders: stored with triggerAt; node-cron every 60s marks fired=true. In-app only.
- Budget categories (fixed): venue, catering, cake, decorations, return gifts,
  entertainment, photography, invites/printing, miscellaneous. Alert at 80% & 100%.
- Tasks: auto-generated default checklist on event create (editable).
- Concurrency: last-write-wins + 30s polling + SQLite WAL. No realtime.

## Build order
1. Core shell: setup, child profiles, dashboard, calendar (custom MonthGrid), reminders, basic events
2. Event planning: events, guests+RSVP, tasks, budget, gifts
3. Invitations & MyGate: card upload, wa.me composer, MyGate link, bulk send
4. AI & memories: Claude suggestions, photo gallery, Google Photos embed, timeline, backup

## Out of scope (v1)
auth, cloud hosting, guest-contributed uploads, realtime editing,
WhatsApp Business API, per-guest card rendering, push/email, i18n, native app.
