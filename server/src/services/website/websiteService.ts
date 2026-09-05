import * as cheerio from 'cheerio';
import { env } from '../../config/env';
import { cache } from '../../utils/cache';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/apiError';
import type { WebsiteMetadata } from '../../types';
import { extractGithubLinks, extractLinkedInLinks, extractPublicLinks, platformOf } from '../github/links';

const MAX_BYTES = 512 * 1024; // 512 KB — fetch only the head portion of pages.

const TECH_HINTS: Array<{ name: string; test: RegExp }> = [
  { name: 'React', test: /__NEXT_DATA__|data-reactroot|react(?:-dom)?(?:\.min)?\.js/i },
  { name: 'Next.js', test: /_next\/static|__NEXT_DATA__/i },
  { name: 'Nuxt', test: /__NUXT__|_nuxt\//i },
  { name: 'Vue', test: /vue(?:\.runtime)?(?:\.min)?\.js|data-v-[a-f0-9]{8}/i },
  { name: 'Svelte', test: /svelte-[a-z0-9]{6}/i },
  { name: 'Tailwind CSS', test: /tailwind/i },
  { name: 'Bootstrap', test: /bootstrap(?:\.min)?\.(?:css|js)/i },
  { name: 'WordPress', test: /wp-content|wp-includes/i },
  { name: 'GitHub Pages', test: /github\.io/i },
  { name: 'Cloudflare', test: /cdn-cgi\//i },
];

function classifySite(host: string): WebsiteMetadata['siteType'] {
  if (/\.github\.io$/.test(host) || /github\.io$/.test(host)) return 'github_pages';
  if (/\.vercel\.app$/.test(host)) return 'vercel';
  if (/\.netlify\.app$/.test(host)) return 'netlify';
  return 'other';
}

/** Fetch a public page with timeout, size cap and a descriptive UA. */
async function fetchPage(url: string): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'DevTraceBot/1.0 (+https://devtrace.app; public metadata analysis)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (res.status === 404) throw new ApiError(404, 'SITE_NOT_FOUND', 'The website could not be reached.');
    if (!res.ok) throw new ApiError(502, 'SITE_UNREACHABLE', 'The website did not respond properly.');
    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('html')) {
      throw new ApiError(422, 'SITE_NOT_HTML', 'The URL does not serve an HTML page.');
    }
    const reader = res.body?.getReader();
    if (!reader) return { html: '', finalUrl: res.url || url };
    const decoder = new TextDecoder();
    let html = '';
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (received >= MAX_BYTES) {
        controller.abort();
        break;
      }
    }
    return { html, finalUrl: res.url || url };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(504, 'SITE_TIMEOUT', 'The website took too long to respond.');
    }
    throw new ApiError(502, 'SITE_NETWORK', 'Could not reach the website.');
  } finally {
    clearTimeout(timeout);
  }
}

/** Analyze publicly accessible metadata of a single public page. */
export async function analyzeWebsite(rawUrl: string): Promise<WebsiteMetadata> {
  let url: URL;
  try {
    url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
  } catch {
    throw ApiError.badRequest('MALFORMED_URL', 'The provided URL could not be parsed.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw ApiError.badRequest('MALFORMED_URL', 'Only http(s) URLs are supported.');
  }

  const cacheKey = `web:${url.toString().toLowerCase()}`;
  const cached = await cache.get<WebsiteMetadata>(cacheKey);
  if (cached) return cached;

  const { html, finalUrl } = await fetchPage(url.toString());
  const $ = cheerio.load(html);

  const meta = (name: string): string | undefined =>
    $(`meta[name="${name}"]`).attr('content') || $(`meta[property="${name}"]`).attr('content') || undefined;

  const openGraph: Record<string, string> = {};
  $('meta[property^="og:"]').each((_i, el) => {
    const prop = $(el).attr('property');
    const content = $(el).attr('content');
    if (prop && content) openGraph[prop] = content;
  });

  const imageSources = [
    openGraph['og:image'],
    openGraph['og:image:url'],
    openGraph['og:image:secure_url'],
    $('meta[name="twitter:image"]').first().attr('content'),
    $('meta[property="twitter:image"]').first().attr('content'),
    $('link[rel="image_src"]').first().attr('href'),
  ].filter((value): value is string => Boolean(value));

  let previewUrl: string | undefined;
  for (const rawPreview of imageSources) {
    try {
      previewUrl = new URL(rawPreview, finalUrl).toString();
      break;
    } catch {
      // Ignore malformed image URLs.
    }
  }

  // Collect public links from the visible page (anchor hrefs) — single page only.
  const pageLinks = new Set<string>();
  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    try {
      const abs = new URL(href, finalUrl).toString();
      if (abs.startsWith('http')) pageLinks.add(abs);
    } catch {
      // Ignore malformed hrefs.
    }
  });

  const allTextLinks = [...pageLinks, ...extractPublicLinks(html)].join('\n');
  const socialLinks = allTextLinks.split('\n').filter((u) => platformOf(u)).slice(0, 12);
  const githubLinks = extractGithubLinks(allTextLinks);
  const linkedinLinks = extractLinkedInLinks(allTextLinks);

  const host = url.hostname.replace(/^www\./, '');
  const technologyHints = TECH_HINTS.filter((t) => t.test.test(html) || t.test.test(host)).map((t) => t.name);

  const iconHref =
    $('link[rel~="icon"]').first().attr('href') ??
    $('link[rel="shortcut icon"]').attr('href') ??
    '/favicon.ico';
  let favicon: string | undefined;
  try {
    favicon = new URL(iconHref, finalUrl).toString();
  } catch {
    favicon = undefined;
  }

  const metadata: WebsiteMetadata = {
    url: url.toString(),
    finalUrl,
    title: $('title').first().text().trim() || openGraph['og:title'],
    description: meta('description') || openGraph['og:description'],
    favicon,
    previewUrl,
    canonicalUrl: $('link[rel="canonical"]').attr('href'),
    openGraph: Object.keys(openGraph).length ? openGraph : undefined,
    socialLinks,
    githubLinks,
    linkedinLinks,
    technologyHints,
    siteType: classifySite(host),
  };

  await cache.set(cacheKey, metadata, env.cache.websiteTtlSec);
  logger.debug('Website analyzed', { host, links: socialLinks.length });
  return metadata;
}

/** Provider adapter used by the search orchestrator. */
export async function websiteSearch(queryUrl: string | undefined): Promise<WebsiteMetadata | null> {
  if (!queryUrl) return null;
  try {
    return await analyzeWebsite(queryUrl);
  } catch {
    return null;
  }
}

