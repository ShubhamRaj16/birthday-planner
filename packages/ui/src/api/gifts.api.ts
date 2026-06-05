import http from './http';
import type { ApiResponse, Gift } from '../types';

// ─── Gifts repository ─────────────────────────────────────────────────────────
// Standard gift CRUD still lives in giftsSlice; this covers the one-off create
// used by the AI-suggestion "save" action. Phase 2 consolidates both paths.

/** Create a gift for an event (e.g. saving an AI suggestion). */
export async function createGift(
  eventId: number,
  data: { name: string; source?: string }
): Promise<Gift> {
  const res = await http.post<ApiResponse<Gift>>(`/events/${eventId}/gifts`, data);
  return res.data.data;
}

export const giftsApi = { createGift };
