import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import { getApiError } from '../../lib/apiError';
import type { ApiResponse, Guest, GuestsState } from '../../types';

type GuestInput = Partial<Guest>;
type EventIdArg = number;
type MutateGuestArgs = { eventId: number; id: number; data: GuestInput };
type CreateGuestArgs = { eventId: number; data: GuestInput };
type DeleteGuestArgs = { eventId: number; id: number };
type BulkImportGuestsArgs = { eventId: number; guests: GuestInput[] };

export const fetchGuests = createAsyncThunk('guests/fetchAll', async (eventId: EventIdArg, { rejectWithValue }) => {
  try {
    const res = await apiClient.get<ApiResponse<Guest[]>>(`/events/${eventId}/guests`);
    return { eventId, guests: res.data.data };
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

export const createGuest = createAsyncThunk('guests/create', async ({ eventId, data }: CreateGuestArgs, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<ApiResponse<Guest>>(`/events/${eventId}/guests`, data);
    return res.data.data;
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

export const updateGuest = createAsyncThunk('guests/update', async ({ eventId, id, data }: MutateGuestArgs, { rejectWithValue }) => {
  try {
    const res = await apiClient.put<ApiResponse<Guest>>(`/events/${eventId}/guests/${id}`, data);
    return res.data.data;
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

export const deleteGuest = createAsyncThunk('guests/delete', async ({ eventId, id }: DeleteGuestArgs, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/events/${eventId}/guests/${id}`);
    return id;
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

export const bulkImportGuests = createAsyncThunk('guests/bulkImport', async ({ eventId, guests }: BulkImportGuestsArgs, { rejectWithValue }) => {
  try {
    const res = await apiClient.post<ApiResponse<{ count: number }>>(`/events/${eventId}/guests/bulk-import`, { guests });
    return { eventId, count: res.data.data.count };
  } catch (e) { return rejectWithValue(getApiError(e)); }
});

const initialState: GuestsState = { byEventId: {}, loading: false, error: null };

const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.byEventId[action.payload.eventId] = action.payload.guests;
      })
      .addCase(fetchGuests.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(createGuest.fulfilled, (state, action) => {
        const eid = action.payload.eventId;
        if (!state.byEventId[eid]) state.byEventId[eid] = [];
        state.byEventId[eid].push(action.payload);
      })
      .addCase(createGuest.rejected, (state, action) => { state.error = action.payload as string; })
      .addCase(updateGuest.fulfilled, (state, action) => {
        const eid = action.payload.eventId;
        const list = state.byEventId[eid] || [];
        const idx = list.findIndex(g => g.id === action.payload.id);
        if (idx !== -1) list[idx] = action.payload;
      })
      .addCase(updateGuest.rejected, (state, action) => { state.error = action.payload as string; })
      .addCase(deleteGuest.fulfilled, (state, action) => {
        Object.keys(state.byEventId).forEach(eid => {
          state.byEventId[Number(eid)] = (state.byEventId[Number(eid)] || []).filter(g => g.id !== action.payload);
        });
      })
      .addCase(deleteGuest.rejected, (state, action) => { state.error = action.payload as string; })
      .addCase(bulkImportGuests.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(bulkImportGuests.rejected, (state, action) => { state.error = action.payload as string; });
  },
});

export default guestsSlice.reducer;
