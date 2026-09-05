import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';

/**
 * Auth integration tests — require a reachable MongoDB.
 * Enable with: RUN_DB_TESTS=true MONGODB_URI_TEST=mongodb://127.0.0.1:27017/devtrace-test
 */
const enabled = process.env.RUN_DB_TESTS === 'true' && !!process.env.MONGODB_URI_TEST;
const d = it;

describe.skipIf(!enabled)('auth flow (DB required)', () => {
  let app: import('express').Express;

  beforeAll(async () => {
    process.env.MONGODB_URI = process.env.MONGODB_URI_TEST;
    process.env.JWT_SECRET = 'test-secret';
    const { connectDatabase } = await import('../src/config/db');
    await connectDatabase();
    const { createApp } = await import('../src/app');
    app = createApp();
  });

  afterAll(async () => {
    const mongoose = await import('mongoose');
    await mongoose.default.connection.dropDatabase();
    await mongoose.default.disconnect();
  });

  d('registers, logs in, and returns /me', async () => {
    const email = `t${Date.now()}@example.com`;
    const reg = await request(app).post('/api/auth/register').send({ email, password: 'Passw0rd1' });
    expect(reg.status).toBe(201);
    expect(reg.body.success).toBe(true);

    const login = await request(app).post('/api/auth/login').send({ email, password: 'Passw0rd1' });
    expect(login.status).toBe(200);

    const token = login.body.token;
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  d('rejects bad credentials with a uniform error', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'WrongPass1' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  d('rejects invalid registration payloads', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
