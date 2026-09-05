import { describe, it, expect } from 'vitest';
import { scoreMatch, confidenceLabel } from '../src/services/matching/engine';
import type { PublicProfile } from '../src/types';

const anchor: PublicProfile = {
  platform: 'github',
  username: 'rahulsharma',
  displayName: 'Rahul Sharma',
  profileUrl: 'https://github.com/rahulsharma',
  location: 'Bangalore, India',
  websiteUrl: 'https://rahulsharma.dev',
};

const repo = {
  platform: 'github' as const,
  name: 'react-trace-ui',
  url: 'https://github.com/rahulsharma/react-trace-ui',
};

describe('matching engine — deterministic scores', () => {
  it('same username + same website => very high score', () => {
    const candidate: PublicProfile = {
      platform: 'gitlab',
      username: 'rahulsharma',
      displayName: 'Rahul Sharma',
      profileUrl: 'https://gitlab.com/rahulsharma',
      websiteUrl: 'https://rahulsharma.dev',
    };
    const m = scoreMatch({ anchor, candidate, anchorRepositories: [repo] });
    expect(m.score).toBeGreaterThanOrEqual(90);
    expect(m.label).toBe('very_likely');
  });

  it('same name only => low score', () => {
    const candidate: PublicProfile = {
      platform: 'linkedin',
      displayName: 'Rahul Sharma',
      profileUrl: 'https://linkedin.com/in/other-rahul',
    };
    const m = scoreMatch({ anchor, candidate });
    expect(m.score).toBeLessThanOrEqual(25);
    expect(m.label).toBe('weak');
    expect(m.evidence.some((e) => e.kind === 'NAME_SIMILARITY')).toBe(true);
  });

  it('same name + same project reference => medium/high score', () => {
    const candidate: PublicProfile = {
      platform: 'npm',
      username: 'rahul',
      displayName: 'Rahul Sharma',
      profileUrl: 'https://www.npmjs.com/~rahul',
      bio: 'Author of react-trace-ui and other tools.',
    };
    const m = scoreMatch({ anchor, candidate, anchorRepositories: [repo] });
    expect(m.score).toBeGreaterThanOrEqual(55);
    expect(m.score).toBeLessThan(90);
    expect(m.evidence.some((e) => e.kind === 'PROJECT_SIMILARITY')).toBe(true);
  });

  it('different names + unrelated profiles => low score', () => {
    const candidate: PublicProfile = {
      platform: 'github',
      username: 'xkcd_fan42',
      displayName: 'Zoe Quinn',
      profileUrl: 'https://github.com/xkcd_fan42',
    };
    const m = scoreMatch({ anchor, candidate });
    expect(m.score).toBeLessThan(55);
    expect(m.label).toBe('weak');
  });

  it('cross-link: anchor links to candidate website => strong evidence', () => {
    const a: PublicProfile = {
      ...anchor,
      outboundLinks: ['https://rahulsharma.dev', 'https://linkedin.com/in/rahulsharma'],
    };
    const candidate: PublicProfile = {
      platform: 'website',
      username: 'rahulsharma.dev',
      profileUrl: 'https://rahulsharma.dev',
      outboundLinks: ['https://github.com/rahulsharma'],
    };
    const m = scoreMatch({ anchor: a, candidate });
    expect(m.evidence.some((e) => e.kind === 'CROSS_LINK')).toBe(true);
    expect(m.score).toBeGreaterThanOrEqual(75);
  });

  it('public location adds a small bonus', () => {
    const candidate: PublicProfile = {
      platform: 'gitlab',
      username: 'totally-different',
      displayName: 'Completely Different Person',
      profileUrl: 'https://gitlab.com/totally-different',
      location: 'Bangalore, India',
    };
    const m = scoreMatch({ anchor, candidate });
    expect(m.evidence.some((e) => e.kind === 'LOCATION_SIMILARITY')).toBe(true);
  });

  it('is deterministic — same inputs, same score', () => {
    const candidate: PublicProfile = {
      platform: 'gitlab',
      username: 'rahulsharma',
      displayName: 'Rahul',
      profileUrl: 'https://gitlab.com/rahulsharma',
    };
    const a = scoreMatch({ anchor, candidate });
    const b = scoreMatch({ anchor, candidate });
    expect(a.score).toBe(b.score);
    expect(a.evidence).toEqual(b.evidence);
  });
});

describe('confidence labels', () => {
  it('maps score bands correctly', () => {
    expect(confidenceLabel(95)).toBe('very_likely');
    expect(confidenceLabel(80)).toBe('likely');
    expect(confidenceLabel(60)).toBe('possible');
    expect(confidenceLabel(30)).toBe('weak');
  });
});
