import type { RequestHandler } from 'express';

/** Forward rejected async controller promises to Express' error middleware. */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}