# Birthday Planner

A local-first web app to plan and manage kids' birthday parties — guests, tasks,
budget, gifts, WhatsApp invites with MyGate codes, AI suggestions, and photo memories.
Runs entirely on your machine; a co-host can use it over the home WiFi.

## Quick start

```bash
npm run install:all          # install root + backend + frontend deps
cp .env.example .env          # add your ANTHROPIC_API_KEY
cd backend && npx prisma migrate dev --name init && cd ..
npm run dev                   # backend :3001 + frontend :5173
```

- App (you):      http://localhost:5173
- Co-host (WiFi):  http://<your-ip>:5173   (find IP via `ipconfig` / `ifconfig`)

## Layout

- `backend/`  Node.js + Express + Prisma (SQLite, WAL mode)
- `frontend/` React + Vite + Tailwind

See the design docs in Confluence and `CLAUDE.md` for full context.

## Backup

```bash
npm run backup   # zips backend/prisma/birthday.db + backend/uploads/
```
