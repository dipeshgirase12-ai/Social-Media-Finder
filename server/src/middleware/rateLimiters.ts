import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const standard = (windowMinutes: number, max: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message } },
  });

export const authLimiter = standard(
  15,
  env.rateLimits.auth,
  'Too many authentication attempts. Please try again later.'
);

export const searchLimiter = standard(
  env.rateLimits.searchWindowMin,
  env.rateLimits.search,
  `Search limit of ${env.rateLimits.search} requests per ${env.rateLimits.searchWindowMin} minutes reached.`
);

export const apiLimiter = standard(
  15,
  env.rateLimits.api,
  'API rate limit reached. Please slow down.'
);

export const websiteLimiter = standard(
  15,
  env.rateLimits.website,
  'Website analysis limit reached. Please try again later.'
);
