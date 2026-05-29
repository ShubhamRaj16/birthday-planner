import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from './slices/childrenSlice';
import eventsReducer from './slices/eventsSlice';
import remindersReducer from './slices/remindersSlice';

// Factory pattern: create a new store per SSR request to prevent state leaking
// between concurrent requests. The client reuses a single store instance.
export function createStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      children: childrenReducer,
      events: eventsReducer,
      reminders: remindersReducer,
    },
    preloadedState,
  });
}
