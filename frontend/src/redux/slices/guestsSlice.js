import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';

export const fetchGuests = createAsyncThunk('guests/fetchAll', async (eventId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/events/${eventId}/guests`);
    return { eventId, guests: res.data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const createGuest = createAsyncThunk('guests/create', async ({ eventId, data }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post(`/events/${eventId}/guests`, data);
    return res.data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const updateGuest = createAsyncThunk('guests/update', async ({ eventId, id, data }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/events/${eventId}/guests/${id}`, data);
    return res.data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const deleteGuest = createAsyncThunk('guests/delete', async ({ eventId, id }, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/events/${eventId}/guests/${id}`);
    return id;
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const bulkImportGuests = createAsyncThunk('guests/bulkImport', async ({ eventId, guests }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post(`/events/${eventId}/guests/bulk-import`, { guests });
    return { eventId, count: res.data.data.count };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

const guestsSlice = createSlice({
  name: 'guests',
  initialState: { byEventId: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.byEventId[action.payload.eventId] = action.payload.guests;
      })
      .addCase(fetchGuests.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createGuest.fulfilled, (state, action) => {
        const eid = action.payload.eventId;
        if (!state.byEventId[eid]) state.byEventId[eid] = [];
        state.byEventId[eid].push(action.payload);
      })
      .addCase(updateGuest.fulfilled, (state, action) => {
        const eid = action.payload.eventId;
        const list = state.byEventId[eid] || [];
        const idx = list.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) list[idx] = action.payload;
      })
      .addCase(deleteGuest.fulfilled, (state, action) => {
        Object.keys(state.byEventId).forEach(eid => {
          state.byEventId[eid] = (state.byEventId[eid] || []).filter(g => g.id !== action.payload);
        });
      })
      .addCase(bulkImportGuests.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export default guestsSlice.reducer;
