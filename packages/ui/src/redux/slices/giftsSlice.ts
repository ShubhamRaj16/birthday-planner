import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import { getApiError } from '../../lib/apiError';
import type { ApiResponse, Gift, GiftsState } from '../../types';

type GiftInput = Partial<Gift>;
type CreateGiftArgs = { eventId: number; data: GiftInput };
type UpdateGiftArgs = { eventId: number; id: number; data: GiftInput };
type DeleteGiftArgs = { eventId: number; id: number };

export const fetchGifts = createAsyncThunk(
  'gifts/fetchAll',
  async (eventId: number, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<ApiResponse<Gift[]>>(`/events/${eventId}/gifts`);
      return { eventId, gifts: res.data.data };
    } catch (e) {
      return rejectWithValue(getApiError(e));
    }
  }
);

export const createGift = createAsyncThunk(
  'gifts/create',
  async ({ eventId, data }: CreateGiftArgs, { rejectWithValue }) => {
    try {
      const res = await apiClient.post<ApiResponse<Gift>>(`/events/${eventId}/gifts`, data);
      return { eventId, gift: res.data.data };
    } catch (e) {
      return rejectWithValue(getApiError(e));
    }
  }
);

export const updateGift = createAsyncThunk(
  'gifts/update',
  async ({ eventId, id, data }: UpdateGiftArgs, { rejectWithValue }) => {
    try {
      const res = await apiClient.put<ApiResponse<Gift>>(`/events/${eventId}/gifts/${id}`, data);
      return { eventId, gift: res.data.data };
    } catch (e) {
      return rejectWithValue(getApiError(e));
    }
  }
);

export const deleteGift = createAsyncThunk(
  'gifts/delete',
  async ({ eventId, id }: DeleteGiftArgs, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/events/${eventId}/gifts/${id}`);
      return { eventId, id };
    } catch (e) {
      return rejectWithValue(getApiError(e));
    }
  }
);

const initialState: GiftsState = { byEventId: {}, loading: false, error: null };

const giftsSlice = createSlice({
  name: 'gifts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGifts.fulfilled, (state, action) => {
        state.byEventId[action.payload.eventId] = action.payload.gifts;
      })
      .addCase(fetchGifts.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(createGift.fulfilled, (state, action) => {
        const eid = action.payload.eventId;
        if (!state.byEventId[eid]) state.byEventId[eid] = [];
        state.byEventId[eid].unshift(action.payload.gift);
      })
      .addCase(createGift.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateGift.fulfilled, (state, action) => {
        const { eventId, gift } = action.payload;
        const list = state.byEventId[eventId] || [];
        const idx = list.findIndex((g) => g.id === gift.id);
        if (idx !== -1) list[idx] = gift;
      })
      .addCase(updateGift.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteGift.fulfilled, (state, action) => {
        const { eventId, id } = action.payload;
        state.byEventId[eventId] = (state.byEventId[eventId] || []).filter((g) => g.id !== id);
      })
      .addCase(deleteGift.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default giftsSlice.reducer;
