# Birthday Planner

A local-first web app to plan and manage kids' birthday parties — guests, tasks,
budget, gifts, WhatsApp invites with MyGate codes, and photo memories.
Runs entirely on your machine; a co-host can use it over the home WiFi.

## Quick start

```bash
npm install
cp packages/core/.env.example packages/core/.env   # add your config
npm exec -w @birthday-planner/core -- prisma migrate dev --name init
npm run dev   # API :3001 + web dev-server :3000
```

- App (you):      http://localhost:3000
- Co-host (WiFi): http://<your-ip>:3000   (find IP via `ipconfig` / `ifconfig`)

## Layout

- `packages/core/`  Node.js + Express + Prisma (SQLite, WAL mode) — API server
- `packages/ui/`    React + Webpack + styled-components — shared UI library
- `apps/web/`       Thin SPA shell — mounts `@birthday-planner/ui` in the browser

See `CLAUDE.md` for full architecture context.

## Backup

```bash
npm run backup   # zips packages/core/prisma/birthday.db + packages/core/uploads/
```
