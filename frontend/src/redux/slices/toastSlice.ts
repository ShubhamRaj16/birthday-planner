import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

export interface ToastState {
  items: Toast[];
}

const MAX_TOASTS = 3;
let _seq = 0;

const initialState: ToastState = { items: [] };

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items.push(action.payload);
        // Keep only the most recent MAX_TOASTS
        if (state.items.length > MAX_TOASTS) {
          state.items = state.items.slice(-MAX_TOASTS);
        }
      },
      prepare(message: string, variant: ToastVariant = 'info') {
        return { payload: { id: ++_seq, message, variant } };
      },
    },
    removeToast(state, action: PayloadAction<number>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
