import http from './http';
import type { ApiResponse } from '../types';

// ─── AI suggestions repository ────────────────────────────────────────────────

/** Request AI-generated suggestions of a given type for an event. */
export async function getSuggestions(eventId: number, type: string): Promise<string[]> {
  const res = await http.post<ApiResponse<{ suggestions: string[] }>>(
    `/events/${eventId}/ai/suggest`,
    { type }
  );
  return res.data?.data?.suggestions ?? [];
}

export const aiApi = { getSuggestions };
