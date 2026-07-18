import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export interface AuthTokenPayload {
  id: string;
  email: string;
}

function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }
  return req.cookies?.[env.authCookieName];
}

/** Requires a valid auth token; rejects the request with 401 if missing/invalid. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired session'));
  }
}

/** Attaches the user if a valid token is present, but doesn't require one. */
export function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    req.user = { id: payload.id, email: payload.email };
  } catch {
    // Ignore invalid tokens for optional-auth routes
  }
  next();
}
