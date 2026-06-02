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
