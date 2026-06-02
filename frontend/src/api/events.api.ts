import http from './http';
import type { ApiResponse, Event } from '../types';

// ─── Events repository (transport seam) ───────────────────────────────────────
// Non-CRUD event endpoints that don't belong in a thunk. Standard CRUD stays in
// eventsSlice for now; Phase 2 migrates those thunks to call this module too.

/** Upload (or replace) the invite-card image for an event. */
export async function uploadInviteCard(eventId: number, file: File): Promise<Event> {
  const formData = new FormData();
  formData.append('card', file);
  const res = await http.post<ApiResponse<Event>>(`/events/${eventId}/invite-card`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export const eventsApi = { uploadInviteCard };
