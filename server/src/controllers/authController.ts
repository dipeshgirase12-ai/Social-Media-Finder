import type { Request, Response } from 'express';
import { User, hashPassword, initialRoleFor } from '../models/User';
import { signToken } from '../middleware/auth';
import { parseBody, registerSchema, loginSchema } from '../validation/schemas';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const COOKIE_NAME = 'devtrace_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
}

export const authController = {
  /** POST /api/auth/register */
  async register(req: Request, res: Response): Promise<void> {
    const data = parseBody(registerSchema, req.body);

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw ApiError.badRequest('EMAIL_IN_USE', 'An account with this email already exists.');
    }

    const user = await User.create({
      email: data.email.toLowerCase(),
      passwordHash: await hashPassword(data.password),
      name: data.name,
      role: initialRoleFor(data.email),
    });

    const token = signToken({ sub: String(user._id), role: user.role, email: user.email });
    setAuthCookie(res, token);
    res.status(201).json({ success: true, token, user: user.toPublicUser() });
  },

  /** POST /api/auth/login */
  async login(req: Request, res: Response): Promise<void> {
    const data = parseBody(loginSchema, req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() });

    // Constant-shape failure to avoid user enumeration.
    if (!user || !(await user.comparePassword(data.password))) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = signToken({ sub: String(user._id), role: user.role, email: user.email });
    setAuthCookie(res, token);
    logger.info('User logged in', { userId: String(user._id) });
    res.json({ success: true, token, user: user.toPublicUser() });
  },

  /** POST /api/auth/logout */
  async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: env.isProd });
    res.json({ success: true, message: 'Signed out.' });
  },

  /** GET /api/auth/me */
  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const user = await User.findById(req.user.sub);
    if (!user) throw ApiError.unauthorized();
    res.json({ success: true, user: user.toPublicUser() });
  },
};
