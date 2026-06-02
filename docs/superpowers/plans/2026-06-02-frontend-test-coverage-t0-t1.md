# Frontend Test Coverage — T0 + T1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a gated CI pipeline with enforced coverage thresholds, then unit-test the entire FE logic layer (8 Redux slices, 6 api/ repository modules, lib/ helpers) — a self-contained, shippable foundation for the broader FE test strategy.

**Architecture:** Vitest (jsdom + RTL, already wired) is the test runner and the enforced CI gate. Tests are *characterization* tests — the implementation already exists, so a correct test passes immediately. Slice thunks are tested by mocking the `../../lib/apiClient` module and dispatching through a real store (`createStore`); api/ modules are tested by mocking `../../api/http`. A new GitHub Actions workflow runs frontend + backend jobs on every PR.

**Tech Stack:** Vitest, @testing-library/react, @testing-library/jest-dom, @reduxjs/toolkit, Redux Toolkit thunks, GitHub Actions.

**Scope:** This plan covers spec phases **T0** (CI + enforcement scaffold) and **T1** (unit layer). Spec phases T2 (component integration), T3 (decompose + test big components), T4 (Playwright E2E), and T5 (final threshold ratchet) are separate follow-up plans. Spec: `docs/superpowers/specs/2026-06-02-frontend-test-coverage-design.md`.

---

## File Structure

**Created:**
- `.github/workflows/ci.yml` — CI: frontend (gated) + backend (gated) jobs
- `frontend/src/test/fixtures.ts` — sample domain objects (Event, Guest, Expense, Gift, Photo, Reminder, Child)
- `frontend/src/test/mockHttp.ts` — typed helper to mock the `http` axios instance
- `frontend/src/tests/lib/apiError.test.ts`
- `frontend/src/tests/lib/media.test.ts`
- `frontend/src/tests/lib/csv.test.ts`
- `frontend/src/tests/api/whatsapp.test.ts`
- `frontend/src/tests/api/events.test.ts`
- `frontend/src/tests/api/ai.test.ts`
- `frontend/src/tests/api/gifts.test.ts`
- `frontend/src/tests/api/tasks.test.ts`
- `frontend/src/tests/api/expenses.test.ts`
- `frontend/src/tests/redux/toastSlice.test.ts`
- `frontend/src/tests/redux/eventsSlice.test.ts`
- `frontend/src/tests/redux/guestsSlice.test.ts`
- `frontend/src/tests/redux/childrenSlice.test.ts`
- `frontend/src/tests/redux/expensesSlice.test.ts`
- `frontend/src/tests/redux/giftsSlice.test.ts`
- `frontend/src/tests/redux/photosSlice.test.ts`
- `frontend/src/tests/redux/remindersSlice.test.ts`

**Modified:**
- `frontend/vitest.config.mjs` — coverage thresholds (baseline → T1 targets); exclude `src/api/http.ts`
- `backend/package.json` — fix `lint` script (add `ESLINT_USE_FLAT_CONFIG=false`)
- `.husky/pre-commit` — extend lint glob to `.ts/.tsx`

---

## PHASE T0 — CI + Enforcement Scaffold

### Task T0.1: Measure current coverage baseline

**Files:** none (measurement only)

- [ ] **Step 1: Run coverage and record numbers**

Run: `cd frontend && npm run test:coverage`
Expected: PASS (27 tests). Note the per-directory `% Lines` for `src/redux`, `src/api`, `src/lib`, `src/components`, `src/pages`, and `All files`. Write these numbers down — they become the *baseline thresholds* in Task T0.2 so CI cannot regress below today's reality.

### Task T0.2: Add coverage thresholds to vitest config

**Files:**
- Modify: `frontend/vitest.config.mjs`

- [ ] **Step 1: Replace the `coverage` block with thresholds + http exclude**

Replace the existing `coverage: { ... }` object in `frontend/vitest.config.mjs` with:

```js
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,ts,tsx}'],
      exclude: [
        'src/server/**',
        'src/test/**',
        'src/tests/**',
        'src/client/index.js',
        'src/api/http.ts', // transport config (axios.create); behaviourless, like server/
      ],
      thresholds: {
        // BASELINE — set each number to the value recorded in Task T0.1 (round DOWN
        // to the nearest whole percent). These ratchet UP in Task T1.19; they must
        // never be lowered. Example placeholders below assume a low current baseline:
        'src/redux/**/*.ts': { lines: 0 },
        'src/api/**/*.ts': { lines: 0 },
        'src/lib/**/*.ts': { lines: 0 },
        'src/components/**/*.tsx': { lines: 0 },
        'src/pages/**/*.tsx': { lines: 0 },
        lines: 0, // global floor
      },
    },
```

Then set each `lines` number to the floor measured in Task T0.1 (e.g. if `src/lib` is at 41%, write `{ lines: 41 }`). Use the real measured numbers, not the `0` placeholders.

- [ ] **Step 2: Verify the gate passes at baseline**

Run: `cd frontend && npm run test:coverage`
Expected: PASS — coverage meets the baseline thresholds (they equal current reality).

- [ ] **Step 3: Commit**

```bash
git add frontend/vitest.config.mjs
git commit -m "test(fe): enforce coverage thresholds at current baseline"
```

### Task T0.3: Fix lint gaps (husky glob + backend lint script)

**Files:**
- Modify: `.husky/pre-commit`
- Modify: `backend/package.json:13`

- [ ] **Step 1: Extend husky lint globs to TypeScript**

In `.husky/pre-commit`, the two lint blocks currently match only `.js`/`.jsx` but the source is `.ts`/`.tsx`. Change the backend grep from `"^backend/src/.*\.js$"` to `"^backend/src/.*\.(ts|js)$"` and its eslint glob from `'src/**/*.js'` to `'src/**/*.{ts,js}'`. Change the frontend grep from `"^frontend/src/.*\.(js|jsx)$"` to `"^frontend/src/.*\.(ts|tsx|js|jsx)$"` and its eslint glob from `'src/**/*.{js,jsx}'` to `'src/**/*.{ts,tsx,js,jsx}'`.

- [ ] **Step 2: Fix the backend lint script for ESLint v9**

In `backend/package.json`, replace the `lint` script:

```json
    "lint": "cross-env ESLINT_USE_FLAT_CONFIG=false eslint 'src/**/*.ts' 'server.ts'",
```

(Backend already depends on `cross-env`? If not, run `cd backend && npm i -D cross-env` first and include `backend/package-lock.json` in the commit.)

- [ ] **Step 3: Verify backend lint now runs**

Run: `cd backend && npm run lint`
Expected: ESLint runs (no "couldn't find eslint.config" error). Warnings/errors about real code are acceptable to see here; the script *executing* is the success condition.

- [ ] **Step 4: Commit**

```bash
git add .husky/pre-commit backend/package.json backend/package-lock.json
git commit -m "chore: lint .ts/.tsx in husky + fix backend eslint v9 script"
```

### Task T0.4: GitHub Actions CI (frontend + backend gated)

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [master]

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:coverage

  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
      - run: npx prisma generate
      - run: npm run typecheck
      - run: npm test
```

- [ ] **Step 2: Validate YAML locally**

Run: `cd frontend && npx --yes js-yaml ../.github/workflows/ci.yml >/dev/null && echo OK`
Expected: prints `OK` (valid YAML). If `js-yaml` is unavailable, skip — GitHub validates on push.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add gated frontend + backend workflow"
```

---

## PHASE T1 — Unit Layer (slices, api, lib)

> Test conventions for this phase:
> - All test files live under `frontend/src/tests/**` (matches the `include` glob in vitest config).
> - These are **characterization tests**: the code already exists, so a correct test **passes on first run**. If it fails, the test (or your understanding of the code) is wrong — fix the test, do not change source.
> - `setup.ts` already globally mocks `axios`. The patterns below additionally mock `../../lib/apiClient` (for slices) or `../../api/http` (for api modules) so call arguments and return values are controllable per test.

### Task T1.1: Shared fixtures + http mock helper

**Files:**
- Create: `frontend/src/test/fixtures.ts`
- Create: `frontend/src/test/mockHttp.ts`

- [ ] **Step 1: Write fixtures**

Create `frontend/src/test/fixtures.ts`:

```ts
import type { Event, Guest, Expense, Gift, Photo, Reminder, Child } from '../types';

export const aChild = (over: Partial<Child> = {}): Child => ({
  id: 1, name: 'Mia', dob: '2018-05-01', interests: 'dinos', allergies: null, photo: null, ...over,
} as Child);

export const anEvent = (over: Partial<Event> = {}): Event => ({
  id: 10, childId: 1, date: '2026-07-01', venue: 'Hall', address: null, theme: 'Jungle',
  budget: 20000, status: 'Active', myGateLink: null, cardPath: null, messageTemplate: null,
  notes: null, googlePhotosUrl: null, ...over,
} as Event);

export const aGuest = (over: Partial<Guest> = {}): Guest => ({
  id: 100, name: 'Alice', phone: '9876543210', rsvp: 'Pending', inviteSent: false,
  ageGroup: 'adult', dietary: '', ...over,
} as Guest);

export const anExpense = (over: Partial<Expense> = {}): Expense => ({
  id: 200, label: 'Cake', amount: 1500, category: 'cake', receiptPath: null, ...over,
} as Expense);

export const aGift = (over: Partial<Gift> = {}): Gift => ({
  id: 300, name: 'Lego', status: 'idea', source: null, ...over,
} as Gift);

export const aPhoto = (over: Partial<Photo> = {}): Photo => ({
  id: 400, storagePath: '/uploads/photos/10/x.jpg', caption: null, isCover: false, ...over,
} as Photo);

export const aReminder = (over: Partial<Reminder> = {}): Reminder => ({
  id: 500, label: 'Order cake', triggerAt: '2026-06-20T10:00:00Z', fired: false, ...over,
} as Reminder);
```

> Note: each fixture uses `as Type` to tolerate fields the test does not care about. If `npm run typecheck` later reports a genuinely missing required field, add it to the fixture default.

- [ ] **Step 2: Write the http mock helper**

Create `frontend/src/test/mockHttp.ts`:

```ts
import { vi } from 'vitest';

/** A vi-mocked stand-in for the api/http axios instance. */
export function makeHttpMock() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
}

/** Wrap a value in the { data: { data, error, meta } } axios+envelope shape. */
export function ok<T>(data: T) {
  return { data: { data, error: null, meta: {} } };
}
```

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npm run typecheck`
Expected: PASS (no type errors in the new files).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/test/fixtures.ts frontend/src/test/mockHttp.ts
git commit -m "test(fe): add shared fixtures + http mock helper"
```

### Task T1.2: lib/apiError tests

**Files:**
- Create: `frontend/src/tests/lib/apiError.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getApiError } from '../../lib/apiError';

describe('getApiError', () => {
  it('extracts message from envelope error object', () => {
    const err = new AxiosError('req failed');
    err.response = { data: { error: { code: 'X', message: 'boom' } } } as never;
    expect(getApiError(err)).toBe('boom');
  });

  it('returns string error body as-is', () => {
    const err = new AxiosError('req failed');
    err.response = { data: { error: 'plain string error' } } as never;
    expect(getApiError(err)).toBe('plain string error');
  });

  it('falls back to axios message when no response error', () => {
    const err = new AxiosError('network down');
    expect(getApiError(err)).toBe('network down');
  });

  it('handles a plain Error', () => {
    expect(getApiError(new Error('generic'))).toBe('generic');
  });

  it('handles a non-error value', () => {
    expect(getApiError('weird')).toBe('Unknown error');
  });
});
```

- [ ] **Step 2: Run it (expect PASS — code exists)**

Run: `cd frontend && npx vitest run src/tests/lib/apiError.test.ts`
Expected: PASS (5 tests). The global axios mock in `setup.ts` does not affect `isAxiosError`/`AxiosError` value usage here; if `isAxiosError` returns false for the constructed error, switch the first two tests to set `err.isAxiosError = true` explicitly.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/lib/apiError.test.ts
git commit -m "test(fe): cover lib/apiError"
```

### Task T1.3: lib/media tests

**Files:**
- Create: `frontend/src/tests/lib/media.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { mediaUrl } from '../../lib/media';

describe('mediaUrl', () => {
  it('builds a URL against the current hostname on port 3001', () => {
    // jsdom default hostname is "localhost"
    expect(mediaUrl('/uploads/x.jpg')).toBe('http://localhost:3001/uploads/x.jpg');
  });

  it('passes the storage path through unchanged', () => {
    expect(mediaUrl('/uploads/photos/10/a b.png')).toBe(
      'http://localhost:3001/uploads/photos/10/a b.png',
    );
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/lib/media.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/lib/media.test.ts
git commit -m "test(fe): cover lib/media"
```

### Task T1.4: lib/csv tests

**Files:**
- Create: `frontend/src/tests/lib/csv.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import { toCsv, fileSlug } from '../../lib/csv';

interface Row { name: string; note: string; }

describe('toCsv', () => {
  it('builds header + body rows in column order', () => {
    const headers = [
      { key: 'name' as const, label: 'Name' },
      { key: 'note' as const, label: 'Note' },
    ];
    const rows: Row[] = [{ name: 'Alice', note: 'hi' }];
    expect(toCsv(headers, rows)).toBe('Name,Note\nAlice,hi');
  });

  it('quotes fields containing comma, quote, or newline', () => {
    const headers = [{ key: 'note' as const, label: 'Note' }];
    const rows = [{ note: 'a,b' }, { note: 'say "hi"' }, { note: 'line1\nline2' }];
    expect(toCsv(headers, rows)).toBe('Note\n"a,b"\n"say ""hi"""\n"line1\nline2"');
  });

  it('renders null/undefined cells as empty', () => {
    const headers = [{ key: 'note' as const, label: 'Note' }];
    const rows = [{ note: null as unknown as string }];
    expect(toCsv(headers, rows)).toBe('Note\n');
  });
});

describe('fileSlug', () => {
  it('slugifies and trims dashes', () => {
    expect(fileSlug('Jungle  Theme!')).toBe('jungle-theme');
  });
  it('defaults to "export" for empty input', () => {
    expect(fileSlug('')).toBe('export');
    expect(fileSlug(null)).toBe('export');
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/lib/csv.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/lib/csv.test.ts
git commit -m "test(fe): cover lib/csv"
```

### Task T1.5: api/whatsapp tests

**Files:**
- Create: `frontend/src/tests/api/whatsapp.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { whatsappApi } from '../../api/whatsapp.api';
import { ok } from '../../test/mockHttp';

const mockHttp = vi.mocked(http);

beforeEach(() => vi.clearAllMocks());

describe('whatsappApi', () => {
  it('fetchDefaultTemplate returns template string', async () => {
    mockHttp.get.mockResolvedValue(ok({ template: 'Hi {guestName}' }));
    await expect(whatsappApi.fetchDefaultTemplate()).resolves.toBe('Hi {guestName}');
    expect(mockHttp.get).toHaveBeenCalledWith('/whatsapp/default-template');
  });

  it('fetchDefaultTemplate returns null when absent', async () => {
    mockHttp.get.mockResolvedValue(ok({}));
    await expect(whatsappApi.fetchDefaultTemplate()).resolves.toBeNull();
  });

  it('previewMessage posts eventId + template and returns message', async () => {
    mockHttp.post.mockResolvedValue(ok({ message: 'rendered' }));
    await expect(whatsappApi.previewMessage(10, 'T')).resolves.toBe('rendered');
    expect(mockHttp.post).toHaveBeenCalledWith('/whatsapp/preview', { eventId: 10, template: 'T' });
  });

  it('buildLink posts eventId + guestId and returns link', async () => {
    mockHttp.post.mockResolvedValue(ok({ link: 'https://wa.me/91...' }));
    await expect(whatsappApi.buildLink(10, 100)).resolves.toBe('https://wa.me/91...');
    expect(mockHttp.post).toHaveBeenCalledWith('/whatsapp/link', { eventId: 10, guestId: 100 });
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/api/whatsapp.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/api/whatsapp.test.ts
git commit -m "test(fe): cover api/whatsapp"
```

### Task T1.6: api/events tests

**Files:**
- Create: `frontend/src/tests/api/events.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { eventsApi } from '../../api/events.api';
import { ok } from '../../test/mockHttp';
import { anEvent } from '../../test/fixtures';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('eventsApi.uploadInviteCard', () => {
  it('posts FormData to the invite-card endpoint and returns the event', async () => {
    const ev = anEvent({ cardPath: '/uploads/invite-cards/x.png' });
    mockHttp.post.mockResolvedValue(ok(ev));
    const file = new File(['x'], 'card.png', { type: 'image/png' });

    const result = await eventsApi.uploadInviteCard(10, file);

    expect(result).toEqual(ev);
    const [url, body, config] = mockHttp.post.mock.calls[0];
    expect(url).toBe('/events/10/invite-card');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('card')).toBe(file);
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/api/events.test.ts`
Expected: PASS (1 test).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/api/events.test.ts
git commit -m "test(fe): cover api/events"
```

### Task T1.7: api/ai tests

**Files:**
- Create: `frontend/src/tests/api/ai.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { aiApi } from '../../api/ai.api';
import { ok } from '../../test/mockHttp';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('aiApi.getSuggestions', () => {
  it('posts type and returns suggestions array', async () => {
    mockHttp.post.mockResolvedValue(ok({ suggestions: ['a', 'b'] }));
    await expect(aiApi.getSuggestions(10, 'themes')).resolves.toEqual(['a', 'b']);
    expect(mockHttp.post).toHaveBeenCalledWith('/events/10/ai/suggest', { type: 'themes' });
  });

  it('returns [] when suggestions missing', async () => {
    mockHttp.post.mockResolvedValue(ok({}));
    await expect(aiApi.getSuggestions(10, 'gifts')).resolves.toEqual([]);
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/api/ai.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/api/ai.test.ts
git commit -m "test(fe): cover api/ai"
```

### Task T1.8: api/gifts tests

**Files:**
- Create: `frontend/src/tests/api/gifts.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { giftsApi } from '../../api/gifts.api';
import { ok } from '../../test/mockHttp';
import { aGift } from '../../test/fixtures';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('giftsApi.createGift', () => {
  it('posts name + source and returns the gift', async () => {
    const gift = aGift({ name: 'Lego', source: 'ai' });
    mockHttp.post.mockResolvedValue(ok(gift));
    await expect(giftsApi.createGift(10, { name: 'Lego', source: 'ai' })).resolves.toEqual(gift);
    expect(mockHttp.post).toHaveBeenCalledWith('/events/10/gifts', { name: 'Lego', source: 'ai' });
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/api/gifts.test.ts`
Expected: PASS (1 test).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/api/gifts.test.ts
git commit -m "test(fe): cover api/gifts"
```

### Task T1.9: api/tasks tests

**Files:**
- Create: `frontend/src/tests/api/tasks.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { tasksApi } from '../../api/tasks.api';
import { ok } from '../../test/mockHttp';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('tasksApi', () => {
  it('setTaskDone puts done flag and returns task', async () => {
    mockHttp.put.mockResolvedValue(ok({ id: 1, done: true }));
    const result = await tasksApi.setTaskDone(1, true);
    expect(result).toEqual({ id: 1, done: true });
    expect(mockHttp.put).toHaveBeenCalledWith('/tasks/1', { done: true });
  });

  it('deleteTask deletes the nested route', async () => {
    mockHttp.delete.mockResolvedValue(ok({ deleted: true }));
    await tasksApi.deleteTask(10, 1);
    expect(mockHttp.delete).toHaveBeenCalledWith('/events/10/tasks/1');
  });

  it('createTask posts payload and returns task', async () => {
    mockHttp.post.mockResolvedValue(ok({ id: 2, title: 'Cake' }));
    const result = await tasksApi.createTask(10, { title: 'Cake', category: 'cake' });
    expect(result).toEqual({ id: 2, title: 'Cake' });
    expect(mockHttp.post).toHaveBeenCalledWith('/events/10/tasks', { title: 'Cake', category: 'cake' });
  });

  it('resetDefaults posts to reset-defaults', async () => {
    mockHttp.post.mockResolvedValue(ok({ count: 9 }));
    await tasksApi.resetDefaults(10);
    expect(mockHttp.post).toHaveBeenCalledWith('/events/10/tasks/reset-defaults');
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/api/tasks.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/api/tasks.test.ts
git commit -m "test(fe): cover api/tasks"
```

### Task T1.10: api/expenses tests

**Files:**
- Create: `frontend/src/tests/api/expenses.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { expensesApi } from '../../api/expenses.api';
import { ok } from '../../test/mockHttp';
import { anExpense } from '../../test/fixtures';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('expensesApi.uploadReceipt', () => {
  it('posts FormData receipt to the nested endpoint and returns expense', async () => {
    const exp = anExpense({ receiptPath: '/uploads/receipts/r.png' });
    mockHttp.post.mockResolvedValue(ok(exp));
    const file = new File(['x'], 'r.png', { type: 'image/png' });

    const result = await expensesApi.uploadReceipt(10, 200, file);

    expect(result).toEqual(exp);
    const [url, body, config] = mockHttp.post.mock.calls[0];
    expect(url).toBe('/events/10/expenses/200/receipt');
    expect((body as FormData).get('receipt')).toBe(file);
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/api/expenses.test.ts`
Expected: PASS (1 test).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/api/expenses.test.ts
git commit -m "test(fe): cover api/expenses"
```

### Task T1.11: toastSlice tests (pure reducer, no async)

**Files:**
- Create: `frontend/src/tests/redux/toastSlice.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from 'vitest';
import reducer, { addToast, removeToast } from '../../redux/slices/toastSlice';

describe('toastSlice', () => {
  it('addToast appends a toast with incrementing id', () => {
    const s1 = reducer(undefined, addToast('hello', 'success'));
    expect(s1.items).toHaveLength(1);
    expect(s1.items[0]).toMatchObject({ message: 'hello', variant: 'success' });
  });

  it('addToast defaults variant to info', () => {
    const s = reducer(undefined, addToast('plain'));
    expect(s.items[0].variant).toBe('info');
  });

  it('keeps only the most recent 3 toasts', () => {
    let s = reducer(undefined, addToast('a'));
    s = reducer(s, addToast('b'));
    s = reducer(s, addToast('c'));
    s = reducer(s, addToast('d'));
    expect(s.items.map((t) => t.message)).toEqual(['b', 'c', 'd']);
  });

  it('removeToast removes by id', () => {
    const s1 = reducer(undefined, addToast('x'));
    const id = s1.items[0].id;
    const s2 = reducer(s1, removeToast(id));
    expect(s2.items).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/redux/toastSlice.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/redux/toastSlice.test.ts
git commit -m "test(fe): cover toastSlice"
```

### Task T1.12: eventsSlice thunk + reducer tests

**Files:**
- Create: `frontend/src/tests/redux/eventsSlice.test.ts`

- [ ] **Step 1: Write the test**

This is the reference pattern for thunk-bearing slices: mock `../../lib/apiClient`, dispatch through a real store built from only this reducer, assert resulting state and the API call.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchEvents, createEvent, updateEvent, deleteEvent,
} from '../../redux/slices/eventsSlice';
import { ok } from '../../test/mockHttp';
import { anEvent } from '../../test/fixtures';

const mockApi = vi.mocked(apiClient);
const makeStore = () => configureStore({ reducer: { events: reducer } });

beforeEach(() => vi.clearAllMocks());

describe('eventsSlice', () => {
  it('fetchEvents populates items', async () => {
    const events = [anEvent({ id: 1 }), anEvent({ id: 2 })];
    mockApi.get.mockResolvedValue(ok(events));
    const store = makeStore();
    await store.dispatch(fetchEvents());
    expect(store.getState().events.items).toHaveLength(2);
    expect(store.getState().events.loading).toBe(false);
    expect(mockApi.get).toHaveBeenCalledWith('/events');
  });

  it('fetchEvents rejected sets error', async () => {
    mockApi.get.mockRejectedValue(new Error('down'));
    const store = makeStore();
    await store.dispatch(fetchEvents());
    expect(store.getState().events.error).toBeTruthy();
    expect(store.getState().events.loading).toBe(false);
  });

  it('createEvent appends to items', async () => {
    mockApi.post.mockResolvedValue(ok(anEvent({ id: 5 })));
    const store = makeStore();
    await store.dispatch(createEvent({ childId: 1, date: '2026-07-01' }));
    expect(store.getState().events.items.map((e) => e.id)).toContain(5);
  });

  it('updateEvent replaces matching item and current', async () => {
    const store = makeStore();
    mockApi.post.mockResolvedValue(ok(anEvent({ id: 7, venue: 'Old' })));
    await store.dispatch(createEvent({ childId: 1, date: '2026-07-01' }));
    mockApi.put.mockResolvedValue(ok(anEvent({ id: 7, venue: 'New' })));
    await store.dispatch(updateEvent({ id: 7, data: { venue: 'New' } }));
    expect(store.getState().events.items.find((e) => e.id === 7)?.venue).toBe('New');
  });

  it('deleteEvent removes item', async () => {
    const store = makeStore();
    mockApi.post.mockResolvedValue(ok(anEvent({ id: 9 })));
    await store.dispatch(createEvent({ childId: 1, date: '2026-07-01' }));
    mockApi.delete.mockResolvedValue(ok({ deleted: true }));
    await store.dispatch(deleteEvent(9));
    expect(store.getState().events.items.find((e) => e.id === 9)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/redux/eventsSlice.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/redux/eventsSlice.test.ts
git commit -m "test(fe): cover eventsSlice thunks + reducers"
```

### Task T1.13: guestsSlice tests

**Files:**
- Create: `frontend/src/tests/redux/guestsSlice.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchGuests, createGuest, updateGuest, deleteGuest, bulkImportGuests,
} from '../../redux/slices/guestsSlice';
import { ok } from '../../test/mockHttp';
import { aGuest } from '../../test/fixtures';

const mockApi = vi.mocked(apiClient);
const makeStore = () => configureStore({ reducer: { guests: reducer } });
beforeEach(() => vi.clearAllMocks());

describe('guestsSlice', () => {
  it('fetchGuests stores guests under eventId', async () => {
    mockApi.get.mockResolvedValue(ok([aGuest({ id: 1 }), aGuest({ id: 2 })]));
    const store = makeStore();
    await store.dispatch(fetchGuests(42));
    expect(store.getState().guests.byEventId[42]).toHaveLength(2);
    expect(mockApi.get).toHaveBeenCalledWith('/events/42/guests');
  });

  it('createGuest pushes into the event bucket', async () => {
    mockApi.post.mockResolvedValue(ok({ ...aGuest({ id: 3 }), eventId: 42 }));
    const store = makeStore();
    await store.dispatch(createGuest({ eventId: 42, data: { name: 'New' } }));
    expect(store.getState().guests.byEventId[42].map((g) => g.id)).toContain(3);
  });

  it('updateGuest replaces matching guest', async () => {
    mockApi.get.mockResolvedValue(ok([aGuest({ id: 1, name: 'Old' })]));
    const store = makeStore();
    await store.dispatch(fetchGuests(42));
    mockApi.put.mockResolvedValue(ok({ ...aGuest({ id: 1, name: 'New' }), eventId: 42 }));
    await store.dispatch(updateGuest({ eventId: 42, id: 1, data: { name: 'New' } }));
    expect(store.getState().guests.byEventId[42][0].name).toBe('New');
  });

  it('deleteGuest removes the guest from all buckets', async () => {
    mockApi.get.mockResolvedValue(ok([aGuest({ id: 1 })]));
    const store = makeStore();
    await store.dispatch(fetchGuests(42));
    mockApi.delete.mockResolvedValue(ok({ deleted: true }));
    await store.dispatch(deleteGuest({ eventId: 42, id: 1 }));
    expect(store.getState().guests.byEventId[42]).toHaveLength(0);
  });

  it('bulkImportGuests resolves with a count', async () => {
    mockApi.post.mockResolvedValue(ok({ count: 2 }));
    const store = makeStore();
    await store.dispatch(bulkImportGuests({ eventId: 42, guests: [{ name: 'A' }, { name: 'B' }] }));
    expect(mockApi.post).toHaveBeenCalledWith('/events/42/guests/bulk-import', { guests: [{ name: 'A' }, { name: 'B' }] });
  });
});
```

> Note: `createGuest`/`updateGuest` reducers read `action.payload.eventId`. The backend returns the guest; the slice relies on an `eventId` field on the returned guest. The test attaches `eventId: 42` to the mocked payload to match the reducer's expectation (`action.payload.eventId`). If a test fails because the bucket is `undefined`, that is a real source bug (the create/update reducers assume `eventId` on the guest) — record it as a finding, keep the test asserting current behavior.

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/redux/guestsSlice.test.ts`
Expected: PASS (5 tests). If the create/update bucket assertions fail due to the `eventId`-on-payload issue noted above, adjust the assertion to current behavior and open a follow-up note in `FRONTEND_SOLID_PLAN.md`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/redux/guestsSlice.test.ts
git commit -m "test(fe): cover guestsSlice thunks + reducers"
```

### Task T1.14: childrenSlice tests

**Files:**
- Create: `frontend/src/tests/redux/childrenSlice.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchChildren, createChild, updateChild, deleteChild,
} from '../../redux/slices/childrenSlice';
import { ok } from '../../test/mockHttp';
import { aChild } from '../../test/fixtures';

const mockApi = vi.mocked(apiClient);
const makeStore = () => configureStore({ reducer: { children: reducer } });
beforeEach(() => vi.clearAllMocks());

describe('childrenSlice', () => {
  it('fetchChildren populates items', async () => {
    mockApi.get.mockResolvedValue(ok([aChild({ id: 1 }), aChild({ id: 2 })]));
    const store = makeStore();
    await store.dispatch(fetchChildren());
    expect(store.getState().children.items).toHaveLength(2);
    expect(mockApi.get).toHaveBeenCalledWith('/children');
  });

  it('createChild posts FormData and appends', async () => {
    mockApi.post.mockResolvedValue(ok(aChild({ id: 5 })));
    const store = makeStore();
    const fd = new FormData();
    fd.append('name', 'Mia');
    await store.dispatch(createChild(fd));
    expect(store.getState().children.items.map((c) => c.id)).toContain(5);
  });

  it('updateChild replaces matching child', async () => {
    mockApi.get.mockResolvedValue(ok([aChild({ id: 1, name: 'Old' })]));
    const store = makeStore();
    await store.dispatch(fetchChildren());
    mockApi.put.mockResolvedValue(ok(aChild({ id: 1, name: 'New' })));
    await store.dispatch(updateChild({ id: 1, data: { name: 'New' } }));
    expect(store.getState().children.items[0].name).toBe('New');
  });

  it('deleteChild removes the child', async () => {
    mockApi.get.mockResolvedValue(ok([aChild({ id: 1 })]));
    const store = makeStore();
    await store.dispatch(fetchChildren());
    mockApi.delete.mockResolvedValue(ok({ deleted: true }));
    await store.dispatch(deleteChild(1));
    expect(store.getState().children.items).toHaveLength(0);
  });

  it('fetchChildren rejected sets error', async () => {
    mockApi.get.mockRejectedValue(new Error('down'));
    const store = makeStore();
    await store.dispatch(fetchChildren());
    expect(store.getState().children.error).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/redux/childrenSlice.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/redux/childrenSlice.test.ts
git commit -m "test(fe): cover childrenSlice thunks + reducers"
```

### Task T1.15: expensesSlice tests

**Files:**
- Create: `frontend/src/tests/redux/expensesSlice.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchExpenses, createExpense, updateExpense, deleteExpense,
} from '../../redux/slices/expensesSlice';
import { ok } from '../../test/mockHttp';
import { anExpense } from '../../test/fixtures';

const mockApi = vi.mocked(apiClient);
const makeStore = () => configureStore({ reducer: { expenses: reducer } });
beforeEach(() => vi.clearAllMocks());

describe('expensesSlice', () => {
  it('fetchExpenses stores expenses + summary (two parallel GETs)', async () => {
    mockApi.get
      .mockResolvedValueOnce(ok([anExpense({ id: 1 })]))   // /expenses
      .mockResolvedValueOnce(ok({ total: 1500, byCategory: {} })); // /summary
    const store = makeStore();
    await store.dispatch(fetchExpenses(42));
    expect(store.getState().expenses.byEventId[42]).toHaveLength(1);
    expect(store.getState().expenses.summaryByEventId[42]).toEqual({ total: 1500, byCategory: {} });
  });

  it('createExpense unshifts into the bucket', async () => {
    mockApi.post.mockResolvedValue(ok(anExpense({ id: 9 })));
    const store = makeStore();
    await store.dispatch(createExpense({ eventId: 42, data: { label: 'Cake', amount: 1500, category: 'cake' } }));
    expect(store.getState().expenses.byEventId[42][0].id).toBe(9);
  });

  it('updateExpense replaces matching expense', async () => {
    mockApi.get
      .mockResolvedValueOnce(ok([anExpense({ id: 1, amount: 100 })]))
      .mockResolvedValueOnce(ok({ total: 100, byCategory: {} }));
    const store = makeStore();
    await store.dispatch(fetchExpenses(42));
    mockApi.put.mockResolvedValue(ok(anExpense({ id: 1, amount: 200 })));
    await store.dispatch(updateExpense({ eventId: 42, id: 1, data: { amount: 200 } }));
    expect(store.getState().expenses.byEventId[42][0].amount).toBe(200);
  });

  it('deleteExpense removes from bucket', async () => {
    mockApi.get
      .mockResolvedValueOnce(ok([anExpense({ id: 1 })]))
      .mockResolvedValueOnce(ok({ total: 0, byCategory: {} }));
    const store = makeStore();
    await store.dispatch(fetchExpenses(42));
    mockApi.delete.mockResolvedValue(ok({ deleted: true }));
    await store.dispatch(deleteExpense({ eventId: 42, id: 1 }));
    expect(store.getState().expenses.byEventId[42]).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/redux/expensesSlice.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/redux/expensesSlice.test.ts
git commit -m "test(fe): cover expensesSlice thunks + reducers"
```

### Task T1.16: giftsSlice tests

**Files:**
- Create: `frontend/src/tests/redux/giftsSlice.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchGifts, createGift, updateGift, deleteGift,
} from '../../redux/slices/giftsSlice';
import { ok } from '../../test/mockHttp';
import { aGift } from '../../test/fixtures';

const mockApi = vi.mocked(apiClient);
const makeStore = () => configureStore({ reducer: { gifts: reducer } });
beforeEach(() => vi.clearAllMocks());

describe('giftsSlice', () => {
  it('fetchGifts stores gifts under eventId', async () => {
    mockApi.get.mockResolvedValue(ok([aGift({ id: 1 }), aGift({ id: 2 })]));
    const store = makeStore();
    await store.dispatch(fetchGifts(42));
    expect(store.getState().gifts.byEventId[42]).toHaveLength(2);
    expect(mockApi.get).toHaveBeenCalledWith('/events/42/gifts');
  });

  it('createGift unshifts into the bucket', async () => {
    mockApi.post.mockResolvedValue(ok(aGift({ id: 9 })));
    const store = makeStore();
    await store.dispatch(createGift({ eventId: 42, data: { name: 'Lego' } }));
    expect(store.getState().gifts.byEventId[42][0].id).toBe(9);
  });

  it('updateGift replaces matching gift', async () => {
    mockApi.get.mockResolvedValue(ok([aGift({ id: 1, status: 'idea' })]));
    const store = makeStore();
    await store.dispatch(fetchGifts(42));
    mockApi.put.mockResolvedValue(ok(aGift({ id: 1, status: 'bought' })));
    await store.dispatch(updateGift({ eventId: 42, id: 1, data: { status: 'bought' } }));
    expect(store.getState().gifts.byEventId[42][0].status).toBe('bought');
  });

  it('deleteGift removes from the bucket', async () => {
    mockApi.get.mockResolvedValue(ok([aGift({ id: 1 })]));
    const store = makeStore();
    await store.dispatch(fetchGifts(42));
    mockApi.delete.mockResolvedValue(ok({ deleted: true }));
    await store.dispatch(deleteGift({ eventId: 42, id: 1 }));
    expect(store.getState().gifts.byEventId[42]).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/redux/giftsSlice.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/redux/giftsSlice.test.ts
git commit -m "test(fe): cover giftsSlice thunks + reducers"
```

### Task T1.17: photosSlice tests

**Files:**
- Create: `frontend/src/tests/redux/photosSlice.test.ts`

- [ ] **Step 1: Write the test**

Note: photosSlice thunks do NOT use `rejectWithValue`; rejection stores `action.error.message`. Reject with an `Error` to exercise the rejected branch.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchPhotos, uploadPhoto, updatePhoto, deletePhoto,
} from '../../redux/slices/photosSlice';
import { ok } from '../../test/mockHttp';
import { aPhoto } from '../../test/fixtures';

const mockApi = vi.mocked(apiClient);
const makeStore = () => configureStore({ reducer: { photos: reducer } });
beforeEach(() => vi.clearAllMocks());

describe('photosSlice', () => {
  it('fetchPhotos stores photos under eventId', async () => {
    mockApi.get.mockResolvedValue(ok([aPhoto({ id: 1 })]));
    const store = makeStore();
    await store.dispatch(fetchPhotos(42));
    expect(store.getState().photos.byEventId[42]).toHaveLength(1);
  });

  it('uploadPhoto pushes into the bucket', async () => {
    mockApi.post.mockResolvedValue(ok(aPhoto({ id: 9 })));
    const store = makeStore();
    const fd = new FormData();
    fd.append('photo', new File(['x'], 'p.png', { type: 'image/png' }));
    await store.dispatch(uploadPhoto({ eventId: 42, formData: fd }));
    expect(store.getState().photos.byEventId[42].map((p) => p.id)).toContain(9);
  });

  it('updatePhoto setting cover clears other covers', async () => {
    mockApi.get.mockResolvedValue(ok([aPhoto({ id: 1, isCover: true }), aPhoto({ id: 2, isCover: false })]));
    const store = makeStore();
    await store.dispatch(fetchPhotos(42));
    mockApi.put.mockResolvedValue(ok(aPhoto({ id: 2, isCover: true })));
    await store.dispatch(updatePhoto({ eventId: 42, photoId: 2, data: { isCover: true } }));
    const list = store.getState().photos.byEventId[42];
    expect(list.find((p) => p.id === 1)?.isCover).toBe(false);
    expect(list.find((p) => p.id === 2)?.isCover).toBe(true);
  });

  it('deletePhoto removes from bucket', async () => {
    mockApi.get.mockResolvedValue(ok([aPhoto({ id: 1 })]));
    const store = makeStore();
    await store.dispatch(fetchPhotos(42));
    mockApi.delete.mockResolvedValue(ok({ deleted: true }));
    await store.dispatch(deletePhoto({ eventId: 42, photoId: 1 }));
    expect(store.getState().photos.byEventId[42]).toHaveLength(0);
  });

  it('fetchPhotos rejected sets error from action.error', async () => {
    mockApi.get.mockRejectedValue(new Error('boom'));
    const store = makeStore();
    await store.dispatch(fetchPhotos(42));
    expect(store.getState().photos.error).toBe('boom');
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/redux/photosSlice.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/redux/photosSlice.test.ts
git commit -m "test(fe): cover photosSlice thunks + reducers"
```

### Task T1.18: remindersSlice tests

**Files:**
- Create: `frontend/src/tests/redux/remindersSlice.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchReminders, fetchUnreadCount, createReminder, deleteReminder, markRead,
} from '../../redux/slices/remindersSlice';
import { ok } from '../../test/mockHttp';
import { aReminder } from '../../test/fixtures';

const mockApi = vi.mocked(apiClient);
const makeStore = () => configureStore({ reducer: { reminders: reducer } });
beforeEach(() => vi.clearAllMocks());

describe('remindersSlice', () => {
  it('fetchReminders populates items', async () => {
    mockApi.get.mockResolvedValue(ok([aReminder({ id: 1 }), aReminder({ id: 2 })]));
    const store = makeStore();
    await store.dispatch(fetchReminders());
    expect(store.getState().reminders.items).toHaveLength(2);
  });

  it('fetchUnreadCount accepts a number payload', async () => {
    mockApi.get.mockResolvedValue(ok(4));
    const store = makeStore();
    await store.dispatch(fetchUnreadCount());
    expect(store.getState().reminders.unreadCount).toBe(4);
  });

  it('fetchUnreadCount accepts a { count } payload', async () => {
    mockApi.get.mockResolvedValue(ok({ count: 7 }));
    const store = makeStore();
    await store.dispatch(fetchUnreadCount());
    expect(store.getState().reminders.unreadCount).toBe(7);
  });

  it('createReminder appends to items', async () => {
    mockApi.post.mockResolvedValue(ok(aReminder({ id: 9 })));
    const store = makeStore();
    await store.dispatch(createReminder({ label: 'X', triggerAt: '2026-06-20T10:00:00Z' }));
    expect(store.getState().reminders.items.map((r) => r.id)).toContain(9);
  });

  it('deleteReminder removes item', async () => {
    mockApi.get.mockResolvedValue(ok([aReminder({ id: 1 })]));
    const store = makeStore();
    await store.dispatch(fetchReminders());
    mockApi.delete.mockResolvedValue(ok({ deleted: true }));
    await store.dispatch(deleteReminder(1));
    expect(store.getState().reminders.items).toHaveLength(0);
  });

  it('markRead flags items fired and decrements unreadCount', async () => {
    mockApi.get.mockResolvedValue(ok([aReminder({ id: 1, fired: false }), aReminder({ id: 2, fired: false })]));
    const store = makeStore();
    await store.dispatch(fetchReminders());
    mockApi.get.mockResolvedValue(ok(2));
    await store.dispatch(fetchUnreadCount());
    mockApi.post.mockResolvedValue(ok({ marked: true }));
    await store.dispatch(markRead([1]));
    expect(store.getState().reminders.items.find((r) => r.id === 1)?.fired).toBe(true);
    expect(store.getState().reminders.unreadCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run it**

Run: `cd frontend && npx vitest run src/tests/redux/remindersSlice.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tests/redux/remindersSlice.test.ts
git commit -m "test(fe): cover remindersSlice thunks + reducers"
```

### Task T1.19: Ratchet thresholds to T1 targets + full verify

**Files:**
- Modify: `frontend/vitest.config.mjs`

- [ ] **Step 1: Measure post-T1 coverage**

Run: `cd frontend && npm run test:coverage`
Expected: PASS. `src/redux`, `src/api`, and `src/lib` should now be well above 90%.

- [ ] **Step 2: Raise the logic-layer thresholds to the spec targets**

In `frontend/vitest.config.mjs`, set:

```js
      thresholds: {
        'src/redux/**/*.ts': { lines: 90, functions: 90 },
        'src/api/**/*.ts': { lines: 90 },
        'src/lib/**/*.ts': { lines: 90 },
        'src/components/**/*.tsx': { lines: 70 }, // unchanged baseline until T2
        'src/pages/**/*.tsx': { lines: 70 },      // unchanged baseline until T3
        lines: 70,                                 // global floor — keep at current baseline
      },
```

> If `src/components`/`src/pages` baselines measured in Task T0.1 were *below* 70, keep them at their measured baseline here (do not raise to 70 yet — that is T2/T3 work). The point is: never lower a threshold, only raise it as tests land.

- [ ] **Step 3: Verify the gate passes at the new targets**

Run: `cd frontend && npm run test:coverage`
Expected: PASS — redux/api/lib meet 90%.

- [ ] **Step 4: Full suite + typecheck + lint sanity**

Run: `cd frontend && npm run typecheck && npm run lint && npm test`
Expected: typecheck clean; lint clean on new files; all tests pass (27 original + the new unit tests).

- [ ] **Step 5: Commit**

```bash
git add frontend/vitest.config.mjs
git commit -m "test(fe): ratchet redux/api/lib coverage gate to 90%"
```

---

## Done Criteria for T0 + T1

- [ ] CI workflow exists; `frontend` + `backend` jobs run on PRs.
- [ ] Coverage thresholds enforced; `src/redux` / `src/api` / `src/lib` ≥ 90% lines.
- [ ] All 8 slices, 6 api/ repo modules, and `apiError`/`media`/`csv` lib helpers unit-tested.
- [ ] Husky pre-commit lints `.ts/.tsx`; backend `lint` script runs under ESLint v9.
- [ ] Original 27 FE + 134 BE tests still green.

## Notes / Findings to carry forward

- `guestsSlice` create/update reducers read `action.payload.eventId` but the backend returns a bare `Guest` (no `eventId`). If T1.13 confirms the bucket isn't updated, log this in `FRONTEND_SOLID_PLAN.md` as a real bug to fix during the slice-factory work (FE Phase 2).
- `src/api/http.ts` is excluded from coverage (transport config). Its SSR `getApiBaseUrl` branch is intentionally untested.
- Follow-up plans: T2 (component integration), T3 (decompose + test big components = SOLID FE Ph3–5), T4 (Playwright E2E), T5 (final threshold ratchet + standardize E2E job).
