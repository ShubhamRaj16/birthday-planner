import type { Response } from 'express';

// ─── Response envelope (single source of truth) ──────────────────────────────
// Every handler responds through these helpers so the { data, error, meta }
// shape is defined exactly once instead of being re-typed in ~40 route handlers.

type Meta = Record<string, unknown>;

/** Success envelope: { data, error: null, meta }. */
export function sendOk<T>(res: Response, data: T, meta: Meta = {}, status = 200): void {
  res.status(status).json({ data, error: null, meta });
}

/** Error envelope: { data: null, error: { code, message }, meta }. */
export function sendErr(
  res: Response,
  status: number,
  code: string,
  message: string,
  meta: Meta = {},
): void {
  res.status(status).json({ data: null, error: { code, message }, meta });
}
