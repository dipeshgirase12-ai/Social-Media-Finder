import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

let counter = 0;

/** Structured request logging: requestId, endpoint, duration, status. */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = `req_${Date.now().toString(36)}_${(counter++).toString(36)}`;
  const start = Date.now();
  res.setHeader('X-Request-Id', requestId);
  res.on('finish', () => {
    logger.info('request', {
      requestId,
      endpoint: `${req.method} ${req.originalUrl.split('?')[0]}`,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
}
