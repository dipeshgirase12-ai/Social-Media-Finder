import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/** 404 handler for unmatched API routes. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `No route matches ${req.method} ${req.path}` },
  });
}

/**
 * Central error handler. Never leaks raw backend errors in production.
 * Responds in the shape: { success, error: { code, message } }.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ success: false, error: { code: err.code, message: err.message } });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input data.' },
    });
    return;
  }

  // Zod errors
  if (typeof err === 'object' && err !== null && 'issues' in err) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input data.' },
    });
    return;
  }

  logger.error('Unhandled error', {
    message: err instanceof Error ? err.message : String(err),
    stack: env.isProd ? undefined : err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again later.' },
  });
}
