import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createStore, App, createClientRoutes } from '@birthday-planner/ui';
import './errorHandler';

// apps/web — thin client shell. All UI lives in @birthday-planner/ui; this entry
// only wires the store + router and mounts into the DOM. SSR was removed in
// Phase 7 (SCRUM-66): the app boots entirely in the browser.
const store = createStore();

const rootEl = document.getElementById('root');

async function mountApp(): Promise<void> {
  if (!rootEl) return;

  const routes = await createClientRoutes();

  createRoot(rootEl).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App routes={routes} />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>,
  );
}

void mountApp();
