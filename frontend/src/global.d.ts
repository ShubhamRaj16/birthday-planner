import type { PreloadedState } from './redux/store';

declare global {
  interface Window {
    __INITIAL_STATE__?: PreloadedState;
  }
}

export {};
