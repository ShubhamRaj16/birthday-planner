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
