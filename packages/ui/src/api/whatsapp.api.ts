import http from './http';
import type { ApiResponse } from '../types';

// ─── WhatsApp repository ──────────────────────────────────────────────────────
// Typed transport for the wa.me invite flow. Replaces the raw apiClient calls
// that previously lived inside InviteFlow (DIP). UI depends on these functions,
// not on axios.

/** Fetch the default message template the backend ships with. */
export async function fetchDefaultTemplate(): Promise<string | null> {
  const res = await http.get<ApiResponse<{ template: string }>>('/whatsapp/default-template');
  return res.data?.data?.template ?? null;
}

/** Render a sample message for a single event/template (placeholder preview). */
export async function previewMessage(eventId: number, template: string): Promise<string> {
  const res = await http.post<ApiResponse<{ message: string }>>('/whatsapp/preview', {
    eventId,
    template,
  });
  return res.data?.data?.message ?? '';
}

/** Build a personalised wa.me deep link for one guest. */
export async function buildLink(eventId: number, guestId: number): Promise<string | null> {
  const res = await http.post<ApiResponse<{ link: string }>>('/whatsapp/link', {
    eventId,
    guestId,
  });
  return res.data?.data?.link ?? null;
}

export const whatsappApi = { fetchDefaultTemplate, previewMessage, buildLink };
