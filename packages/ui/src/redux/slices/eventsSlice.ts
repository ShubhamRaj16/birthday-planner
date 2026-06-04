import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import { getApiError } from '../../lib/apiError';
import type { ApiResponse, Event, EventsState } from '../../types';

type EventInput = Partial<Event>;
type UpdateEventArgs = { id: number; data: EventInput };

export const fetchEvents = createAsyncThunk('events/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiResponse<Event[]>>('/events');
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const fetchEvent = createAsyncThunk(
  'events/fetchOne',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Event>>(`/events/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const fetchUpcoming = createAsyncThunk(
  'events/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Event[]>>('/events/upcoming');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (data: EventInput, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Event>>('/events', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, data }: UpdateEventArgs, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiResponse<Event>>(`/events/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/events/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const activateEvent = createAsyncThunk(
  'events/activate',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Event>>(`/events/${id}/activate`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

const initialState: EventsState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchEvents
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchEvent
      .addCase(fetchEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchUpcoming — populates items with upcoming events
      .addCase(fetchUpcoming.fulfilled, (state, action) => {
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      // createEvent
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateEvent
      .addCase(updateEvent.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // deleteEvent
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // activateEvent
      .addCase(activateEvent.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(activateEvent.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default eventsSlice.reducer;
