import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import { getApiError } from '../../lib/apiError';
import type { ApiResponse, Reminder, RemindersState } from '../../types';

type ReminderInput = Partial<Reminder>;

export const fetchReminders = createAsyncThunk(
  'reminders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Reminder[]>>('/reminders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'reminders/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<number | { count: number }>>('/reminders/unread-count');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const createReminder = createAsyncThunk(
  'reminders/create',
  async (data: ReminderInput, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Reminder>>('/reminders', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/reminders/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const markRead = createAsyncThunk(
  'reminders/markRead',
  async (ids: number[], { rejectWithValue }) => {
    try {
      await apiClient.post('/reminders/mark-read', { ids });
      return ids;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

const initialState: RemindersState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchReminders
      .addCase(fetchReminders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount =
          typeof action.payload === 'number'
            ? action.payload
            : action.payload?.count ?? 0;
      })
      // createReminder
      .addCase(createReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReminder.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // deleteReminder
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteReminder.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // markRead — update fired status for affected IDs, decrement unreadCount
      .addCase(markRead.fulfilled, (state, action) => {
        const ids = new Set(action.payload);
        state.items = state.items.map((r) =>
          ids.has(r.id) ? { ...r, fired: true } : r
        );
        state.unreadCount = Math.max(0, state.unreadCount - ids.size);
      })
      .addCase(markRead.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default remindersSlice.reducer;
