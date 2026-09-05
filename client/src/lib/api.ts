import axios from 'axios';
import type {
  PublicRepository, PublicUser, PublicProfile, NpmPackageSummary, WebsiteMetadata,
  SearchResponse, SearchHistoryItem, SavedProfileItem, SearchSummary,
} from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 45_000,
});

/** Extract a friendly message from an API error response. */
export function errorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string; code?: string } } | undefined;
    if (data?.error?.message) return data.error.message;
    if (err.code === 'ERR_NETWORK') {
      return import.meta.env.VITE_API_URL
        ? 'The API server could not be reached. Check the deployed API URL and CORS settings.'
        : 'The API is not connected to this deployment. Set VITE_API_URL to the deployed API URL.';
    }
    if (err.response?.status === 404 && !import.meta.env.VITE_API_URL) {
      return 'The API is not connected to this deployment. Set VITE_API_URL to the deployed API URL.';
    }
  }
  return fallback;
}

export const authService = {
  async register(email: string, password: string, name?: string): Promise<{ user: PublicUser; token: string }> {
    const res = await api.post('/auth/register', { email, password, name });
    return res.data;
  },
  async login(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
  async me(): Promise<PublicUser | null> {
    try {
      const res = await api.get('/auth/me');
      return res.data.user;
    } catch {
      return null;
    }
  },
};

export const searchService = {
  async search(query: string): Promise<SearchResponse> {
    const res = await api.post('/search', { query });
    return res.data;
  },
  async getSearch(id: string): Promise<{ success: boolean; search: SearchSummary }> {
    const res = await api.get(`/search/${id}`);
    return res.data;
  },
  async history(): Promise<SearchHistoryItem[]> {
    const res = await api.get('/search/history');
    return res.data.history;
  },
  async deleteSearch(id: string): Promise<void> {
    await api.delete(`/search/${id}`);
  },
  async clearHistory(): Promise<void> {
    await api.delete('/search/history');
  },
  exportSearch(id: string, format: 'json' | 'csv'): void {
    window.open(`/api/search/${id}/export?format=${format}`, '_blank');
  },
};

export const savedService = {
  async list(): Promise<SavedProfileItem[]> {
    const res = await api.get('/saved');
    return res.data.saved;
  },
  async save(profile: {
    platform: string; username: string; displayName?: string; avatarUrl?: string;
    profileUrl: string; bio?: string; confidence?: number;
  }): Promise<void> {
    await api.post('/saved', profile);
  },
  async remove(platform: string, username: string): Promise<void> {
    await api.delete(`/saved/${platform}/${encodeURIComponent(username)}`);
  },
};

export const platformService = {
  async githubUser(username: string): Promise<PublicProfile> {
    const res = await api.get(`/github/users/${username}`);
    return res.data.user;
  },
  async githubRepos(username: string): Promise<{ repositories: PublicRepository[]; skills: Array<{ skill: string; weight: number; count: number }> }> {
    const res = await api.get(`/github/users/${username}/repos`);
    return res.data;
  },
  async githubRepo(owner: string, repo: string): Promise<PublicRepository> {
    const res = await api.get(`/github/repos/${owner}/${repo}`);
    return res.data.repository;
  },
  async gitlabUser(username: string): Promise<{ user: PublicProfile; projects: PublicRepository[] }> {
    const res = await api.get(`/gitlab/users/${username}`);
    return res.data;
  },
  async npmSearch(q: string): Promise<NpmPackageSummary[]> {
    const res = await api.get('/npm/search', { params: { q } });
    return res.data.packages;
  },
  async analyzeWebsite(url: string): Promise<WebsiteMetadata> {
    const res = await api.get('/website/analyze', { params: { url } });
    return res.data.website;
  },
};
