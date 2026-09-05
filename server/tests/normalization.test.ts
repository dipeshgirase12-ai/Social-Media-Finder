import { describe, it, expect } from 'vitest';
import { normalizeQuery, normalizeUsername, extractDomain } from '../src/utils/normalize';
import { jaroWinkler, nameSimilarity, usernameSimilarity } from '../src/utils/similarity';
import { ApiError } from '../src/utils/apiError';

describe('query normalization', () => {
  it('classifies GitHub URLs and extracts the username', () => {
    for (const q of ['github.com/rahulsharma', 'https://github.com/rahulsharma', 'www.github.com/rahulsharma/']) {
      const n = normalizeQuery(q);
      expect(n.queryType).toBe('GITHUB_URL');
      expect(n.githubUsername).toBe('rahulsharma');
    }
  });

  it('classifies plain usernames', () => {
    expect(normalizeQuery('rahulsharma').queryType).toBe('USERNAME');
    expect(normalizeQuery('@rahul_dev').term).toBe('rahul_dev');
  });

  it('classifies full names', () => {
    const n = normalizeQuery('Rahul Sharma');
    expect(n.queryType).toBe('NAME');
    expect(n.term).toBe('Rahul Sharma');
  });

  it('classifies website URLs', () => {
    const n = normalizeQuery('rahulsharma.dev');
    expect(n.queryType).toBe('WEBSITE_URL');
    expect(n.websiteUrl).toContain('https://');
  });

  it('rejects email-based identity search', () => {
    expect(() => normalizeQuery('someone@example.com')).toThrowError(ApiError);
  });

  it('rejects too-short and too-long queries', () => {
    expect(() => normalizeQuery('a')).toThrowError(ApiError);
    expect(() => normalizeQuery('x'.repeat(101))).toThrowError(ApiError);
  });
});

describe('similarity helpers', () => {
  it('jaro-winkler is 1 for identical strings', () => {
    expect(jaroWinkler('typescript', 'typescript')).toBe(1);
  });

  it('username similarity ignores separators and case', () => {
    expect(usernameSimilarity('Rahul_Sharma', 'rahulsharma')).toBe(1);
  });

  it('name similarity detects containment', () => {
    expect(nameSimilarity('Rahul', 'Rahul Sharma')).toBeGreaterThanOrEqual(0.8);
  });

  it('unrelated names score low', () => {
    expect(nameSimilarity('Zoe Quinn', 'Rahul Sharma')).toBeLessThan(0.5);
  });
});

describe('utils', () => {
  it('normalizes usernames', () => {
    expect(normalizeUsername('@Dev_Trace')).toBe('devtrace');
  });

  it('extracts domains', () => {
    expect(extractDomain('https://www.example.dev/about')).toBe('example.dev');
    expect(extractDomain('not a url')).toBe('');
  });
});
