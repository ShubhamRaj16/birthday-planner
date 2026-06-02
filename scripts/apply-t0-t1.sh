#!/usr/bin/env bash
#
# apply-t0-t1.sh — applies the entire FE Test Coverage T0+T1 plan with zero model tokens.
# Plan: docs/superpowers/plans/2026-06-02-frontend-test-coverage-t0-t1.md
#
# What it does (each group ends in a git commit):
#   1. Lint fixes (husky .ts/.tsx glob, backend ESLint v9 script) + GitHub Actions CI
#   2. Test infra (fixtures + http mock helper)
#   3. lib unit tests (apiError, media, csv)
#   4. api unit tests (whatsapp, events, ai, gifts, tasks, expenses)
#   5. redux slice unit tests (toast, events, guests, children, expenses, gifts, photos, reminders)
#   6. Run full FE suite, then enable 90% coverage gate on redux/api/lib and verify
#
# On ANY failure the script stops (set -e). Copy the error output back to Claude;
# the only non-mechanical step is interpreting a genuinely failing test.
#
# Usage:
#   cd <repo root>            # the dir containing frontend/ and backend/
#   git switch -c test/t0-t1  # recommended: work on a branch
#   bash scripts/apply-t0-t1.sh

set -euo pipefail

trap 'echo ""; echo "✗ STOPPED at line $LINENO. Copy the error above back to Claude."; exit 1' ERR

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "Repo root: $ROOT"

if [ ! -d frontend ] || [ ! -d backend ]; then
  echo "✗ Run from the repo root (needs frontend/ and backend/)."; exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# GROUP 1 — Lint fixes + CI
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Group 1: lint fixes + CI"

# 1a. Husky: lint .ts/.tsx (source is TS; current globs only match .js/.jsx)
perl -0pi -e 's/\Q"^backend\/src\/.*\.js\$"\E/"^backend\/src\/.*\\.(ts|js)\$"/' .husky/pre-commit
perl -0pi -e "s/'src\/\*\*\/\*\.js'/'src\/**\/*.{ts,js}'/" .husky/pre-commit
perl -0pi -e 's/\Q"^frontend\/src\/.*\.(js|jsx)\$"\E/"^frontend\/src\/.*\\.(ts|tsx|js|jsx)\$"/' .husky/pre-commit
perl -0pi -e "s/'src\/\*\*\/\*\.\{js,jsx\}'/'src\/**\/*.{ts,tsx,js,jsx}'/" .husky/pre-commit

# 1b. Backend lint script: add ESLINT_USE_FLAT_CONFIG=false (ESLint v9 wants flat config)
( cd backend && npm ls cross-env >/dev/null 2>&1 || npm i -D cross-env )
perl -0pi -e 's/"lint": "eslint /"lint": "cross-env ESLINT_USE_FLAT_CONFIG=false eslint /' backend/package.json

# 1c. GitHub Actions CI
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<'YAML_EOF'
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
YAML_EOF

git add .husky/pre-commit backend/package.json backend/package-lock.json .github/workflows/ci.yml 2>/dev/null || true
git commit -q -m "chore: lint .ts/.tsx in husky + fix backend eslint v9 + add CI" || echo "  (nothing to commit for group 1)"

# ─────────────────────────────────────────────────────────────────────────────
# GROUP 2 — Test infra
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Group 2: fixtures + http mock"
mkdir -p frontend/src/test frontend/src/tests/lib frontend/src/tests/api frontend/src/tests/redux

cat > frontend/src/test/fixtures.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/test/mockHttp.ts <<'TS_EOF'
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
TS_EOF

# setup.ts: ensure the global axios mock exports isAxiosError (lib/apiError needs it,
# else getApiError throws inside slice/api thunks). Rewrite to the corrected version.
cat > frontend/src/test/setup.ts <<'TS_EOF'
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global axios mock — no real API calls in frontend tests
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  // Named export used by lib/apiError.ts. Detects AxiosError by its flag so
  // getApiError() works under the mock instead of throwing "isAxiosError is not a function".
  isAxiosError: (e) => Boolean(e && e.isAxiosError),
}));
TS_EOF

( cd frontend && npm run typecheck )
git add frontend/src/test/fixtures.ts frontend/src/test/mockHttp.ts frontend/src/test/setup.ts
git commit -q -m "test(fe): add shared fixtures + http mock helper" || echo "  (nothing new to commit)"

# ─────────────────────────────────────────────────────────────────────────────
# GROUP 3 — lib tests
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Group 3: lib tests"

cat > frontend/src/tests/lib/apiError.test.ts <<'TS_EOF'
import { describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';
import { getApiError } from '../../lib/apiError';

// setup.ts globally mocks axios (to block real HTTP), but apiError.ts relies on
// the real isAxiosError + AxiosError. Use the actual module for this file only.
vi.mock('axios', async (importOriginal) => await importOriginal());

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
TS_EOF

cat > frontend/src/tests/lib/media.test.ts <<'TS_EOF'
import { describe, it, expect } from 'vitest';
import { mediaUrl } from '../../lib/media';

describe('mediaUrl', () => {
  it('builds a URL against the current hostname on port 3001', () => {
    expect(mediaUrl('/uploads/x.jpg')).toBe('http://localhost:3001/uploads/x.jpg');
  });

  it('passes the storage path through unchanged', () => {
    expect(mediaUrl('/uploads/photos/10/a b.png')).toBe(
      'http://localhost:3001/uploads/photos/10/a b.png',
    );
  });
});
TS_EOF

cat > frontend/src/tests/lib/csv.test.ts <<'TS_EOF'
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
TS_EOF

( cd frontend && npx vitest run src/tests/lib )
git add frontend/src/tests/lib
git commit -q -m "test(fe): cover lib (apiError, media, csv)" || echo "  (nothing new to commit)"

# ─────────────────────────────────────────────────────────────────────────────
# GROUP 4 — api tests
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Group 4: api tests"

cat > frontend/src/tests/api/whatsapp.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/api/events.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/api/ai.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/api/gifts.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/api/tasks.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/api/expenses.test.ts <<'TS_EOF'
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
TS_EOF

( cd frontend && npx vitest run src/tests/api )
git add frontend/src/tests/api
git commit -q -m "test(fe): cover api repository modules" || echo "  (nothing new to commit)"

# ─────────────────────────────────────────────────────────────────────────────
# GROUP 5 — slice tests
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Group 5: slice tests"

cat > frontend/src/tests/redux/toastSlice.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/redux/eventsSlice.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/redux/guestsSlice.test.ts <<'TS_EOF'
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

  it('bulkImportGuests posts the guests array', async () => {
    mockApi.post.mockResolvedValue(ok({ count: 2 }));
    const store = makeStore();
    await store.dispatch(bulkImportGuests({ eventId: 42, guests: [{ name: 'A' }, { name: 'B' }] }));
    expect(mockApi.post).toHaveBeenCalledWith('/events/42/guests/bulk-import', { guests: [{ name: 'A' }, { name: 'B' }] });
  });
});
TS_EOF

cat > frontend/src/tests/redux/childrenSlice.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/redux/expensesSlice.test.ts <<'TS_EOF'
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
      .mockResolvedValueOnce(ok([anExpense({ id: 1 })]))
      .mockResolvedValueOnce(ok({ total: 1500, byCategory: {} }));
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
TS_EOF

cat > frontend/src/tests/redux/giftsSlice.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/redux/photosSlice.test.ts <<'TS_EOF'
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
TS_EOF

cat > frontend/src/tests/redux/remindersSlice.test.ts <<'TS_EOF'
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
TS_EOF

( cd frontend && npx vitest run src/tests/redux )
git add frontend/src/tests/redux
git commit -q -m "test(fe): cover all 8 redux slices" || echo "  (nothing new to commit)"

# ─────────────────────────────────────────────────────────────────────────────
# GROUP 6 — full suite + enable coverage gate (redux/api/lib @ 90%)
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Group 6: full suite + coverage gate"

# Keep the generated coverage report out of git (lcovonly emits coverage/lcov.info).
touch frontend/.gitignore
grep -qxF 'coverage/' frontend/.gitignore || printf 'coverage/\n' >> frontend/.gitignore

( cd frontend && npm run typecheck && npm test )

cat > frontend/vitest.config.mjs <<'MJS_EOF'
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/tests/**/*.test.{js,ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcovonly'],
      include: ['src/**/*.{js,ts,tsx}'],
      exclude: [
        'src/server/**',
        'src/test/**',
        'src/tests/**',
        'src/client/index.js',
        'src/api/http.ts', // transport config (axios.create); behaviourless
      ],
      thresholds: {
        // Logic layer gated at 95% lines. Glob targets slices/ (not store.ts /
        // hooks.ts, which are DI/typing wiring like api/http.ts). Components/pages
        // stay ungated until T2/T3 land their tests. Never lower — only raise.
        'src/redux/slices/**/*.ts': { lines: 95, functions: 95 },
        'src/api/**/*.ts': { lines: 95 },
        'src/lib/**/*.ts': { lines: 95 },
      },
    },
  },
});
MJS_EOF

( cd frontend && npm run test:coverage )
git add frontend/vitest.config.mjs frontend/.gitignore
git commit -q -m "test(fe): enable 90% coverage gate on redux/api/lib" || echo "  (nothing new to commit)"

echo ""
echo "✓ T0+T1 applied. Commits:"
git log --oneline -7
echo ""
echo "Next: push the branch and open a PR; the new CI workflow runs frontend + backend gates."
