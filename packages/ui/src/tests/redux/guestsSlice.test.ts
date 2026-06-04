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

describe('guestsSlice rejected paths', () => {
  it('sets error on fetch/create/update/delete/bulkImport rejection', async () => {
    const store = makeStore();
    mockApi.get.mockRejectedValue(new Error('x'));
    await store.dispatch(fetchGuests(42));
    mockApi.post.mockRejectedValue(new Error('x'));
    await store.dispatch(createGuest({ eventId: 42, data: { name: 'N' } }));
    mockApi.put.mockRejectedValue(new Error('x'));
    await store.dispatch(updateGuest({ eventId: 42, id: 1, data: {} }));
    mockApi.delete.mockRejectedValue(new Error('x'));
    await store.dispatch(deleteGuest({ eventId: 42, id: 1 }));
    mockApi.post.mockRejectedValue(new Error('x'));
    await store.dispatch(bulkImportGuests({ eventId: 42, guests: [{ name: 'A' }] }));
    expect(store.getState().guests.error).toBeTruthy();
  });
});
