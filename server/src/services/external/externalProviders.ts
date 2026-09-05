import type { PlatformName, ProviderResult, ProviderStatus } from '../../types';

/**
 * Providers for platforms without an appropriate public search API
 * (LinkedIn, Instagram, X, Medium, Devpost).
 *
 * Policy: no unauthorized scraping, no CAPTCHA bypass, no auth bypass.
 * These providers return UNAVAILABLE with a legitimate external search URL
 * so the UI can offer compliant "Open search" navigation.
 */

interface ExternalProviderConfig {
  platform: PlatformName;
  note: string;
  searchUrl: (query: string) => string;
}

export const externalProviders: Record<string, ExternalProviderConfig> = {
  linkedin: {
    platform: 'linkedin',
    note: 'No public search API. DevTrace does not scrape LinkedIn — open public search instead.',
    searchUrl: (q) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(q)}`,
  },
  instagram: {
    platform: 'instagram',
    note: 'Instagram does not provide a public search API. Results are unverified.',
    searchUrl: (q) => `https://www.instagram.com/${encodeURIComponent(q.replace(/\s+/g, ''))}/`,
  },
  x: {
    platform: 'x',
    note: 'X API access is restricted. Open public search instead.',
    searchUrl: (q) => `https://x.com/search?q=${encodeURIComponent(q)}`,
  },
  medium: {
    platform: 'medium',
    note: 'Medium API is limited to publications. Open public search instead.',
    searchUrl: (q) => `https://medium.com/search?q=${encodeURIComponent(q)}`,
  },
  devpost: {
    platform: 'devpost',
    note: 'No public search API. Open public search instead.',
    searchUrl: (q) => `https://devpost.com/search?query=${encodeURIComponent(q)}`,
  },
};

export function externalSearchUrl(platform: PlatformName, query: string): string | undefined {
  return externalProviders[platform]?.searchUrl(query);
}

export function externalResult(
  platform: PlatformName,
  query: string,
  status: ProviderStatus = 'UNAVAILABLE'
): ProviderResult {
  const config = externalProviders[platform];
  if (!config) {
    return { provider: platform, status: 'UNAVAILABLE', note: 'No integration available.' };
  }
  return {
    provider: platform,
    status,
    note: config.note,
    externalSearchUrl: config.searchUrl(query),
  };
}
