import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';

export const fetchExpenses = createAsyncThunk('expenses/fetchAll', async (eventId, { rejectWithValue }) => {
  try {
    const [expRes, sumRes] = await Promise.all([
      apiClient.get(`/events/${eventId}/expenses`),
      apiClient.get(`/events/${eventId}/expenses/summary`),
    ]);
    return { eventId, expenses: expRes.data.data, summary: sumRes.data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const createExpense = createAsyncThunk('expenses/create', async ({ eventId, data }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post(`/events/${eventId}/expenses`, data);
    return { eventId, expense: res.data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const updateExpense = createAsyncThunk('expenses/update', async ({ eventId, id, data }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/events/${eventId}/expenses/${id}`, data);
    return { eventId, expense: res.data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const deleteExpense = createAsyncThunk('expenses/delete', async ({ eventId, id }, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/events/${eventId}/expenses/${id}`);
    return { eventId, id };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: { byEventId: {}, summaryByEventId: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => { state.loading = true; })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.byEventId[action.payload.eventId] = action.payload.expenses;
        state.summaryByEventId[action.payload.eventId] = action.payload.summary;
      })
      .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createExpense.fulfilled, (state, action) => {
        const eid = action.payload.eventId;
        if (!state.byEventId[eid]) state.byEventId[eid] = [];
        state.byEventId[eid].unshift(action.payload.expense);
      })
      .addCase(createExpense.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const { eventId, expense } = action.payload;
        const list = state.byEventId[eventId] || [];
        const idx = list.findIndex(e => e.id === expense.id);
        if (idx !== -1) list[idx] = expense;
      })
      .addCase(updateExpense.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        const { eventId, id } = action.payload;
        state.byEventId[eventId] = (state.byEventId[eventId] || []).filter(e => e.id !== id);
      })
      .addCase(deleteExpense.rejected, (state, action) => { state.error = action.payload; });
  },
});

export default expensesSlice.reducer;
