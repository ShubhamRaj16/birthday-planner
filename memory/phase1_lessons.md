---
name: phase1-lessons
description: Bugs found and rules established during Phase 1 build — apply these to every future phase to avoid repeating mistakes
metadata:
  type: project
---

Phase 1 completed 2026-05-30. All backend stories (SCRUM-6,7,9,11) done. Frontend (Webpack SSR + Redux + styled-components) built and running. Full retrospective in Confluence "Phase 1 Retrospective" page.

## SQLite / Prisma rules (never break these)
- **No Prisma enums** — SQLite doesn't support them. Use `String @default("Draft")` and validate in service layer.
- **WAL PRAGMA** — use `$queryRawUnsafe`, NOT `$executeRawUnsafe`. SQLite PRAGMAs return rows; execute rejects results.
- **DATABASE_URL** — write as `file:./birthday.db` (relative to `prisma/schema.prisma`). Using `file:./prisma/birthday.db` creates a nested `prisma/prisma/` directory.
- **Cascade deletes** — always add `onDelete: Cascade` on FK relations where the child is owned by the parent aggregate root. Define at schema design time, not after.

## Error handler — Prisma code mapping
Always map in `errorHandler.js` before the generic 500:
- P2025 (record not found on update/delete) → HTTP 404
- P2003 (FK constraint violation) → HTTP 409

## Multipart / file upload rule
Any route that receives `multipart/form-data` (even if the file is optional) MUST have multer middleware (`upload.single()` or `upload.none()`). `express.json()` does NOT parse multipart bodies — `req.body` will be empty.

## Port map — fixed, never change
- 3001 = Backend API (Express + Prisma)
- 3000 = Frontend SSR server (internal, compiled by Webpack)
- 3002 = Frontend Webpack Dev Server (user opens this in browser)

## CORS
`ALLOWED_ORIGINS` in `backend/server.js` must include 3000, 3002 (and 192.168.x.x variants). Was written for Vite (:5173) originally — had to fix after stack switch.

## Frontend field name discipline
**Most recurring bug class in Phase 1.** Before writing any `object.field` reference in JSX:
1. Read `prisma/schema.prisma` — use the exact camelCase field names
2. Hit the actual API with curl and inspect the JSON response
3. Never guess field names from intuition

Specific mismatches caught in Phase 1:
- `child.dateOfBirth` → `child.dob` (used in Children, Dashboard, Calendar)
- `child.avatarUrl` → `child.photo` (used in Children, Dashboard)

## API completeness rule
Do not ship a UI element that calls an endpoint that doesn't exist yet. Either implement both together or leave the UI hidden. (Caused 404 on task toggle in Phase 1.)

**Why:** [[project-overview]]
