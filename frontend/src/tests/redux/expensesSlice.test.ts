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

describe('expensesSlice rejected paths', () => {
  it('sets error on fetch/create/update/delete rejection', async () => {
    const store = makeStore();
    mockApi.get.mockRejectedValue(new Error('x'));
    await store.dispatch(fetchExpenses(42));
    mockApi.post.mockRejectedValue(new Error('x'));
    await store.dispatch(createExpense({ eventId: 42, data: { label: 'C', amount: 1, category: 'cake' } }));
    mockApi.put.mockRejectedValue(new Error('x'));
    await store.dispatch(updateExpense({ eventId: 42, id: 1, data: {} }));
    mockApi.delete.mockRejectedValue(new Error('x'));
    await store.dispatch(deleteExpense({ eventId: 42, id: 1 }));
    expect(store.getState().expenses.error).toBeTruthy();
  });
});
