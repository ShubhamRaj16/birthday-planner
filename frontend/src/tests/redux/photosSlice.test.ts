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

describe('photosSlice rejected paths', () => {
  it('sets error on upload/update/delete rejection', async () => {
    const store = makeStore();
    mockApi.post.mockRejectedValue(new Error('x'));
    const fd = new FormData(); fd.append('photo', new File(['x'], 'p.png', { type: 'image/png' }));
    await store.dispatch(uploadPhoto({ eventId: 42, formData: fd }));
    mockApi.put.mockRejectedValue(new Error('x'));
    await store.dispatch(updatePhoto({ eventId: 42, photoId: 1, data: {} }));
    mockApi.delete.mockRejectedValue(new Error('x'));
    await store.dispatch(deletePhoto({ eventId: 42, photoId: 1 }));
    expect(store.getState().photos.error).toBeTruthy();
  });
});
