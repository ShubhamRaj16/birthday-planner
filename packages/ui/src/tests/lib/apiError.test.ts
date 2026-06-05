import { describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';
import { getApiError } from '../../lib/apiError';

// setup.ts globally mocks axios (to block real HTTP), but apiError.ts relies on
// the real isAxiosError + AxiosError. Use the actual module for this file only.
vi.mock('axios', async (importOriginal) => await importOriginal());

describe('getApiError', () => {
  it('extracts message from envelope error object', () => {
    const err = new AxiosError('req failed');
    err.response = { data: { error: { code: 'X', message: 'boom' } } } as never;
    expect(getApiError(err)).toBe('boom');
  });

  it('returns string error body as-is', () => {
    const err = new AxiosError('req failed');
    err.response = { data: { error: 'plain string error' } } as never;
    expect(getApiError(err)).toBe('plain string error');
  });

  it('falls back to axios message when no response error', () => {
    const err = new AxiosError('network down');
    expect(getApiError(err)).toBe('network down');
  });

  it('handles a plain Error', () => {
    expect(getApiError(new Error('generic'))).toBe('generic');
  });

  it('handles a non-error value', () => {
    expect(getApiError('weird')).toBe('Unknown error');
  });
});
