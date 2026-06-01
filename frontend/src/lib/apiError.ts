import { isAxiosError } from 'axios';

/** Extract a human-readable message from an unknown thunk error. */
export function getApiError(e: unknown): string {
  if (isAxiosError(e)) {
    const apiErr = e.response?.data?.error;
    if (typeof apiErr === 'string') return apiErr;
    if (apiErr && typeof apiErr === 'object' && 'message' in apiErr) {
      return String((apiErr as { message: unknown }).message);
    }
    return e.message;
  }
  if (e instanceof Error) return e.message;
  return 'Unknown error';
}
