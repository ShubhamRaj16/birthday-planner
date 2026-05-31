import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';

export const fetchPhotos = createAsyncThunk('photos/fetchPhotos', async (eventId) => {
  const res = await apiClient.get(`/events/${eventId}/photos`);
  return { eventId, photos: res.data.data };
});

export const uploadPhoto = createAsyncThunk('photos/uploadPhoto', async ({ eventId, formData }) => {
  const res = await apiClient.post(`/events/${eventId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { eventId, photo: res.data.data };
});

export const updatePhoto = createAsyncThunk('photos/updatePhoto', async ({ eventId, photoId, data }) => {
  const res = await apiClient.put(`/events/${eventId}/photos/${photoId}`, data);
  return { eventId, photo: res.data.data };
});

export const deletePhoto = createAsyncThunk('photos/deletePhoto', async ({ eventId, photoId }) => {
  await apiClient.delete(`/events/${eventId}/photos/${photoId}`);
  return { eventId, photoId };
});

const photosSlice = createSlice({
  name: 'photos',
  initialState: {
    // byEventId: { [eventId]: Photo[] }
    byEventId: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotos.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.byEventId[action.payload.eventId] = action.payload.photos;
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(uploadPhoto.fulfilled, (state, action) => {
        const { eventId, photo } = action.payload;
        if (!state.byEventId[eventId]) state.byEventId[eventId] = [];
        state.byEventId[eventId].push(photo);
      })
      .addCase(uploadPhoto.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(updatePhoto.fulfilled, (state, action) => {
        const { eventId, photo } = action.payload;
        const list = state.byEventId[eventId] || [];
        const idx = list.findIndex((p) => p.id === photo.id);
        if (idx !== -1) {
          // If setting cover, clear other covers
          if (photo.isCover) list.forEach((p) => { p.isCover = false; });
          list[idx] = photo;
        }
      })
      .addCase(updatePhoto.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        const { eventId, photoId } = action.payload;
        if (state.byEventId[eventId]) {
          state.byEventId[eventId] = state.byEventId[eventId].filter((p) => p.id !== photoId);
        }
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default photosSlice.reducer;
