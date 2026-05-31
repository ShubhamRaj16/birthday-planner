import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../lib/apiClient';
import { getApiError } from '../../lib/apiError';
import type { ApiResponse, Child, ChildrenState } from '../../types';

type UpdateChildArgs = { id: number; data: Partial<Child> | FormData };

export const fetchChildren = createAsyncThunk(
  'children/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse<Child[]>>('/children');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const createChild = createAsyncThunk(
  'children/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiResponse<Child>>('/children', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const updateChild = createAsyncThunk(
  'children/update',
  async ({ id, data }: UpdateChildArgs, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiResponse<Child>>(`/children/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

export const deleteChild = createAsyncThunk(
  'children/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/children/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  }
);

const initialState: ChildrenState = {
  items: [],
  current: null,
  loading: false,
  error: null,
};

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchChildren
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createChild
      .addCase(createChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChild.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // updateChild
      .addCase(updateChild.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateChild.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // deleteChild
      .addCase(deleteChild.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteChild.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default childrenSlice.reducer;
