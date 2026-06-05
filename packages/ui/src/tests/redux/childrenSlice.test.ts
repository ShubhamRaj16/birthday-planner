import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/apiClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  mediaUrl: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import reducer, {
  fetchChildren,
  createChild,
  updateChild,
  deleteChild,
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

describe('childrenSlice rejected paths', () => {
  it('sets error on create/update/delete rejection', async () => {
    const store = makeStore();
    mockApi.post.mockRejectedValue(new Error('x'));
    const fd = new FormData();
    fd.append('name', 'M');
    await store.dispatch(createChild(fd));
    mockApi.put.mockRejectedValue(new Error('x'));
    await store.dispatch(updateChild({ id: 1, data: { name: 'N' } }));
    mockApi.delete.mockRejectedValue(new Error('x'));
    await store.dispatch(deleteChild(1));
    expect(store.getState().children.error).toBeTruthy();
  });
});
