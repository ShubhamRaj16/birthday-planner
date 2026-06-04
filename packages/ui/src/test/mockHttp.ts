import { vi } from 'vitest';

/** A vi-mocked stand-in for the api/http axios instance. */
export function makeHttpMock() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
}

/** Wrap a value in the { data: { data, error, meta } } axios+envelope shape. */
export function ok<T>(data: T) {
  return { data: { data, error: null, meta: {} } };
}
