import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';

export const fetchGifts = createAsyncThunk('gifts/fetchAll', async (eventId, { rejectWithValue }) => {
  try {
    const res = await apiClient.get(`/events/${eventId}/gifts`);
    return { eventId, gifts: res.data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const createGift = createAsyncThunk('gifts/create', async ({ eventId, data }, { rejectWithValue }) => {
  try {
    const res = await apiClient.post(`/events/${eventId}/gifts`, data);
    return { eventId, gift: res.data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const updateGift = createAsyncThunk('gifts/update', async ({ eventId, id, data }, { rejectWithValue }) => {
  try {
    const res = await apiClient.put(`/events/${eventId}/gifts/${id}`, data);
    return { eventId, gift: res.data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

export const deleteGift = createAsyncThunk('gifts/delete', async ({ eventId, id }, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/events/${eventId}/gifts/${id}`);
    return { eventId, id };
  } catch (e) { return rejectWithValue(e.response?.data?.error || e.message); }
});

const giftsSlice = createSlice({
  name: 'gifts',
  initialState: { byEventId: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGifts.fulfilled, (state, action) => {
        state.byEventId[action.payload.eventId] = action.payload.gifts;
      })
      .addCase(createGift.fulfilled, (state, action) => {
        const eid = action.payload.eventId;
        if (!state.byEventId[eid]) state.byEventId[eid] = [];
        state.byEventId[eid].unshift(action.payload.gift);
      })
      .addCase(updateGift.fulfilled, (state, action) => {
        const { eventId, gift } = action.payload;
        const list = state.byEventId[eventId] || [];
        const idx = list.findIndex(g => g.id === gift.id);
        if (idx !== -1) list[idx] = gift;
      })
      .addCase(deleteGift.fulfilled, (state, action) => {
        const { eventId, id } = action.payload;
        state.byEventId[eventId] = (state.byEventId[eventId] || []).filter(g => g.id !== id);
      });
  },
});

export default giftsSlice.reducer;
