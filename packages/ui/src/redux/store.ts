import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from './slices/childrenSlice';
import eventsReducer from './slices/eventsSlice';
import remindersReducer from './slices/remindersSlice';
import guestsReducer from './slices/guestsSlice';
import expensesReducer from './slices/expensesSlice';
import giftsReducer from './slices/giftsSlice';
import photosReducer from './slices/photosSlice';
import toastReducer from './slices/toastSlice';
import type { RootState } from '../types';

export type PreloadedState = Partial<RootState>;

// Factory pattern: create a new store per SSR request to prevent state leaking
// between concurrent requests. The client reuses a single store instance.
export function createStore(preloadedState: PreloadedState = {}) {
  return configureStore({
    reducer: {
      children: childrenReducer,
      events: eventsReducer,
      reminders: remindersReducer,
      guests: guestsReducer,
      expenses: expensesReducer,
      gifts: giftsReducer,
      photos: photosReducer,
      toast: toastReducer,
    },
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
