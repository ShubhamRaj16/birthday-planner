import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactElement } from 'react';
import { createStore, type PreloadedState } from '../redux/store';

export function renderWithStore(component: ReactElement, preloadedState: PreloadedState = {}) {
  const store = createStore(preloadedState);
  const result = render(<Provider store={store}>{component}</Provider>);
  return { ...result, store };
}
