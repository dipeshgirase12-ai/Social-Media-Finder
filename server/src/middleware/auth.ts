import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

export interface AuthPayload {
  sub: string;
  role: 'user' | 'admin';
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as never });
}

/** Extract JWT from httpOnly cookie or Authorization header. */
function readToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
  return cookies?.['devtrace_token'];
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = readToken(req);
    if (token) req.user = jwt.verify(token, env.jwtSecret) as AuthPayload;
  } catch {
    // Invalid/expired token on an optional route — continue anonymously.
  }
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthPayload;
    next();
  } catch {
    next(ApiError.unauthorized('Session expired. Please sign in again.'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    if (payload.role !== 'admin') return next(ApiError.forbidden('Admin access required.'));
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Session expired. Please sign in again.'));
  }
}
