import type { Request, Response, NextFunction, RequestHandler } from 'express';

// ─── asyncHandler ─────────────────────────────────────────────────────────────
// Wraps an async route handler so a rejected promise is forwarded to Express's
// error middleware (errorHandler) automatically. Removes the per-handler
// try/catch → next(e) boilerplate repeated across every route.
//
// Generic over the request type so handlers needing an augmented request
// (e.g. MulterRequest) stay type-safe: asyncHandler<MulterRequest>(...).

export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
}
