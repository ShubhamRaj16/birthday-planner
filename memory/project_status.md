---
name: project-status
description: Current build state of birthday-planner — what exists vs what needs to be built
metadata:
  type: project
---

As of 2026-05-30, Phase 1 (Core Shell) is complete.

**What exists:**
- GitHub: github.com/ShubhamRaj16/birthday-planner, branch `feat/phase-1-backend` (all Phase 1 work)
- Backend fully running on port 3001: `/children`, `/events`, `/tasks`, `/reminders`, `/health`
- Frontend fully built (Webpack SSR + Redux + styled-components) — pages: Dashboard, Children, Events, EventDetail, Calendar, Reminders, NotFound
- Jira: SCRUM-6, 7, 9, 11 → Done in SCRUM Sprint 0
- Confluence: Backend HLD v1.2, Frontend HLD v1.2, Repo Structure v1.2, Phase 1 Retrospective

**Port map:**
- 3001 = Backend API
- 3000 = SSR server (internal)
- 3002 = Webpack Dev Server (user opens this)

**What's next (Phase 2):**
- Guest list + RSVP (SCRUM backlog)
- Expense/budget tracking
- Gift tracker
- WhatsApp invite flow (wa.me deep links, card upload)
- AI suggestions (Claude SDK)
- Photo gallery

**Why:** Phase 1 scope = core shell only; all feature work deferred to Phase 2+. See [[phase1-lessons]] before starting Phase 2.
