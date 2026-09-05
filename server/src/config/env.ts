import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(name: string, fallback = false): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return raw.toLowerCase() === 'true';
}

/** Central, typed access to environment configuration. */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: num('PORT', 5000),
  isProd: process.env.NODE_ENV === 'production',

  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/devtrace'),

  jwtSecret: required('JWT_SECRET', 'devtrace-dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',

  githubToken: process.env.GITHUB_TOKEN || undefined,
  gitlabToken: process.env.GITLAB_TOKEN || undefined,
  npmApiUrl: process.env.NPM_API_URL ?? 'https://registry.npmjs.org',

  rateLimits: {
    search: num('SEARCH_RATE_LIMIT', 20),
    searchWindowMin: num('SEARCH_RATE_WINDOW_MINUTES', 15),
    auth: num('AUTH_RATE_LIMIT', 10),
    api: num('API_RATE_LIMIT', 60),
    website: num('WEBSITE_RATE_LIMIT', 10),
  },

  cache: {
    profileTtlSec: num('CACHE_TTL_SECONDS', 600),
    websiteTtlSec: num('WEBSITE_CACHE_TTL_SECONDS', 1800),
  },

  demoMode: bool('DEMO_MODE', false),

  adminEmails: (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
};
