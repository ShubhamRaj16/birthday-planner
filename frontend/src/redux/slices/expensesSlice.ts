import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import { getApiError } from '../../lib/apiError';
import type { ApiResponse, Expense, ExpenseSummary, ExpensesState } from '../../types';

type ExpenseInput = Partial<Expense>;
type CreateExpenseArgs = { eventId: number; data: ExpenseInput };
type UpdateExpenseArgs = { eventId: number; id: number; data: ExpenseInput };
type DeleteExpenseArgs = { eventId: number; id: number };

export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (eventId: number, { rejectWithValue }) => {
  try {
    const [expRes, sumRes] = await Promise.all([
      apiClient.get<ApiResponse<Expense[]>>(`/events/${eventId}/expenses`),
      apiClient.get<ApiResponse<ExpenseSummary>>(`/events/${eventId}/expenses/summary`),
    ]);
    return { eventId, expenses: expRes.data.data, summary: sumRes.data.data };
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

export const createExpense = createAsyncThunk('expenses/create', async ({ eventId, data }: CreateExpenseArgs, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<ApiResponse<Expense>>(`/events/${eventId}/expenses`, data);
    return { eventId, expense: res.data.data };
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

export const updateExpense = createAsyncThunk('expenses/update', async ({ eventId, id, data }: UpdateExpenseArgs, { rejectWithValue }) => {
  try {
    const res = await apiClient.put<ApiResponse<Expense>>(`/events/${eventId}/expenses/${id}`, data);
    return { eventId, expense: res.data.data };
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

export const deleteExpense = createAsyncThunk('expenses/delete', async ({ eventId, id }: DeleteExpenseArgs, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/events/${eventId}/expenses/${id}`);
    return { eventId, id };
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

const initialState: ExpensesState = { byEventId: {}, summaryByEventId: {}, loading: false, error: null };

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => { state.loading = true; })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.byEventId[action.payload.eventId] = action.payload.expenses;
        state.summaryByEventId[action.payload.eventId] = action.payload.summary;
      })
      .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createExpense.fulfilled, (state, action) => {
        const eid = action.payload.eventId;
        if (!state.byEventId[eid]) state.byEventId[eid] = [];
        state.byEventId[eid].unshift(action.payload.expense);
      })
      .addCase(createExpense.rejected, (state, action) => { state.error = action.payload as string; })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const { eventId, expense } = action.payload;
        const list = state.byEventId[eventId] || [];
        const idx = list.findIndex(e => e.id === expense.id);
        if (idx !== -1) list[idx] = expense;
      })
      .addCase(updateExpense.rejected, (state, action) => { state.error = action.payload as string; })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        const { eventId, id } = action.payload;
        state.byEventId[eventId] = (state.byEventId[eventId] || []).filter(e => e.id !== id);
      })
      .addCase(deleteExpense.rejected, (state, action) => { state.error = action.payload as string; });
  },
});

export default expensesSlice.reducer;
