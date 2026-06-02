import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global axios mock — no real API calls in frontend tests
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  // Named export used by lib/apiError.ts. Detects AxiosError by its flag so
  // getApiError() works under the mock instead of throwing "isAxiosError is not a function".
  isAxiosError: (e) => Boolean(e && e.isAxiosError),
}));
