import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchEvents, fetchEvent, fetchUpcoming, createEvent, updateEvent, deleteEvent, activateEvent,
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

  it('fetchEvent sets current', async () => {
    mockApi.get.mockResolvedValue(ok(anEvent({ id: 3, venue: 'X' })));
    const store = makeStore();
    await store.dispatch(fetchEvent(3));
    expect(store.getState().events.current?.id).toBe(3);
    expect(mockApi.get).toHaveBeenCalledWith('/events/3');
  });

  it('fetchEvent rejected sets error', async () => {
    mockApi.get.mockRejectedValue(new Error('down'));
    const store = makeStore();
    await store.dispatch(fetchEvent(3));
    expect(store.getState().events.error).toBeTruthy();
  });

  it('fetchUpcoming populates items', async () => {
    mockApi.get.mockResolvedValue(ok([anEvent({ id: 1 }), anEvent({ id: 2 })]));
    const store = makeStore();
    await store.dispatch(fetchUpcoming());
    expect(store.getState().events.items).toHaveLength(2);
    expect(mockApi.get).toHaveBeenCalledWith('/events/upcoming');
  });

  it('createEvent rejected sets error', async () => {
    mockApi.post.mockRejectedValue(new Error('bad'));
    const store = makeStore();
    await store.dispatch(createEvent({ childId: 1, date: '2026-07-01' }));
    expect(store.getState().events.error).toBeTruthy();
  });

  it('updateEvent rejected sets error', async () => {
    mockApi.put.mockRejectedValue(new Error('bad'));
    const store = makeStore();
    await store.dispatch(updateEvent({ id: 1, data: { venue: 'Z' } }));
    expect(store.getState().events.error).toBeTruthy();
  });

  it('deleteEvent rejected sets error', async () => {
    mockApi.delete.mockRejectedValue(new Error('bad'));
    const store = makeStore();
    await store.dispatch(deleteEvent(1));
    expect(store.getState().events.error).toBeTruthy();
  });

  it('activateEvent sets status to Active on items and current', async () => {
    const store = makeStore();
    mockApi.post.mockResolvedValueOnce(ok(anEvent({ id: 7, status: 'Draft' })));
    await store.dispatch(createEvent({ childId: 1, date: '2026-07-01' }));
    mockApi.get.mockResolvedValue(ok(anEvent({ id: 7, status: 'Draft' })));
    await store.dispatch(fetchEvent(7));
    mockApi.post.mockResolvedValueOnce(ok(anEvent({ id: 7, status: 'Active' })));
    await store.dispatch(activateEvent(7));
    expect(store.getState().events.items.find((e) => e.id === 7)?.status).toBe('Active');
    expect(store.getState().events.current?.status).toBe('Active');
    expect(mockApi.post).toHaveBeenCalledWith('/events/7/activate');
  });

  it('activateEvent rejected sets error', async () => {
    mockApi.post.mockRejectedValue(new Error('bad'));
    const store = makeStore();
    await store.dispatch(activateEvent(1));
    expect(store.getState().events.error).toBeTruthy();
  });
});
