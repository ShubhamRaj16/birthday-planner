import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { StyleSheetManager } from 'styled-components';
import { configureStore } from '@reduxjs/toolkit';
import childrenReducer from '../redux/slices/childrenSlice';
import eventsReducer from '../redux/slices/eventsSlice';
import remindersReducer from '../redux/slices/remindersSlice';
import guestsReducer from '../redux/slices/guestsSlice';
import expensesReducer from '../redux/slices/expensesSlice';
import giftsReducer from '../redux/slices/giftsSlice';
import photosReducer from '../redux/slices/photosSlice';
import App from '../App';
import { createClientRoutes } from '../routes/clientRoutes';
import './index.css';
import './errorHandler';

// Create store with initial state from server
const initialState = window.__INITIAL_STATE__ || {};
const store = configureStore({
  reducer: {
    children: childrenReducer,
    events: eventsReducer,
    reminders: remindersReducer,
    guests: guestsReducer,
    expenses: expensesReducer,
    gifts: giftsReducer,
    // Also update src/redux/store.js when adding slices here — both must stay in sync
    photos: photosReducer,
  },
  preloadedState: initialState,
});

async function hydrateApp() {
  const routes = await createClientRoutes(window.location.pathname);

  ReactDOM.hydrateRoot(
    document.getElementById('root'),
    <React.StrictMode>
      <Provider store={store}>
        <Router>
          <StyleSheetManager>
            <App routes={routes} />
          </StyleSheetManager>
        </Router>
      </Provider>
    </React.StrictMode>
  );
}

hydrateApp();
