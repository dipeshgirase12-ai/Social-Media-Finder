import { ApiError } from './apiError';
import type { QueryType } from '../types';

const GITHUB_URL_RE = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38})\/?$/i;
const GITLAB_URL_RE = /^(?:https?:\/\/)?(?:www\.)?gitlab\.com\/([A-Za-z0-9_.-]+)\/?$/i;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface NormalizedQuery {
  /** Original input, whitespace-trimmed. */
  raw: string;
  queryType: QueryType;
  /** Canonical search term (for NAME: as typed; for USERNAME: lowercased). */
  term: string;
  /** Extracted github username when query is a GitHub URL. */
  githubUsername?: string;
  /** Extracted gitlab username when query is a GitLab URL. */
  gitlabUsername?: string;
  /** Parsed URL when query is a website URL. */
  websiteUrl?: string;
}

/**
 * Classifies and normalizes a raw search query.
 * Email addresses are rejected as identity search input (privacy-by-design).
 */
export function normalizeQuery(input: string): NormalizedQuery {
  const raw = input.trim().replace(/\s+/g, ' ');
  if (raw.length < 2 || raw.length > 100) {
    throw ApiError.badRequest('INVALID_QUERY', 'Query must be between 2 and 100 characters.');
  }

  if (EMAIL_RE.test(raw)) {
    throw ApiError.badRequest(
      'EMAIL_NOT_ALLOWED',
      'Searching by email address is not supported. Try a name, username, or public URL.'
    );
  }

  const githubMatch = raw.match(GITHUB_URL_RE);
  if (githubMatch) {
    const username = githubMatch[1].toLowerCase();
    return { raw, queryType: 'GITHUB_URL', term: username, githubUsername: username };
  }

  const gitlabMatch = raw.match(GITLAB_URL_RE);
  if (gitlabMatch) {
    const username = gitlabMatch[1].toLowerCase();
    return { raw, queryType: 'GITHUB_URL', term: username, gitlabUsername: username };
  }

  if (/^https?:\/\//i.test(raw) || (URL_RE.test(raw) && raw.includes('.'))) {
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('bad protocol');
      }
      return { raw, queryType: 'WEBSITE_URL', term: parsed.hostname.replace(/^www\./, ''), websiteUrl: parsed.toString() };
    } catch {
      throw ApiError.badRequest('MALFORMED_URL', 'The provided URL could not be parsed.');
    }
  }

  if (/\s/.test(raw)) {
    return { raw, queryType: 'NAME', term: raw };
  }

  return { raw, queryType: 'USERNAME', term: raw.toLowerCase().replace(/^@/, '') };
}

/** Normalize a username-ish string for comparison. */
export function normalizeUsername(value: string | undefined | null): string {
  if (!value) return '';
  return value.toLowerCase().replace(/^@/, '').replace(/[\s._-]+/g, '');
}

/** Normalize a display name into comparable lowercase tokens. */
export function normalizeName(value: string | undefined | null): string {
  if (!value) return '';
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Extract the registrable-ish domain (host without www). */
export function extractDomain(url: string | undefined | null): string {
  if (!url) return '';
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}
