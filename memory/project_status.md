---
name: project-status
description: Current build state of birthday-planner — what exists vs what needs to be built
metadata:
  type: project
---

As of 2026-05-29, the project is a blank monorepo scaffold. Only one commit exists ("chore: scaffold birthday-planner monorepo").

**What exists:**
- Root `package.json` with `npm run dev` (concurrently runs both services), `install:all`, `backup` scripts
- `.env.example` — needs copying to `.env` with real `ANTHROPIC_API_KEY`
- `backend/` — empty `src/{lib,middleware,routes,services}/`, empty `prisma/`, `uploads/{avatars,invite-cards,photos,receipts}/`
- `frontend/` — empty `src/{components,hooks,lib,pages}/`
- No backend or frontend `package.json` yet (deps not installed)
- No Prisma schema, no migrations, no source files

**Why:** Project was just initialized; all implementation work is ahead.

**How to apply:** When asked to build any feature, start from scratch — no existing code to modify. Follow the build order in [[project-overview]]: Phase 1 (core shell) comes first.
