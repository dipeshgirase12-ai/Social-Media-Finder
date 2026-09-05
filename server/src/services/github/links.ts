/**
 * Extract legitimate public links (URLs) from arbitrary public text such as
 * a GitHub README, profile bio, or a website homepage. Used as matching
 * evidence — never stored as private data.
 */

const PLATFORM_HOSTS = new Set([
  'github.com',
  'gitlab.com',
  'linkedin.com',
  'instagram.com',
  'x.com',
  'twitter.com',
  'medium.com',
  'devpost.com',
  'dev.to',
  'npmjs.com',
  'stackoverflow.com',
]);

const URL_RE = /https?:\/\/[^\s<>"')\]]+/gi;

/** Known URL shorteners / tracking hosts to skip as evidence. */
const NOISE_HOSTS = new Set([
  'shields.io',
  'img.shields.io',
  'travis-ci.org',
  'circleci.com',
  'npmjs.com',
  'www.npmjs.com',
  'badge.fury.io',
  'hits.githubusercontent.com',
  'camo.githubusercontent.com',
  'imgur.com',
]);

export interface ExtractedLink {
  url: string;
  platform?: string;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

/** Extract all public http(s) URLs from text, filtered for obvious noise. */
export function extractPublicLinks(text: string): string[] {
  if (!text) return [];
  const matches = text.match(URL_RE) ?? [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of matches) {
    const url = raw.replace(/[.,;]+$/, '');
    const host = hostOf(url);
    if (!host || NOISE_HOSTS.has(host)) continue;
    // Skip GitHub image/asset noise (user-attachments, raw, assets).
    if (/raw\.githubusercontent\.com/.test(host)) continue;
    if (!seen.has(url)) {
      seen.add(url);
      result.push(url);
    }
  }
  return result.slice(0, 30);
}

/** Map a URL to a known platform, if any. */
export function platformOf(url: string): string | undefined {
  const host = hostOf(url);
  if (!host) return undefined;
  for (const p of PLATFORM_HOSTS) {
    if (host === p || host.endsWith(`.${p}`)) return p;
  }
  return undefined;
}

/** Extract LinkedIn profile URLs specifically. */
export function extractLinkedInLinks(text: string): string[] {
  return extractPublicLinks(text).filter((u) => /linkedin\.com\/in\//i.test(u));
}

/** Extract GitHub URLs specifically. */
export function extractGithubLinks(text: string): string[] {
  return extractPublicLinks(text).filter((u) => /github\.com\/[A-Za-z0-9-]+\/?$/i.test(u));
}
