import { describe, it, expect } from 'vitest';
import { computeRepositoryHealth } from '../src/services/github/health';
import { inferSkills } from '../src/services/matching/skills';
import type { PublicRepository } from '../src/types';

describe('repository health score', () => {
  it('a well-documented, active, licensed repo scores high', () => {
    const recent = new Date(Date.now() - 3 * 86_400_000).toISOString();
    const { score } = computeRepositoryHealth({
      description: 'A great library',
      hasReadme: true,
      homepage: 'https://example.dev',
      topics: ['react', 'typescript'],
      license: 'MIT',
      stars: 500,
      forks: 50,
      openIssues: 3,
      pushedAt: recent,
      createdAt: '2023-01-01',
      language: 'TypeScript',
    });
    expect(score).toBeGreaterThanOrEqual(80);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('an empty stale repo scores low', () => {
    const old = new Date(Date.now() - 400 * 86_400_000).toISOString();
    const { score } = computeRepositoryHealth({ pushedAt: old });
    expect(score).toBeLessThan(20);
  });

  it('scores are bounded to 0..100', () => {
    const { score } = computeRepositoryHealth({
      description: 'x', hasReadme: true, homepage: 'y', topics: ['a', 'b', 'c', 'd', 'e'],
      license: 'MIT', stars: 100000, forks: 10000, pushedAt: new Date().toISOString(),
      createdAt: '2020-01-01', language: 'Go',
    });
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('skills inference', () => {
  it('infers skills only from public repo evidence', () => {
    const repos: PublicRepository[] = [
      { platform: 'github', name: 'a', url: 'x', language: 'TypeScript', topics: ['react', 'mongodb'], stars: 10 },
      { platform: 'github', name: 'b', url: 'y', language: 'TypeScript', topics: ['docker'], stars: 0 },
      { platform: 'github', name: 'c', url: 'z', language: 'Python', topics: [], stars: 0 },
    ];
    const skills = inferSkills(repos);
    const names = skills.map((s) => s.skill);
    expect(names).toContain('typescript');
    expect(names).toContain('react');
    expect(names).toContain('python');
    // Unknown topics are not invented into skills.
    expect(names).not.toContain('unknown-topic');
  });

  it('ranks more frequent languages higher', () => {
    const repos: PublicRepository[] = [
      { platform: 'github', name: 'a', url: 'x', language: 'TypeScript' },
      { platform: 'github', name: 'b', url: 'y', language: 'TypeScript' },
      { platform: 'github', name: 'c', url: 'z', language: 'Go' },
    ];
    const skills = inferSkills(repos);
    expect(skills[0].skill).toBe('typescript');
  });
});
