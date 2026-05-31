import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';

export const fetchReminders = createAsyncThunk(
  'reminders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/reminders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'reminders/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/reminders/unread-count');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createReminder = createAsyncThunk(
  'reminders/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/reminders', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/reminders/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const markRead = createAsyncThunk(
  'reminders/markRead',
  async (ids, { rejectWithValue }) => {
    try {
      await apiClient.post('/reminders/mark-read', { ids });
      return ids;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const initialState = {
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
        state.error = action.payload;
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
        state.error = action.payload;
      })
      // deleteReminder
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteReminder.rejected, (state, action) => {
        state.error = action.payload;
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
        state.error = action.payload;
      });
  },
});

export default remindersSlice.reducer;
