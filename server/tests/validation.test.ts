import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, searchSchema, repoParam, websiteAnalyzeQuery } from '../src/validation/schemas';

describe('validation schemas', () => {
  it('accepts valid registration payloads', () => {
    const ok = registerSchema.safeParse({ email: 'a@b.com', password: 'Passw0rd1', name: 'A' });
    expect(ok.success).toBe(true);
  });

  it('rejects weak passwords', () => {
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false);
    expect(registerSchema.safeParse({ email: 'a@b.com', password: 'onlyletters123' }).success).toBe(true);
    expect(registerSchema.safeParse({ email: 'a@b.com', password: '12345678' }).success).toBe(false);
  });

  it('rejects invalid emails', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'x' }).success).toBe(false);
  });

  it('enforces search query bounds', () => {
    expect(searchSchema.safeParse({ query: 'a' }).success).toBe(false);
    expect(searchSchema.safeParse({ query: 'ab' }).success).toBe(true);
    expect(searchSchema.safeParse({ query: 'x'.repeat(101) }).success).toBe(false);
  });

  it('validates repository params', () => {
    expect(repoParam.safeParse({ owner: 'octocat', repo: 'hello-world' }).success).toBe(true);
    expect(repoParam.safeParse({ owner: 'bad owner!', repo: 'x' }).success).toBe(false);
  });

  it('validates website analyze url presence', () => {
    expect(websiteAnalyzeQuery.safeParse({ url: 'https://example.dev' }).success).toBe(true);
    expect(websiteAnalyzeQuery.safeParse({}).success).toBe(false);
  });
});
