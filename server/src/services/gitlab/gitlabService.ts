import { env } from '../../config/env';
import { cache } from '../../utils/cache';
import { ApiError } from '../../utils/apiError';
import type { PublicProfile, PublicRepository, ProviderResult } from '../../types';
import { withHealth } from '../github/health';

const API_BASE = 'https://gitlab.com/api/v4';

async function gitlabApi<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const headers: Record<string, string> = {};
    if (env.gitlabToken) headers['PRIVATE-TOKEN'] = env.gitlabToken;
    const res = await fetch(`${API_BASE}${path}`, { headers, signal: controller.signal });
    if (res.status === 404) throw new ApiError(404, 'GITLAB_NOT_FOUND', 'Resource not found on GitLab.');
    if (res.status === 403 || res.status === 429) {
      throw new ApiError(429, 'GITLAB_RATE_LIMIT', 'GitLab API rate limit reached. Try again later.');
    }
    if (!res.ok) throw new ApiError(502, 'GITLAB_ERROR', 'GitLab is temporarily unavailable.');
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(504, 'GITLAB_TIMEOUT', 'GitLab request timed out.');
    }
    throw new ApiError(502, 'GITLAB_NETWORK', 'Could not reach GitLab.');
  } finally {
    clearTimeout(timeout);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const gitlabService = {
  async searchUsers(query: string, limit = 5): Promise<PublicProfile[]> {
    const key = `gl:search:${query.toLowerCase()}:${limit}`;
    const cached = await cache.get<PublicProfile[]>(key);
    if (cached) return cached;

    const users = await gitlabApi<any[]>(`/users?search=${encodeURIComponent(query)}&per_page=${limit}`);
    const profiles = users.map((u) => ({
      platform: 'gitlab' as const,
      username: u.username,
      displayName: u.name || undefined,
      avatarUrl: u.avatar_url,
      bio: u.bio || undefined,
      profileUrl: u.web_url,
      location: u.location || undefined,
      publicProjectCount: u.public_repos_count ?? undefined,
      websiteUrl: u.website_url || undefined,
    }));
    await cache.set(key, profiles, env.cache.profileTtlSec);
    return profiles;
  },

  async getUser(username: string): Promise<PublicProfile | null> {
    const key = `gl:user:${username.toLowerCase()}`;
    const cached = await cache.get<PublicProfile | null>(key);
    if (cached !== null) return cached;

    const users = await gitlabApi<any[]>(`/users?username=${encodeURIComponent(username)}`);
    if (users.length === 0) {
      await cache.set(key, null, env.cache.profileTtlSec);
      return null;
    }
    const u = users[0];
    const profile: PublicProfile = {
      platform: 'gitlab',
      username: u.username,
      displayName: u.name || undefined,
      avatarUrl: u.avatar_url,
      bio: u.bio || undefined,
      profileUrl: u.web_url,
      location: u.location || undefined,
      publicProjectCount: u.public_repos_count ?? undefined,
      websiteUrl: u.website_url || undefined,
    };
    await cache.set(key, profile, env.cache.profileTtlSec);
    return profile;
  },

  async getUserProjects(username: string, limit = 10): Promise<PublicRepository[]> {
    const user = await gitlabService.getUser(username);
    if (!user || !user.username) return [];
    const key = `gl:projects:${username.toLowerCase()}:${limit}`;
    const cached = await cache.get<PublicRepository[]>(key);
    if (cached) return cached;

    const projects = await gitlabApi<any[]>(
      `/users/${encodeURIComponent(user.username)}/projects?visibility=public&per_page=${limit}&order_by=updated`
    );
    const repos = projects.map((p) =>
      withHealth({
        platform: 'gitlab' as const,
        name: p.name,
        fullName: p.path_with_namespace,
        description: p.description || undefined,
        url: p.web_url,
        owner: username,
        language: p.language || undefined,
        stars: p.star_count,
        forks: p.forks_count,
        openIssues: p.open_issues_count,
        topics: p.topics ?? [],
        createdAt: p.created_at,
        updatedAt: p.last_activity_at,
        defaultBranch: p.default_branch,
        license: p.license?.key,
        homepage: p.homepage || undefined,
      })
    );
    await cache.set(key, repos, env.cache.profileTtlSec);
    return repos;
  },

  /** Provider adapter used by the search orchestrator. */
  async search(query: string): Promise<ProviderResult> {
    const start = Date.now();
    try {
      const profiles = await gitlabService.searchUsers(query, 3);
      return {
        provider: 'gitlab',
        status: profiles.length > 0 ? 'FOUND' : 'NOT_FOUND',
        profiles,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      const isRate = err instanceof ApiError && err.code === 'GITLAB_RATE_LIMIT';
      return {
        provider: 'gitlab',
        status: isRate ? 'RATE_LIMITED' : 'ERROR',
        errorCode: err instanceof ApiError ? err.code : 'GITLAB_NETWORK',
        durationMs: Date.now() - start,
      };
    }
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */
