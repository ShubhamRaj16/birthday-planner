import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createStore, type PreloadedState } from '../redux/store';
import App from '../App';
import './errorHandler';

// Hydrate the SSR-rendered markup. Initial Redux state is injected by the server
// into window.__INITIAL_STATE__ so client and server render the same tree.
const preloadedState: PreloadedState = window.__INITIAL_STATE__ ?? {};
const store = createStore(preloadedState);

const rootEl = document.getElementById('root');
if (rootEl) {
  hydrateRoot(
    rootEl,
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>,
  );
}
