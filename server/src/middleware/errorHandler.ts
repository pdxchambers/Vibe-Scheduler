import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  if (!env.isProduction) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(500).json({
    error: env.isProduction ? 'Internal server error' : message,
  });
}
