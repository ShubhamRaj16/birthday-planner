# Frontend Test Coverage — Design Spec

**Date:** 2026-06-02
**Status:** Approved (design) → ready for implementation plan
**Owner:** Frontend
**Related:** `FRONTEND_SOLID_PLAN.md` (this spec absorbs FE SOLID Phases 3–5), `BACKEND_SOLID_PLAN.md`

---

## 1. Problem

The frontend has ~8% test coverage: 4 test files for 52 source files. Pages, most components,
all 8 Redux slices, the new `api/` repository modules, and `lib/` helpers are untested. The backend
is healthy (17 test files / 33 source, 134 passing). The SOLID refactor (FE Phases 2–5) cannot
proceed safely without a regression net, and shipped user flows (RSVP, budget, invites) have no
automated protection.

## 2. Goals

All of the following, with **refactor-safety as the through-line**:

1. **Safety net** that lets the SOLID refactor proceed without breaking behavior.
2. **Regression protection** for shipped user flows.
3. **Tiered coverage targets**, enforced.
4. **Forward-looking** coverage of the new architecture (api/ seam, slices, extracted hooks).

Testing **drives decomposition**: extract behavior into hooks and split big components so each
becomes a testable unit. Test coverage and SRP decomposition are the same motion.

## 3. Non-Goals (YAGNI)

- SSR server (`src/server/**`) — excluded from coverage (already configured).
- styled-components visual output — no snapshot or pixel tests.
- Third-party internals (recharts, axios, react-router).
- `seoService`, SSR route plumbing — smoke-only if cheap, otherwise skipped.
- E2E as a *blocking* CI gate (advisory only — see §7).

## 4. Architecture — Test Pyramid

```
E2E         — Playwright (NEW)            few; top flows; FE+BE live; advisory in CI
            src/e2e/*.spec.ts
Integration — RTL + user-event            per-component behavior; ENFORCED gate
            src/tests/components, src/tests/pages
Unit        — vitest                      bulk: hooks, slices, lib, api; ENFORCED gate
            src/tests/{hooks,redux,lib,api}
```

**Tooling:**
- **Vitest** remains the runner for unit + integration. Already wired: jsdom, RTL, `@testing-library/jest-dom`, `renderWithStore`, global axios mock in `src/test/setup.ts`. These tiers are the enforced CI gate.
- **`renderHook`** (`@testing-library/react`, already a dependency) for extracted behavior hooks.
- **api/ module tests** mock the `http` axios instance (setup.ts already mocks axios) and assert URL, payload, and response unwrap — making the Phase-1 DIP seam pay off.
- **Playwright** (NEW devDependency) — `src/e2e/`, own config, spins FE + BE, headless. Separate `npm run test:e2e`. Advisory in CI (non-blocking), expected green locally before merging flow-touching changes.
- **gstack** — exploratory/manual dogfooding via `/verify`; NOT part of the committed/gated suite.

## 5. Test Inventory & Tiered Targets

| Layer | Modules | Target | Notes |
|-------|---------|:------:|-------|
| Unit — slices | 8 slices (events, guests, expenses, gifts, photos, reminders, children, toast) | **90%** lines/fns | reducers + thunks; mock `http`; assert pending/fulfilled/rejected transitions |
| Unit — api/ | 7 files: `http` + 6 repos (whatsapp, events, ai, gifts, tasks, expenses) | **90%** lines | assert URL/payload/unwrap (DIP seam) |
| Unit — lib/ | csv, apiError, media, waLink (✓ exists) | **90%** lines | pure functions |
| Unit — hooks | new hooks from decomposition (useSendQueue, useInviteCard, useMessageTemplate, useReceiptUpload, …) | **90%** lines | `renderHook`; bulk of new behavior coverage |
| Integration — components | small + extracted components (InviteFlow sections, Toast, ErrorBoundary, shared `ui/` primitives) | **70%** lines | RTL + user-event; assert behavior, not markup |
| Integration — pages | Dashboard, Children, Events, EventDetail, Calendar, Reminders | **70%** lines | render with preloaded store; key interactions |
| E2E — flows | RSVP update; budget add + receipt upload; invite send (wa.me); task checklist; create child → event | top 5 flows | Playwright; FE + BE live |

Tiered = high bar where cheap and valuable (logic), looser on view-heavy components, flow-based for E2E.

## 6. Testing Drives Decomposition (absorbs SOLID FE Phases 3–5)

A 737-LOC component cannot be unit-tested; extract until it can. Each extraction yields a testable unit.

**Pattern per big component (InviteFlow worked example):**
```
components/InviteFlow.tsx (737 LOC)  →  components/InviteFlow/
  index.tsx               composition only, no logic   (integration: renders 3 sections)
  CardUploadSection.tsx                                 (integration: upload → eventsApi called)
  MessageTemplateSection.tsx
  SendQueueSection.tsx
  hooks/
    useInviteCard.ts      unit: oversize file → error; success → status
    useMessageTemplate.ts unit: fetch default, preview, save
    useSendQueue.ts       unit: filter/select, sequential send, progress, continue-on-failure
  styles.ts               not tested
```

**Extraction rules (testability forcing-function):**
- Business logic in a component (validation, date math such as `showMyGateWarning`, the send loop) → custom hook, unit-tested in isolation.
- Component > ~250 LOC or > ~8 `useState` → split until each piece is one concern.
- Hook owns state/effects/actions; component owns JSX. Test the hook for behavior, the component for wiring.

**Decomposition targets (SOLID scorecard):** InviteFlow 737, Children 628, EventDetail 560,
BudgetTracker 538, TaskChecklist 428, Events 416, Reminders 412, Calendar 394, GiftTracker 360.

This spec lands SOLID FE Phase 3 (InviteFlow), Phase 4 (shared `ui/` primitives — each gets a test),
and Phase 5 (remaining big files). Scorecard S (30%) and I (50%) rise as a side effect of testability.

**`useSendQueue` example test surface:**
- `visibleGuests` filters sent/unsent correctly
- `toggleSelectAll` selects only phone-having guests
- send opens wa.me per guest, advances progress, continues on a single failure
- send with empty selection is a no-op

## 7. CI & Enforcement

**Vitest coverage thresholds** in `vitest.config.mjs`, per-glob; build fails under target:
```
coverage.thresholds:
  'src/redux/**':      { lines: 90, functions: 90 }
  'src/api/**':        { lines: 90 }
  'src/lib/**':        { lines: 90 }
  'src/hooks/**':      { lines: 90 }   # new dir
  'src/components/**': { lines: 70 }
  'src/pages/**':      { lines: 70 }
  global:              { lines: 70 }
```
**Ratchet:** thresholds start at the *current measured* numbers and rise as tests land — never regress;
no big-bang red gate on day one.

**New `.github/workflows/ci.yml`** (no CI exists today):
- `frontend` job (GATED): `npm ci` → typecheck → lint → vitest with coverage thresholds.
- `backend` job (GATED): `npm ci` → typecheck → vitest (134 tests).
- `e2e` job (ADVISORY, `continue-on-error`): build FE+BE → Playwright → upload trace on failure.

**Pre-existing gaps this closes:**
- Husky `pre-commit` greps `\.js$`/`\.(js|jsx)$` but source is `.ts/.tsx` → it currently lints nothing.
  CI typecheck+lint closes the hole; also patch the husky glob to include `.ts,.tsx`.
- Backend `lint` script lacks `ESLINT_USE_FLAT_CONFIG=false` (ESLint v9 flat-config error) → fix so CI lint runs.

## 8. Mocking & Fixtures

- Extend `src/test/setup.ts` axios mock with a typed `http` mock helper (per-test override of get/post/put/delete return values).
- Add `src/test/fixtures/` with sample `Event`, `Guest`, `Expense`, `Gift`, `Task`, `Child` objects.
- Reuse the `makeState` preloaded-store pattern from the existing `GuestList.test.tsx`.

## 9. Sequencing (phases — each shippable, suite green throughout)

| Phase | Work | Rationale |
|------|------|-----------|
| **T0** | CI skeleton + coverage thresholds at *current* level + fix husky/BE-lint gaps | gate exists before tests land; baseline locked |
| **T1** | Unit: 8 slices + 7 api/ files + lib/ | highest ROI, zero refactor; raise thresholds |
| **T2** | Component integration on small/existing components (user-event) | behavior net on shipped UI |
| **T3** | Decompose + test big components (InviteFlow → hooks first), per §6 | = SOLID FE Ph3–5; test each extracted unit |
| **T4** | Playwright E2E: top 5 flows | full-flow protection once units stable |
| **T5** | Raise thresholds to final tiered targets; make E2E job standard | lock the bar |

## 10. Success Criteria / Definition of Done

- [ ] CI workflow runs on every PR; `frontend` + `backend` jobs gate merges.
- [ ] Coverage thresholds enforced and met: slices/api/lib/hooks ≥ 90%, components/pages ≥ 70%, global ≥ 70%.
- [ ] All 8 slices, 7 api/ files, and lib/ helpers unit-tested.
- [ ] Big components decomposed into hooks + sub-components; each extracted hook has unit tests.
- [ ] Top 5 user flows covered by Playwright E2E (advisory job green).
- [ ] Husky pre-commit lints `.ts/.tsx`; backend lint script runs under ESLint v9.
- [ ] Existing 27 FE + 134 BE tests remain green.

## 11. Risks & Mitigations

- **Flaky E2E blocking merges** → E2E advisory (`continue-on-error`), not a gate.
- **Big-bang coverage gate turning CI red** → ratchet from current numbers upward.
- **Testing code about to be refactored** → test easy layers (T1/T2) first; big components are tested *as they are decomposed* (T3), not before.
- **Decomposition scope creep** → bounded by the SOLID scorecard target list; no unrelated refactor.
