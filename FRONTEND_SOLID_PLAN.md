# Frontend SOLID Principles — Review & Adoption Plan

**Author:** Principal Engineer review
**Scope:** `frontend/src` (React + Vite, Redux Toolkit, styled-components, axios)
**Status:** Proposal / planning
**Date:** 2026-06-01

---

## 0. TL;DR

The frontend works and ships, but the **component layer carries too many responsibilities**. Data
fetching, transport, business rules, and presentation are fused inside large page/component files
(`InviteFlow` 737 LOC, `Children` 628, `EventDetail` 560, `BudgetTracker` 538). The Redux slice
layer is clean and consistent but bypassed in places (raw `apiClient` calls inside components),
and it repeats the same async-thunk boilerplate per resource.

SOLID is an OOP-era acronym. We adapt each principle to **React functional idioms** (hooks,
composition, modules) rather than classes. The goal is **testability, smaller blast radius on
change, and one obvious place for each concern** — not ceremony. This is a local-first v1 app for
one family; we apply SOLID where it removes real pain, not dogmatically.

---

## 0.1 SOLID Scorecard — current compliance & path to 100%

Per-principle adherence today, the main gap, and the concrete action + phase that closes it to 100%.
Percentages are reviewer estimates based on §2 evidence (file sizes, transport paths, prop shapes).

| Principle | Current | Main gap (evidence) | Action to reach 100% | Phase |
|-----------|:------:|---------------------|----------------------|:-----:|
| **S** — Single Responsibility | **30%** | God components: `InviteFlow` 737 LOC / ~25 `useState` / 3 features; `Children` 628; `EventDetail` 560; `BudgetTracker` 538 | Split into feature folders + extract behavior hooks + `styles.ts`; enforce ≤250 LOC / ≤8 `useState` review gate | 3, 5 |
| **O** — Open/Closed | **40%** | Slice CRUD boilerplate cloned 7×; `whatsapp` has no slice (logic in component) | `createCrudThunks`/`createCrudSlice` factory; add `whatsapp` api+slice so feature extends without editing component | 2 |
| **L** — Liskov Substitution | **60%** | `PrimaryBtn`/`SecondaryBtn`/`DangerButton`, badges re-declared per file and drifting | Shared `ui/Button variant`, `ui/Badge` with one prop contract every variant honors | 4 |
| **I** — Interface Segregation | **50%** | Whole `event: Event` passed to `InviteFlowProps`; pages drill full aggregates | Narrow per-section props (only used fields + callbacks); split fat prop types | 3, 5 |
| **D** — Dependency Inversion | **100%** ✅ | ~~Components import concrete `apiClient`; two transport paths~~ **DONE (Phase 1):** `api/http.ts` seam + 5 `api/*.api.ts` repos; all 7 UI files migrated; ESLint `no-restricted-imports` bans axios/http in `components/**`+`pages/**` | ✅ complete | 1 |
| **Overall** | **~56%** | Component layer still overloaded (S/I); slices not yet factored (O) | Phases 2→5 below | — |

> **Phase 1 shipped (2026-06-01):** transport seam live. New `src/api/` modules: `http`, `whatsapp.api`,
> `events.api`, `ai.api`, `gifts.api`, `tasks.api`, `expenses.api`. `mediaUrl` moved to `lib/media.ts`.
> `lib/apiClient.ts` is now a back-compat shim for slices (removed in Phase 2). Migrated 7 UI files
> (InviteFlow + the 6 the ESLint rule exposed). Typecheck ✓, lint ✓, 27/27 tests ✓.

**Definition of 100% per principle** = the matching Acceptance Criteria in §7 are all checked **and**
the §4 standard is enforced in CI/review so new code cannot regress. 100% means *sustained*
compliance (the ESLint/size gates), not a one-time refactor.

---

## 1. Current Architecture (as-is)

```
Component / Page (.tsx)
  ├── styled-components (50+ defs inline, per file)
  ├── useState x N            ← UI state + form state + business state, undifferentiated
  ├── useEffect               ← data fetching, prop-mirroring (flagged in code w/ eslint-disable)
  ├── useAppDispatch/Selector ← redux path  (most CRUD)
  ├── apiClient.post(...)     ← direct transport path  (whatsapp, invite-card upload)
  └── JSX + inline business logic (validation, send loop, date math)

redux/slices/<resource>Slice.ts
  ├── createAsyncThunk x ~5   ← identical try/catch → rejectWithValue boilerplate
  └── createSlice / extraReducers

lib/apiClient.ts              ← single axios instance, hardcoded URL builder
lib/{csv,waLink,apiError}.ts  ← pure helpers (good)
types.ts                      ← shared domain types (good)
```

### What is already good
- `lib/*` helpers are pure and single-purpose (`apiError`, `csv`, `waLink`).
- Slices follow one consistent shape (thunk + extraReducers).
- `types.ts` centralizes domain types.
- SSR-safe URL building isolated in `apiClient`.

### What hurts
- Components are the dumping ground for every concern (SRP).
- Two transport paths (redux thunk vs. raw `apiClient`) with no shared contract (DIP).
- Slice boilerplate duplicated; `whatsapp` feature has no slice and lives in component (OCP).
- Effects used to mirror props into state, already marked `eslint-disable react-hooks/set-state-in-effect` (a code smell the team has acknowledged in `InviteFlow.tsx:369-380`).

---

## 2. SOLID, Mapped to This Codebase

### S — Single Responsibility Principle
**Definition (FE):** A module changes for exactly one reason. A component renders; a hook owns a
slice of behavior; a slice owns state; a client owns transport.

**Violations:**
| File | LOC | Responsibilities crammed together |
|------|-----|-----------------------------------|
| `components/InviteFlow.tsx` | 737 | card upload + MyGate link + message template + send queue + 30 styled defs |
| `pages/Children.tsx` | 628 | list + create/edit form + validation + layout |
| `pages/EventDetail.tsx` | 560 | aggregates every sub-resource tab + general-purpose form |
| `components/BudgetTracker.tsx` | 538 | chart + category logic + CRUD form |

`InviteFlow` is the canonical example: it holds **~25 `useState` hooks** spanning three independent
sub-features (A/B/C sections), calls `apiClient` directly **and** dispatches thunks, and computes
business rules inline (`showMyGateWarning` date math at `:436`, the sequential send loop at `:504`).

**Target:** Split by feature, extract behavior into custom hooks, move transport behind a client.
```
InviteFlow/
  index.tsx            ← composes the three sections, no logic
  CardUploadSection.tsx
  MessageTemplateSection.tsx
  SendQueueSection.tsx
  useInviteCard.ts     ← upload state + action
  useMessageTemplate.ts
  useSendQueue.ts
  styles.ts            ← styled-components
```

### O — Open/Closed Principle
**Definition (FE):** Add a new resource/feature by adding code, not by editing a growing switch or
copy-pasting an existing file wholesale.

**Violations:**
- Each slice (`events`, `guests`, `gifts`, `expenses`, `photos`, `reminders`, `children`) repeats
  the same `createAsyncThunk` try/catch/`rejectWithValue` block ~5× — adding a resource means
  cloning the whole file.
- `whatsapp` has no slice; its calls are hardcoded in `InviteFlow`, so the feature can't be
  extended/tested without touching the component.

**Target:** A `createResourceSlice` / `createCrudThunks` factory that takes an endpoint + entity
type and generates the standard CRUD thunks + reducers. New resource = one factory call + any
custom cases. Closed for modification (factory stable), open for extension (new resources).

### L — Liskov Substitution Principle
**Definition (FE):** Components/hooks honoring a shared prop/return contract are interchangeable; a
variant must not violate the base contract.

**Status:** Low incidence (no class hierarchies). Relevant where we have polymorphic UI:
button variants (`PrimaryBtn`/`SecondaryBtn`/`DangerButton` re-declared per file), badge variants,
form-field components. **Target:** a shared `<Button variant>` whose every variant accepts the same
props (an LSP-respecting component API), instead of divergent ad-hoc buttons that drift.

### I — Interface Segregation Principle
**Definition (FE):** Components depend only on the props they use; no fat “god prop” or passing the
entire `Event` when a child needs two fields.

**Violations:**
- `InviteFlowProps` receives the whole `event: Event` then uses a handful of fields; sub-sections
  would each need only a slice.
- Pages pass large objects down rather than the minimal data + callbacks.

**Target:** Narrow prop interfaces per child component; pass primitives/callbacks, not whole
aggregates. Split fat prop types into role-specific ones.

### D — Dependency Inversion Principle
**Definition (FE):** High-level UI depends on an abstraction (a typed client/repository interface),
not on a concrete `axios` instance. Transport is injected/swappable (real, mock, SSR).

**Violations:**
- Components import `apiClient` (concrete axios) directly: `InviteFlow.tsx:356,396,452,514`.
- Slices also import `apiClient` directly — fine for now, but there is no seam to mock transport in
  tests other than mocking the axios module.

**Target:** Introduce a thin **API/repository layer** (`api/` modules exposing typed functions like
`whatsappApi.sendLink(eventId, guestId)`). Components and slices call the repository; the repository
owns `apiClient`. Tests inject a fake repository. This also kills the “two transport paths” problem
— everything goes through the repository.

---

## 3. Target Architecture (to-be)

```
src/
  api/                       ← NEW. Typed repository layer (DIP seam)
    http.ts                  ← apiClient (moved from lib/), the ONLY axios reference
    events.api.ts            ← eventsApi.list/get/create/update/delete/activate
    guests.api.ts
    whatsapp.api.ts          ← previewMessage, buildLink, defaultTemplate  (no more raw calls)
    types.ts                 ← request/response contracts (re-export domain types)
  redux/
    createCrudThunks.ts      ← NEW. OCP factory for standard CRUD thunks
    slices/<resource>Slice.ts← thin: factory call + custom cases only; calls api/, not apiClient
  hooks/                     ← NEW home for behavior hooks
    useInviteCard.ts
    useSendQueue.ts ...
  components/
    ui/                      ← NEW. Shared primitives (Button, Badge, Field, Card) — LSP/ISP
    <Feature>/               ← feature folder: index + sections + styles + local hooks
  pages/                     ← thin composition only; delegate to feature components/hooks
  lib/                       ← pure helpers only (csv, waLink, apiError)
  types.ts
```

**Dependency direction (must point inward):**
`pages → feature components → hooks → redux slices → api/ → http(axios)`
No component imports `apiClient`/`axios` directly after this plan.

---

## 4. Coding Principles (the standard we hold FE to)

These become the FE section of `CLAUDE.md` / review checklist once adopted:

1. **One reason to change per file.** A `.tsx` that fetches, validates, and styles is three files.
2. **No `axios`/`apiClient` import outside `api/`.** UI talks to the repository, never transport.
   (Enforce with an ESLint `no-restricted-imports` rule.)
3. **Components render; hooks decide; slices store; api/ transports.** Keep business logic out of JSX.
4. **Hard size budget:** component file > ~250 LOC or > ~8 `useState` → split before merge.
5. **No prop drilling of whole aggregates.** Pass the minimal fields + callbacks (ISP).
6. **Effects don’t mirror props into state.** Derive during render or use `key` reset
   (removes the existing `eslint-disable react-hooks/set-state-in-effect`).
7. **Shared UI primitives over per-file re-declarations** of buttons/badges/inputs (DRY + LSP).
8. **Every hook and api module is unit-testable without a DOM** (inject the repository).

---

## 5. Phased Rollout (incremental, low-risk)

Strangler-fig approach — no big-bang rewrite. Each phase is independently shippable and keeps tests green.

### Phase 1 — Transport seam (DIP) — _foundational, do first_
- Create `api/http.ts` (move `apiClient`), add `no-restricted-imports` ESLint rule banning `axios`/`apiClient` outside `api/`.
- Add `api/whatsapp.api.ts` and route `InviteFlow`’s 4 raw calls through it.
- **Outcome:** single transport path; component no longer touches axios.
- **Risk:** low. Pure indirection, behavior unchanged.

### Phase 2 — CRUD thunk factory (OCP)
- Build `redux/createCrudThunks.ts`; migrate `guests` and `events` slices to it as proof.
- Slices import from `api/*` not `apiClient`.
- **Outcome:** ~60% boilerplate removed per slice; new resource ≈ one factory call.
- **Risk:** medium. Cover with existing slice behavior via tests first (TDD).

### Phase 3 — Decompose `InviteFlow` (SRP/ISP) — _highest pain relief_
- Split into feature folder (sections + `styles.ts` + behavior hooks per §2-S).
- Narrow each section’s props to what it uses.
- **Outcome:** 737 LOC → ~5 files ≤ 200 LOC; each section unit-testable.
- **Risk:** medium. Component test exists? add one for send-queue logic before refactor.

### Phase 4 — Shared UI primitives (LSP/DRY)
- Extract `components/ui/{Button,Badge,Field,Card}.tsx` from repeated styled defs.
- Migrate `InviteFlow`, `Events`, `Children` to use them.
- **Outcome:** consistent variants, one place to change design tokens.

### Phase 5 — Apply pattern to remaining large files
- `Children` (628), `EventDetail` (560), `BudgetTracker` (538) using the Phase 3 template.
- Codify the standard in §4 into the FE CLAUDE.md / PR checklist.

---

## 6. Concrete Before/After

### DIP — kill the raw transport call
**Before** (`InviteFlow.tsx:514`):
```ts
const res = await apiClient.post('/whatsapp/link', { eventId, guestId: guest.id });
const link = res.data?.data?.link;
```
**After:**
```ts
// api/whatsapp.api.ts
export const whatsappApi = {
  buildLink: (eventId: number, guestId: number) =>
    http.post<ApiResponse<{ link: string }>>('/whatsapp/link', { eventId, guestId })
        .then(r => r.data.data),
};
// component / hook
const { link } = await whatsappApi.buildLink(eventId, guest.id);
```

### OCP — slice factory
**Before:** ~80 LOC per slice, 5 near-identical thunks.
**After:**
```ts
const guestsThunks = createCrudThunks<Guest>('guests', guestsApi);
const guestsSlice = createCrudSlice('guests', guestsThunks, {
  extraReducers: (b) => { /* only the byEventId-specific cases */ },
});
```

### SRP — behavior hook out of the component
**Before:** send loop + progress + error state inline in the 737-LOC file.
**After:**
```ts
// hooks/useSendQueue.ts — testable without rendering
export function useSendQueue(eventId: number, guests: Guest[]) {
  const [sending, setSending] = useState(false);
  // ...selection + sequential send via whatsappApi...
  return { visibleGuests, selectedGuests, sending, sendProgress, sendError, toggleSelect, send };
}
```

---

## 7. Acceptance Criteria / Definition of Done

- [ ] No file outside `api/` imports `axios` or `apiClient` (ESLint-enforced).
- [ ] No component file > 250 LOC or > 8 `useState` (CI soft-check or review gate).
- [ ] `whatsapp` calls have a typed `api/` module and (optionally) a slice.
- [ ] At least `guests` + `events` slices migrated to the CRUD factory; tests green.
- [ ] `InviteFlow` decomposed; send-queue + template + upload each have a unit-tested hook.
- [ ] Shared `Button`/`Badge` primitives replace per-file re-declarations in migrated files.
- [ ] `react-hooks/set-state-in-effect` disables removed from `InviteFlow`.
- [ ] FE coding standard (§4) added to project docs / CLAUDE.md.

---

## 8. Explicitly Out of Scope (avoid over-engineering)

- No DI container / IoC framework — plain module imports + injected repository in tests is enough.
- No switch off Redux Toolkit; the slice pattern stays, we just factory + thin it.
- No atomic-design taxonomy beyond a small `ui/` primitives folder.
- No rewrite of working pure helpers in `lib/`.
- This is a single-family local-first app: apply principles where files are large/painful, skip
  ceremony on small, stable modules (e.g. `Footer`, `NotFound`, `toastSlice`).

---

## 9. Suggested Sequencing for the Backlog


2. Phase 3 `InviteFlow` decomposition — highest reviewer/maintainer pain relief.
3. Phase 2 slice factory — once a second resource is about to be added.
4. Phases 4–5 — opportunistic, as each large file is next touched.
