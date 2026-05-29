# Birthday Planner — Claude Code Build Prompts

Prompts to drive Claude Code through the build, in execution order. Run Claude Code
from inside the project so it picks up `CLAUDE.md` automatically:

```bash
cd /Users/shubhamraj/Documents/GitHub/birthday-planner
claude
```

Paste prompts **one at a time**, and verify each works before moving to the next.

---

## Option A — One orchestrated run (sub-agents + PR)

Use this if you want Claude Code to do the whole Phase 1 backend in one go, on a
branch, and open a PR for review.

```
Read CLAUDE.md and the four backend tasks for Phase 1 (foundation, events+tasks,
children, reminders+cron). Execute them in order on a new branch called
`feat/phase-1-backend`. You can parallelise independent work using sub-agents where
it helps, but keep the Prisma schema changes sequential to avoid migration conflicts.
After each task, run the migration and a quick smoke test. When all four are done and
the server boots cleanly with the health check passing, commit the work and open a
pull request against main with a summary of what each task delivered and how to test it.
```

---

## Option B — Step by step (one prompt per task)

Use this for tighter control, testing after each step.

### Prompt 1 — SCRUM-6: Backend foundation

```
Read CLAUDE.md for full context. Set up the backend foundation only (no feature
routes yet). Create backend/package.json with express, @prisma/client, prisma, cors,
dotenv, multer, node-cron, and a dev script using nodemon. Create the Prisma schema
datasource for SQLite. Build backend/server.js binding to 0.0.0.0:3001, with
express.json(), express.static() serving /uploads, the CORS middleware allowing
localhost:5173 and 192.168.*.*:5173, a global error handler returning the
{ data, error, meta } envelope, and a GET /api/v1/health route returning
{ data: { status: "ok" } }. Create src/lib/prisma.js exporting a singleton Prisma
client that runs PRAGMA journal_mode=WAL on startup. Then run the install and start
the server so we can confirm it boots cleanly.
```

**Verify:** open `http://localhost:3001/api/v1/health` → should return the ok response.

### Prompt 2 — SCRUM-11: Event + Task models (backend)

```
Now implement the Event and Task models and their backend. Add Prisma models per
CLAUDE.md: Event (id, childId, date, venue, address, theme, budget, status enum
Draft/Active/Completed, myGateLink, cardPath, messageTemplate, notes) and Task
(id, eventId, title, category, dueDate, done, notes), with cascade delete from Event
to Task. Create src/lib/taskDefaults.js with the 10 default tasks and their
day-offsets. Build src/services/eventService.js (CRUD + auto-generate the default
tasks on create with due dates relative to the event date) and src/routes/events.js
(GET all, GET :id, POST, PUT, DELETE, GET /upcoming, POST /:id/activate). Run
prisma migrate dev --name events_tasks and test that creating an event returns it
with 10 tasks.
```

**Verify:** create an event via the API → response includes 10 tasks with correct
relative due dates.

### Prompt 3 — SCRUM-7: Child model (backend)

```
Implement the Child backend. Add the Prisma Child model (id, name, dob, photo,
interests, allergies, school) with a 1-to-many relation to Event. Build
src/services/childService.js (CRUD) and src/routes/children.js (GET all, GET :id,
POST, PUT, DELETE, POST /:id/avatar using multer to save into uploads/avatars/).
Migrate and test creating and listing a child.
```

**Verify:** create and list a child; upload an avatar and confirm it's served from
`/uploads/avatars/`.

### Prompt 4 — SCRUM-9: Reminders + cron (backend)

```
Implement the Reminder backend and scheduled jobs. Add the Prisma Reminder model
(id, eventId, triggerAt, fired, label, type). Build src/services/reminderService.js
and src/routes/reminders.js (GET, GET /unread-count, POST, PUT, DELETE,
POST /mark-read). Create src/lib/cron.js with two node-cron jobs: every 60s mark due
reminders fired; nightly at 00:05 sweep Active events past their date to Completed.
Wire cron startup into server.js. Test that a reminder with a near triggerAt flips to
fired within a minute.
```

**Verify:** create a reminder with `triggerAt` ~1 min out → it flips to `fired: true`;
unread count reflects it.

---

## Jira mapping

| Prompt | Story | Summary |
|--------|-------|---------|
| 1 | SCRUM-6 | Backend foundation — Express, Prisma/WAL, middleware |
| 2 | SCRUM-11 | Basic event creation + auto-generated task checklist |
| 3 | SCRUM-7 | Child profiles — model, API, UI (backend half) |
| 4 | SCRUM-9 | Reminders — node-cron jobs + notification centre (backend half) |

Suggested order: 1 → 2 → 3 → 4 (foundation first, then the Event spine, then Child,
then Reminders which depend on events for the nightly sweep).

---

## Frontend (later — Phase 1 remainder)

After the backend is merged, the frontend halves of SCRUM-7, 8, 9, 10, 11 follow.
Ask for those prompts when you're ready to build the UI.

---

## Reference docs (Confluence)

- PRD v1.2
- Repository Structure & Resource Requirements v1.1
- Backend HLD — Node.js + Express + SQLite v1.1
- Frontend HLD — React + Vite v1.1

*Compiled May 2026.*
