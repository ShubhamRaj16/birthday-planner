import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchGifts,
  createGift,
  updateGift,
  deleteGift,
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

describe('giftsSlice rejected paths', () => {
  it('sets error on fetch/create/update/delete rejection', async () => {
    const store = makeStore();
    mockApi.get.mockRejectedValue(new Error('x'));
    await store.dispatch(fetchGifts(42));
    mockApi.post.mockRejectedValue(new Error('x'));
    await store.dispatch(createGift({ eventId: 42, data: { name: 'L' } }));
    mockApi.put.mockRejectedValue(new Error('x'));
    await store.dispatch(updateGift({ eventId: 42, id: 1, data: {} }));
    mockApi.delete.mockRejectedValue(new Error('x'));
    await store.dispatch(deleteGift({ eventId: 42, id: 1 }));
    expect(store.getState().gifts.error).toBeTruthy();
  });
});
