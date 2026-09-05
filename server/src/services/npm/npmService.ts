import { env } from '../../config/env';
import { cache } from '../../utils/cache';
import { ApiError } from '../../utils/apiError';
import type { NpmPackageSummary, ProviderResult } from '../../types';

const REGISTRY = env.npmApiUrl;
const SEARCH_URL = 'https://registry.npmjs.org/-/v1/search';

export interface NpmSearchResponse {
  objects: Array<{
    package: {
      name: string;
      version: string;
      description?: string;
      links?: { npm?: string; homepage?: string; repository?: string };
      author?: { name?: string } | string;
      publisher?: { username?: string };
      date?: string;
    };
    score?: { detail?: { popularity?: number } };
  }>;
}

async function npmFetch<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (res.status === 404) throw new ApiError(404, 'NPM_NOT_FOUND', 'Package not found on npm.');
    if (!res.ok) throw new ApiError(502, 'NPM_ERROR', 'npm registry is temporarily unavailable.');
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(504, 'NPM_TIMEOUT', 'npm request timed out.');
    }
    throw new ApiError(502, 'NPM_NETWORK', 'Could not reach the npm registry.');
  } finally {
    clearTimeout(timeout);
  }
}

export const npmService = {
  /** Search public packages by keyword (official registry search endpoint). */
  async searchPackages(query: string, limit = 8): Promise<NpmPackageSummary[]> {
    const key = `npm:search:${query.toLowerCase()}:${limit}`;
    const cached = await cache.get<NpmPackageSummary[]>(key);
    if (cached) return cached;

    const data = await npmFetch<NpmSearchResponse>(
      `${SEARCH_URL}?text=${encodeURIComponent(query)}&size=${limit}`
    );

    const packages = data.objects.map((o) => {
      const author =
        typeof o.package.author === 'string'
          ? o.package.author
          : o.package.author?.name || o.package.publisher?.username;
      return {
        name: o.package.name,
        version: o.package.version,
        description: o.package.description || undefined,
        url: o.package.links?.npm ?? `https://www.npmjs.com/package/${o.package.name}`,
        repositoryUrl: o.package.links?.repository,
        homepage: o.package.links?.homepage,
        author,
        downloads: o.score?.detail?.popularity
          ? Math.round(o.score.detail.popularity)
          : undefined,
      } satisfies NpmPackageSummary;
    });

    await cache.set(key, packages, env.cache.profileTtlSec);
    return packages;
  },

  async getPackage(name: string): Promise<NpmPackageSummary> {
    const key = `npm:pkg:${name.toLowerCase()}`;
    const cached = await cache.get<NpmPackageSummary>(key);
    if (cached) return cached;

    const doc = await npmFetch<{
      'dist-tags'?: { latest?: string };
      description?: string;
      homepage?: string;
      repository?: { url?: string } | string;
      author?: { name?: string } | string;
      versions?: Record<string, unknown>;
    }>(`${REGISTRY}/${encodeURIComponent(name)}`);

    const repoUrl = typeof doc.repository === 'string' ? doc.repository : doc.repository?.url;
    const author = typeof doc.author === 'string' ? doc.author : doc.author?.name;

    const pkg: NpmPackageSummary = {
      name,
      version: doc['dist-tags']?.latest,
      description: doc.description,
      url: `https://www.npmjs.com/package/${name}`,
      repositoryUrl: repoUrl?.replace(/^git\+/, '').replace(/\.git$/, ''),
      homepage: doc.homepage,
      author,
    };
    await cache.set(key, pkg, env.cache.profileTtlSec);
    return pkg;
  },

  /** Provider adapter used by the search orchestrator. */
  async search(query: string): Promise<ProviderResult> {
    const start = Date.now();
    try {
      const packages = await npmService.searchPackages(query, 8);
      return {
        provider: 'npm',
        status: packages.length > 0 ? 'FOUND' : 'NOT_FOUND',
        packages,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      return {
        provider: 'npm',
        status: 'ERROR',
        errorCode: err instanceof ApiError ? err.code : 'NPM_NETWORK',
        durationMs: Date.now() - start,
      };
    }
  },
};
