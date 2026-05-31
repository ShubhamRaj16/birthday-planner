import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from '../redux/store';

export function renderWithStore(component, preloadedState = {}) {
  const store = createStore(preloadedState);
  const result = render(<Provider store={store}>{component}</Provider>);
  return { ...result, store };
}
