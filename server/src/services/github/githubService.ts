import { env } from '../../config/env';
import { cache } from '../../utils/cache';
import { logger } from '../../utils/logger';
import { ApiError } from '../../utils/apiError';
import type { PublicProfile, PublicRepository } from '../../types';
import { withHealth } from './health';
import { extractPublicLinks } from './links';

const API_BASE = 'https://api.github.com';

let githubCallCount = 0;

export function getGithubCallCount(): number {
  return githubCallCount;
}

/** Low-level GitHub API fetch with timeout + error mapping. */
export async function githubApi<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  githubCallCount += 1;
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (env.githubToken) headers.Authorization = `Bearer ${env.githubToken}`;

    const res = await fetch(`${API_BASE}${path}`, { headers, signal: controller.signal });

    if (res.status === 404) throw new ApiError(404, 'GITHUB_NOT_FOUND', 'Resource not found on GitHub.');
    if (res.status === 403 || res.status === 429) {
      throw new ApiError(429, 'GITHUB_RATE_LIMIT', 'GitHub API rate limit reached. Please try again later.');
    }
    if (!res.ok) {
      throw new ApiError(502, 'GITHUB_ERROR', 'GitHub is temporarily unavailable.');
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(504, 'GITHUB_TIMEOUT', 'GitHub request timed out.');
    }
    throw new ApiError(502, 'GITHUB_NETWORK', 'Could not reach GitHub.');
  } finally {
    clearTimeout(timeout);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toProfile(u: any): PublicProfile {
  return {
    platform: 'github',
    username: u.login,
    displayName: u.name || undefined,
    avatarUrl: u.avatar_url,
    bio: u.bio || undefined,
    profileUrl: u.html_url,
    websiteUrl: u.blog || undefined,
    location: u.location || undefined,
    company: u.company || undefined,
    followers: u.followers,
    following: u.following,
    publicProjectCount: u.public_repos,
    outboundLinks: extractPublicLinks(`${u.blog ?? ''} ${u.bio ?? ''}`),
  };
}

function toRepository(r: any): PublicRepository {
  return withHealth({
    platform: 'github',
    name: r.name,
    fullName: r.full_name,
    description: r.description || undefined,
    url: r.html_url,
    owner: r.owner?.login,
    language: r.language || undefined,
    stars: r.stargazers_count,
    forks: r.forks_count,
    openIssues: r.open_issues_count,
    topics: r.topics ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pushedAt: r.pushed_at,
    defaultBranch: r.default_branch,
    license: r.license?.spdx_id && r.license.spdx_id !== 'NOASSERTION' ? r.license.spdx_id : undefined,
    homepage: r.homepage || undefined,
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const githubService = {
  /** Search users by name or username (official Search API). */
  async searchUsers(query: string, limit = 5): Promise<PublicProfile[]> {
    const key = `gh:search:${query.toLowerCase()}:${limit}`;
    const cached = await cache.get<PublicProfile[]>(key);
    if (cached) return cached;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const data = await githubApi<{ items: any[] }>(
      `/search/users?q=${encodeURIComponent(query)}&per_page=${limit}`
    );
    const profiles: PublicProfile[] = data.items.map((u) => ({
      platform: 'github' as const,
      username: u.login,
      avatarUrl: u.avatar_url,
      profileUrl: u.html_url,
    }));
    /* eslint-enable @typescript-eslint/no-explicit-any */
    await cache.set(key, profiles, env.cache.profileTtlSec);
    return profiles;
  },

  /** Full public profile; enriches README/blog links. */
  async getUser(username: string): Promise<PublicProfile> {
    const key = `gh:user:${username.toLowerCase()}`;
    const cached = await cache.get<PublicProfile>(key);
    if (cached) return cached;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const u = await githubApi<any>(`/users/${encodeURIComponent(username)}`);
    const profile = toProfile(u);

    // Extract public links from the profile README (public info, official API).
    try {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      const readme = await githubApi<{ content?: string; encoding?: string }>(
        `/repos/${encodeURIComponent(u.login)}/README`
      );
      if (readme.content && readme.encoding === 'base64') {
        const text = Buffer.from(readme.content, 'base64').toString('utf-8');
        profile.outboundLinks = [
          ...(profile.outboundLinks ?? []),
          ...extractPublicLinks(text),
        ];
      }
    } catch (err) {
      logger.debug('README fetch skipped', { username, error: err instanceof Error ? err.message : '' });
    }

    await cache.set(key, profile, env.cache.profileTtlSec);
    return profile;
  },

  /** Public repositories for a user. */
  async getRepositories(username: string, limit = 30): Promise<PublicRepository[]> {
    const key = `gh:repos:${username.toLowerCase()}:${limit}`;
    const cached = await cache.get<PublicRepository[]>(key);
    if (cached) return cached;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const repos = await githubApi<any[]>(
      `/users/${encodeURIComponent(username)}/repos?per_page=${Math.min(limit, 100)}&sort=updated`
    );
    const mapped = repos.filter((r) => !r.fork).map(toRepository);
    await cache.set(key, mapped, env.cache.profileTtlSec);
    return mapped;
  },

  /** Language breakdown for a repository. */
  async getLanguages(owner: string, repo: string): Promise<string[]> {
    const key = `gh:langs:${owner}/${repo}`;
    const cached = await cache.get<string[]>(key);
    if (cached) return cached;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const langs = await githubApi<Record<string, number>>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`
    );
    const list = Object.entries(langs)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
    await cache.set(key, list, env.cache.profileTtlSec);
    return list;
  },

  /** Full repository detail. */
  async getRepository(owner: string, repo: string): Promise<PublicRepository> {
    const key = `gh:repo:${owner}/${repo}`.toLowerCase();
    const cached = await cache.get<PublicRepository>(key);
    if (cached) return cached;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const r = await githubApi<any>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
    );
    const mapped = toRepository(r);
    try {
      const languages = await githubService.getLanguages(owner, repo);
      mapped.languages = languages;
    } catch {
      // Non-fatal.
    }
    await cache.set(key, mapped, env.cache.profileTtlSec);
    return mapped;
  },
};

