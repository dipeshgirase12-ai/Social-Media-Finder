import { z } from 'zod';
import { ApiError } from '../utils/apiError';

export const registerSchema = z.object({
  email: z.string().trim().email('A valid email is required.').max(254),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password is too long.')
    .regex(/[a-zA-Z]/, 'Password must contain a letter.')
    .regex(/[0-9]/, 'Password must contain a number.'),
  name: z.string().trim().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('A valid email is required.').max(254),
  password: z.string().min(1, 'Password is required.').max(128),
});

export const searchSchema = z.object({
  query: z.string().trim().min(2, 'Query must be at least 2 characters.').max(100, 'Query is too long.'),
});

export const githubUsersQuery = z.object({
  q: z.string().trim().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export const usernameParam = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/, 'Invalid username format.'),
});

export const gitlabUsernameParam = z.object({
  username: z.string().trim().regex(/^[A-Za-z0-9_.-]{1,64}$/, 'Invalid username format.'),
});

export const repoParam = z.object({
  owner: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/, 'Invalid owner.'),
  repo: z.string().trim().regex(/^[A-Za-z0-9._-]{1,100}$/, 'Invalid repository name.'),
});

export const npmSearchQuery = z.object({
  q: z.string().trim().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export const websiteAnalyzeQuery = z.object({
  url: z.string().trim().min(4).max(2048),
});

export const saveProfileSchema = z.object({
  platform: z.enum(['github', 'gitlab', 'npm', 'linkedin', 'instagram', 'x', 'medium', 'devpost', 'website']),
  username: z.string().trim().min(1).max(100),
  displayName: z.string().trim().max(200).optional(),
  avatarUrl: z.string().url().max(2048).optional(),
  profileUrl: z.string().trim().url('Profile URL is required.').max(2048),
  bio: z.string().max(1000).optional(),
  confidence: z.number().min(0).max(100).optional(),
});

export const exportQuery = z.object({
  format: z.enum(['json', 'csv']).default('json'),
});

/** Parse a request body against a schema; throws ApiError on failure. */
export function parseBody<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    throw ApiError.badRequest('VALIDATION_ERROR', first?.message ?? 'Invalid input.');
  }
  return result.data;
}

export function parseQuery<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  return parseBody(schema, data);
}
