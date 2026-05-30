---
name: phase6-deferred-gaps
description: Gap items deferred to Phase 6 (Gaps & Polish) — do NOT work on these during Phase 3, 4, or 5
metadata:
  type: project
---

All gaps below were identified during a Phase 2 codebase review on 2026-05-30. They are tracked in Jira under epic **SCRUM-35 (Phase 6 — Gaps & Polish)**. Do not implement any of these unless the user explicitly asks for Phase 6 work.

**Why deferred:** Phase 3 (Invitations & MyGate) and Phase 4 (AI & Memories) are higher priority. These gaps won't block core functionality.

## 🔴 Bugs (High priority, but still deferred to Phase 6)

| Ticket | Issue | Fix location |
|--------|-------|-------------|
| SCRUM-36 | Avatar URLs hardcoded to `localhost:3001` — breaks co-host access | `Children.jsx:432`, `Dashboard.jsx:180` → use `window.location.hostname:3001` |
| SCRUM-37 | Reminder badge in Header never polls — count only updates on /reminders visit | `Header.jsx` → add `setInterval(fetchUnreadCount, 60000)` |
| SCRUM-38 | `npm run backup` crashes — `backup.js` doesn't exist | Create `backend/src/lib/backup.js` using `archiver` npm package |

## 🟡 Missing features (Medium priority)

| Ticket | Issue |
|--------|-------|
| SCRUM-39 | No event edit form — can't change venue/theme/budget/notes after creation |
| SCRUM-40 | Receipt upload UI missing in BudgetTracker (backend endpoint exists) |
| SCRUM-41 | Task toggle/delete errors only `console.error` — no user feedback |
| SCRUM-42 | No delete confirmations for guests/expenses/gifts (child has it, others don't) |
| SCRUM-43 | Reminders require eventId — can't create standalone reminders |
| SCRUM-44 | CSV import in GuestList has no format hint or sample download |

## ⚪ Nice-to-have (Low priority)

| Ticket | Issue |
|--------|-------|
| SCRUM-45 | No event status filter (Draft/Active/Completed) on Events list |
| SCRUM-46 | No global error toast system — errors surface inconsistently |
| SCRUM-47 | No single-command production serve (`npm start` only starts API) |
| SCRUM-48 | No CSV export for guest list or expense list |

**How to apply:** If a user asks to fix any of these, reference the Jira ticket and implement the exact fix described. If asked to work on Phase 3 or 4, ignore this list entirely.
