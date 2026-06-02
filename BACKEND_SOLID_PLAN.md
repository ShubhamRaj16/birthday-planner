# Backend SOLID Principles — Review & Adoption Plan

**Author:** Principal Engineer review
**Scope:** `backend/src` (Node + Express, Prisma/SQLite, node-cron, multer, @anthropic-ai/sdk)
**Status:** Proposal / planning
**Date:** 2026-06-01

---

## 0. TL;DR

**The backend is in good shape** — materially healthier than the frontend. The layering the project
brief mandates (Routes → Services → Prisma, no controllers) is **actually followed**: routes are
thin-ish, services hold the data logic, and `lib/` holds pure helpers. Total `src` is ~1,662 LOC;
the largest service is 117 LOC. There is no god-file here.

Two parts of the code are already **exemplary SOLID** and should be the template for the rest:
- `services/aiService.ts` inverts its dependency on the Anthropic SDK behind an `AnthropicClient`
  interface with lazy construction + `_setClientForTesting()` injection (**DIP done right**), and
  routes suggestion types through a `PROMPTS: Record<SuggestionType, PromptFn>` map so a new
  suggestion type is **added, not edited into a switch** (**OCP done right**).
- `middleware/errorHandler.ts` centralizes error → HTTP envelope mapping (**SRP**).

The remaining work is **small and mechanical**, not architectural: the response envelope and
try/catch are copy-pasted into ~40 route handlers, validation is ad-hoc inline, and `prisma` is a
hard-imported singleton (the one place we *didn't* apply the DIP seam we already use for Anthropic).

---

## 0.1 SOLID Scorecard — current compliance & path to 100%

Per-principle adherence today, the main gap, and the concrete action + phase that closes it to 100%.
The BE starts much higher than the FE — layering is already done; gaps are boilerplate + validation.

| Principle | Current | Main gap (evidence) | Action to reach 100% | Phase |
|-----------|:------:|---------------------|----------------------|:-----:|
| **S** — Single Responsibility | **88%** | ~~Per-handler try/catch + envelope~~ **DONE (Phase 1):** all 11 routes use `asyncHandler`+`respond`. Remaining: inline validation, multer inlined, 2 routes (`eventTasks`,`whatsapp`) touch prisma directly | validation middleware; extract multer to `uploads/`; push prisma logic into services | 2, 3 |
| **O** — Open/Closed | **85%** | ~~Route boilerplate cloned ~40×~~ **DONE (Phase 1):** `asyncHandler` reused everywhere. Remaining: `errorHandler` Prisma codes still an if-chain (`:15-31`) | `PRISMA_ERROR_MAP` lookup mirroring `aiService.PROMPTS` | 3 |
| **L** — Liskov Substitution | **90%** | No class hierarchies; `aiService` real/mock client already substitutable | Preserve contract discipline when adding the prisma seam (real + fake interchangeable) | 4 |
| **I** — Interface Segregation | **85%** | Good — `CreateEventInput`/`UpdateEventInput` segregated; raw `req.body: any` still reaches services | Derive request types from validation schemas; never pass unvalidated `req.body` | 2 |
| **D** — Dependency Inversion | **70%** | `aiService` inverts Anthropic SDK (done right); `prisma` hard-imported singleton in every service | Add injectable prisma seam (`aiService` style) **only** for services worth unit-testing without a DB | 4 |
| **Overall** | **~84%** | Boilerplate gone; validation boundary + error-map remain | Phases 2→4 below | — |

> **Phase 1 shipped (2026-06-01):** new `src/http/asyncHandler.ts` + `src/http/respond.ts` (`sendOk`/`sendErr`).
> All 11 route files migrated — zero per-handler try/catch, zero inline `{data,error,meta}` literals
> (`error: null, meta` count in routes/ = 0). `ai.ts` error shape normalized to `{code,message}`. Two SRP
> smells flagged in-code for a later phase: `eventTasks.ts` + `whatsapp.ts` call prisma directly from the
> route. Typecheck ✓, 134/134 tests ✓.

**Definition of 100% per principle** = the matching Acceptance Criteria in §7 are all checked **and**
the §4 standard is enforced in review. Note L/D are intentionally capped below a forced 100%: per §8
we do **not** invert every Prisma dependency — real-SQLite tests are the right call for a local-first
app, so "100%" here means *the seam exists where it pays*, not abstraction everywhere.

---

## 1. Current Architecture (as-is)

```
routes/<resource>.ts
  ├── express Router
  ├── multer config (sometimes inline, e.g. events.ts:9-15)
  ├── per-handler: try { validate inline; svc.call(); res.json({data,error:null,meta}) } catch (e) { next(e) }
  └── manual status codes + manual envelope literal, repeated

services/<resource>.ts
  ├── import prisma (concrete singleton)
  └── pure data functions (clean, single-purpose)   ← GOOD

middleware/errorHandler.ts   ← maps Prisma codes + generic → {data,error,meta}   ← GOOD
lib/prisma.ts                ← single PrismaClient + WAL pragma
lib/{cron,backup,taskDefaults,waLink}.ts ← pure/infra helpers (good)
types.ts                     ← input types + envelope-ish types (good)
```

### What is already good (keep, and copy the pattern)
- **Strict layering.** Routes delegate to `svc.*`; services never touch `req`/`res`. This is the
  hard part of SOLID on a backend and it’s done.
- **aiService DIP + OCP** (see §0). This is the reference implementation.
- **Centralized error handling.** `errorHandler` is the single place HTTP error shape is decided.
- **Pure helpers** in `lib/` with no hidden state (except the intentional prisma/cron singletons).
- **Typed inputs** (`CreateEventInput`, `UpdateEventInput`) keep service signatures honest.

### What hurts (the actual backlog)
- **Envelope + try/catch duplicated ~40×** across handlers (`events.ts` is representative).
- **Validation is inline and ad-hoc** (`if (!childId || !date)` at `events.ts:45`); no schema layer,
  no reuse, easy to forget on a new endpoint.
- **`Number(req.params.id)` everywhere** with no `NaN` guard — a non-numeric id reaches Prisma.
- **`prisma` imported as a concrete singleton** in every service — the one dependency we did *not*
  invert, unlike the Anthropic client. Tests must hit a real SQLite DB to exercise services.
- **Multer storage configured inline** in `events.ts` (and likely `photos.ts`) — transport/upload
  config mixed into the route module.
- **`errorHandler` Prisma-code mapping is an if-chain** (`P2025`, `P2003`) — adding a mapped code
  edits the function (minor OCP friction).

---

## 2. SOLID, Mapped to This Codebase

### S — Single Responsibility Principle
**Definition (BE):** A route maps HTTP ↔ service and nothing else; a service owns one resource’s
logic; transport/validation/serialization are their own concerns.

**Status: mostly good.** Services are clean. The leak is in **routes**, which currently do four
jobs each: parse/validate input, call the service, build the `{data,error,meta}` envelope, and set
status codes — with try/catch glue repeated per handler.

**Target:** Push envelope-building and try/catch into helpers (`asyncHandler`, `sendOk`), and input
validation into a validation middleware, so a handler reads as: *validate → call service → send*.

### O — Open/Closed Principle
**Definition (BE):** New endpoints/resources/error-codes are added by adding code, not by editing a
growing block.

**Good example to emulate:** `aiService.PROMPTS` map — `getSuggestions` is closed for modification;
new suggestion types extend the map.

**Violations:**
- Route boilerplate means a new endpoint = copy a full try/catch/envelope handler.
- `errorHandler`’s Prisma-code if-chain is edited for each new mapped code.

**Target:** An `asyncHandler` wrapper (closed) that every new route reuses (open). Replace the
error if-chain with a `PRISMA_ERROR_MAP: Record<string, {status; code; message}>` lookup (same shape
as the `PROMPTS` map already in the codebase).

### L — Liskov Substitution Principle
**Definition (BE):** Anything implementing a shared contract (e.g. the `AnthropicClient` interface,
or a future `Repository` interface) is substitutable — the real client and the test mock honor the
same shape. **Status:** already satisfied where it matters (`aiService` real vs. mock client). No
class hierarchies to abuse. Low priority; preserve the contract discipline when adding the prisma
seam (real client and test fake must be interchangeable).

### I — Interface Segregation Principle
**Definition (BE):** Handlers/services receive only the fields they need; types are role-specific,
not one mega-type.

**Status: good.** `CreateEventInput` vs `UpdateEventInput` are already segregated. `MulterRequest`
is a focused augmentation. Keep this: when adding validation schemas, derive request types from the
schema rather than passing raw `req.body: any`.

### D — Dependency Inversion Principle
**Definition (BE):** Services depend on an abstraction for I/O (DB, external API), injectable for
tests. **The codebase already proves it can do this** — `aiService` inverts the Anthropic SDK.

**Violation:** `prisma` is imported concretely in every service, so the same inversion was not
applied to the database. Today services are only testable against a real SQLite file
(`test/globalSetup`).

**Target (pragmatic):** This is a local-first SQLite app and the integration tests against real
SQLite are *fast and arguably more valuable* than mocked-DB unit tests. So **do not over-invert.**
The lightweight win: pass `prisma` (or a narrow repository) as a default parameter / module-level
injectable mirroring `_setClientForTesting`, **only** for services where a unit test would be
clearly cheaper than a DB round-trip (e.g. `eventService.createEvent`’s task-default expansion).
Don’t build a repository abstraction for every model on principle.

---

## 3. Target Architecture (to-be)

```
backend/src/
  http/                      ← NEW. Cross-cutting HTTP concerns
    asyncHandler.ts          ← wraps handler, forwards errors to next() (kills per-handler try/catch)
    respond.ts               ← sendOk(res, data, meta) / sendErr — one envelope definition
    validate.ts              ← schema-validation middleware (zod or a tiny validator)
  schemas/                   ← NEW. Per-resource request schemas (source of truth for input types)
    event.schema.ts ...
  uploads/                   ← NEW. multer configs extracted from route files
    inviteCard.ts, photo.ts
  middleware/
    errorHandler.ts          ← Prisma if-chain → PRISMA_ERROR_MAP lookup (OCP)
  routes/<resource>.ts       ← thin: validate(schema) → asyncHandler(svc.call) → sendOk
  services/<resource>.ts     ← unchanged shape; prisma injectable only where it buys a test
  lib/                       ← pure helpers + prisma/cron singletons
  types.ts                   ← envelope + types derived from schemas
```

**Dependency direction (unchanged, still inward):**
`routes → services → prisma`, with `http/` + `schemas/` as reusable cross-cutting modules routes
compose. No service imports `req`/`res`. No route inlines transport/validation.

---

## 4. Coding Principles (the standard we hold BE to)

1. **Routes are thin.** A handler = validate → call service → respond. No business logic in routes.
2. **Services never touch `req`/`res`.** Already true — keep it true.
3. **One envelope definition.** All responses go through `sendOk`/`sendErr`; no inline
   `{data,error,meta}` literals.
4. **No per-handler try/catch.** Wrap with `asyncHandler`; let `errorHandler` own error → HTTP.
5. **Validate at the boundary, once.** A request schema per endpoint; never read `req.body.x`
   unvalidated. Coerce + guard ids (no raw `Number(req.params.id)` reaching Prisma).
6. **External I/O behind an injectable seam when it aids testing** — follow the `aiService` pattern
   (interface + `_setClientForTesting`). Don’t abstract for its own sake.
7. **Maps over switch/if-chains** for type→behavior (follow `aiService.PROMPTS`, extend to error
   mapping).
8. **Transport config (multer, cors) lives in its own module,** not inlined in resource routes.

---

## 5. Phased Rollout (smaller than FE — the BE is healthier)

### Phase 1 — Kill route boilerplate (SRP/OCP) — _highest leverage_
- Add `http/asyncHandler.ts` + `http/respond.ts`.
- Migrate `events.ts` and `guests.ts` handlers to use them as proof.
- **Outcome:** each handler drops to ~3 lines; envelope defined once.
- **Risk:** low. Pure refactor; existing route tests (`backend/tests/*`) guard behavior.

### Phase 2 — Validation layer (SRP/ISP)
- Add `http/validate.ts` + `schemas/event.schema.ts` (zod recommended; lightweight).
- Replace inline `if (!childId || !date)` checks; add NaN id guard.
- Derive `CreateEventInput` etc. from schemas (single source of truth).
- **Risk:** low–medium. New dependency (zod). Validate error shape matches existing envelope.

### Phase 3 — errorHandler map + extract upload/transport config (OCP/SRP)
- `PRISMA_ERROR_MAP` lookup replacing the if-chain.
- Move multer configs to `uploads/`.
- **Risk:** low.

### Phase 4 — Selective prisma injection (DIP) — _only where it pays_
- Add an injectable seam (default-param or module setter) for 1–2 services with non-trivial logic
  worth unit-testing without a DB (e.g. `eventService.createEvent` task expansion).
- **Explicitly skip** wholesale repository abstraction — real-SQLite integration tests stay.
- **Risk:** low. Opt-in, no behavior change.

---

## 6. Concrete Before/After

### SRP/OCP — asyncHandler + respond
**Before** (`routes/events.ts`, repeated ~40×):
```ts
router.get('/', async (_req, res, next) => {
  try {
    const data = await svc.listEvents();
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});
```
**After:**
```ts
router.get('/', asyncHandler(async (_req, res) => {
  const data = await svc.listEvents();
  sendOk(res, data, { count: data.length });
}));
```

### SRP/ISP — validation at the boundary
**Before** (`routes/events.ts:44-48`):
```ts
const { childId, date } = req.body;
if (!childId || !date) {
  res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'childId and date are required' }, meta: {} });
  return;
}
```
**After:**
```ts
router.post('/', validate(createEventSchema), asyncHandler(async (req, res) => {
  const data = await svc.createEvent(req.valid.body);   // typed from schema
  sendOk(res, data, {}, 201);
}));
```

### OCP — error map (mirror the existing PROMPTS map)
**Before** (`middleware/errorHandler.ts:15-31`): `if (err.code === 'P2025') {...} if (err.code === 'P2003') {...}`
**After:**
```ts
const PRISMA_ERROR_MAP: Record<string, { status: number; code: string; message: string }> = {
  P2025: { status: 404, code: 'NOT_FOUND', message: 'Record not found' },
  P2003: { status: 409, code: 'CONFLICT', message: 'Cannot delete — related records exist' },
};
const mapped = err.code ? PRISMA_ERROR_MAP[err.code] : undefined;
```

### DIP — extend the aiService pattern to prisma (only where useful)
```ts
// aiService already does this for Anthropic:
export function _setClientForTesting(mock: AnthropicClient): void { _client = mock; }
// Apply the same seam to a service worth unit-testing without a DB.
```

---

## 7. Acceptance Criteria / Definition of Done

- [ ] `http/asyncHandler` + `respond` exist; no route handler contains a manual `{data,error,meta}` literal.
- [ ] No per-handler `try/catch … next(e)`; errors flow through `errorHandler` only.
- [ ] Every mutating endpoint validates input via a schema; ids are NaN-guarded.
- [ ] `errorHandler` uses a code→response map, not an if-chain.
- [ ] Multer/transport config lives outside resource route files.
- [ ] At least `events` + `guests` routes migrated; all `backend/tests/*` stay green.
- [ ] BE coding standard (§4) added to project docs / CLAUDE.md.

---

## 8. Explicitly Out of Scope (avoid over-engineering)

- **No full repository/DAO layer over Prisma.** Prisma *is* the repository; real-SQLite tests are
  fast and meaningful for a local-first app. Invert only the 1–2 services where it clearly helps.
- **No controller layer** — the brief forbids it and routes-as-thin-adapters is the right call.
- **No DI container.** Default params + module setters (the `aiService` style) suffice.
- **No rewrite of the already-clean service layer** — services are the strongest part of the codebase.
- Keep changes proportional: the BE’s problems are boilerplate and missing validation, not architecture.

---

## 9. Suggested Sequencing for the Backlog

1. Phase 1 (`asyncHandler` + `respond`) — one small PR, removes the most repetition.
2. Phase 2 (validation + id guards) — closes a real correctness gap (non-numeric ids today reach Prisma).
3. Phase 3 (error map + multer extraction) — quick wins.
4. Phase 4 (selective prisma seam) — only when a service grows logic worth isolating.

> Note: pairs with `FRONTEND_SOLID_PLAN.md`. The FE needs structural decomposition; the BE needs
> boilerplate removal + a validation boundary. Apply effort proportional to where the pain is — that
> is mostly the frontend.
