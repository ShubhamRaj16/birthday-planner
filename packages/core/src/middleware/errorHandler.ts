import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  code?: string;
  status?: number;
  statusCode?: number;
}

export default function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err.code === 'P2025') {
    res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'Record not found' },
      meta: {},
    });
    return;
  }

  if (err.code === 'P2003') {
    res.status(409).json({
      data: null,
      error: { code: 'CONFLICT', message: 'Cannot delete — related records exist' },
      meta: {},
    });
    return;
  }

  const status = err.status ?? err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = err.message ?? 'An unexpected error occurred';

  res.status(status).json({ data: null, error: { code, message }, meta: {} });
}
