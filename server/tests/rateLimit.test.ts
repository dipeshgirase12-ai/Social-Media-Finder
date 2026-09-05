import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import rateLimit from 'express-rate-limit';

/**
 * Rate-limit behaviour test (no DB needed).
 * DB-dependent auth tests run only when RUN_DB_TESTS=true and a test
 * MONGODB_URI is configured — see auth.db.test.ts.
 */
describe('rate limiting', () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 2, standardHeaders: true, legacyHeaders: false });
  const app = express();
  app.use(limiter);
  app.get('/ping', (_req, res) => res.json({ ok: true }));

  it('allows requests under the limit and blocks beyond it', async () => {
    const r1 = await request(app).get('/ping');
    expect(r1.status).toBe(200);

    const r2 = await request(app).get('/ping');
    expect(r2.status).toBe(200);

    const r3 = await request(app).get('/ping');
    expect(r3.status).toBe(429);
    expect(r3.body).toBeTruthy();
  });
});

describe('API contract (error shape)', () => {
  beforeAll(() => {
    // no-op — kept for symmetry
  });
  afterAll(() => {
    // no-op
  });

  it('rejects oversized JSON bodies with a controlled error', async () => {
    const app = express();
    app.use(express.json({ limit: '100 bytes' }));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(413).json({ success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body too large.' } });
    });

    const res = await request(app)
      .post('/x')
      .set('Content-Type', 'application/json')
      .send({ data: 'x'.repeat(500) });
    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
  });
});
