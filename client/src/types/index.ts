/** Shared client-side types — mirrors the server's unified data model. */

export type QueryType =
  | 'NAME'
  | 'USERNAME'
  | 'GITHUB_URL'
  | 'WEBSITE_URL'
  | 'EMAIL_NOT_ALLOWED_AS_IDENTITY_SEARCH';

export type PlatformName =
  | 'github' | 'gitlab' | 'npm' | 'linkedin' | 'instagram' | 'x' | 'medium' | 'devpost' | 'website';

export type ProviderStatus =
  | 'FOUND' | 'LIKELY' | 'POSSIBLE' | 'NOT_FOUND' | 'UNAVAILABLE' | 'RATE_LIMITED' | 'ERROR';

export type ConfidenceLabel = 'very_likely' | 'likely' | 'possible' | 'weak';

export interface MatchEvidence {
  kind: string;
  points: number;
  maxPoints: number;
  description: string;
}

export interface PublicProfile {
  platform: PlatformName;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  profileUrl: string;
  websiteUrl?: string;
  location?: string;
  company?: string;
  followers?: number;
  following?: number;
  publicProjectCount?: number;
  outboundLinks?: string[];
  confidence?: number;
  confidenceLabel?: ConfidenceLabel;
  evidence?: MatchEvidence[];
  isDemo?: boolean;
}

export interface NpmPackageSummary {
  name: string;
  version?: string;
  description?: string;
  downloads?: number;
  url: string;
  repositoryUrl?: string;
  homepage?: string;
  author?: string;
}

export interface RepositoryHealthBreakdown {
  documentation: number;
  activity: number;
  popularity: number;
  topics: number;
  license: number;
  completeness: number;
}

export interface PublicRepository {
  platform: PlatformName;
  name: string;
  fullName?: string;
  description?: string;
  url: string;
  owner?: string;
  language?: string;
  languages?: string[];
  stars?: number;
  forks?: number;
  openIssues?: number;
  topics?: string[];
  createdAt?: string;
  updatedAt?: string;
  pushedAt?: string;
  defaultBranch?: string;
  license?: string;
  homepage?: string;
  healthScore?: number;
  healthBreakdown?: RepositoryHealthBreakdown;
  isDemo?: boolean;
}

export interface WebsiteMetadata {
  url: string;
  finalUrl?: string;
  title?: string;
  description?: string;
  favicon?: string;
  previewUrl?: string;
  canonicalUrl?: string;
  openGraph?: Record<string, string>;
  socialLinks?: string[];
  githubLinks?: string[];
  linkedinLinks?: string[];
  technologyHints?: string[];
  siteType?: string;
  isDemo?: boolean;
}

export interface PlatformState {
  platform: PlatformName;
  status: ProviderStatus;
  note?: string;
  externalSearchUrl?: string;
  profileCount?: number;
}

export interface SearchResponse {
  success: boolean;
  searchId: string;
  query: string;
  queryType: QueryType;
  profiles: PublicProfile[];
  repositories: PublicRepository[];
  websites: WebsiteMetadata[];
  packages: NpmPackageSummary[];
  platforms: PlatformState[];
  links: Array<{ platform: string; url: string; source: string }>;
  searchTime: number;
}

export interface PublicUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  queryType: QueryType;
  repositoryCount: number;
  websiteCount: number;
  packageCount: number;
  durationMs: number;
  createdAt: string;
}

export interface SavedProfileItem {
  id: string;
  platform: PlatformName;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  profileUrl: string;
  bio?: string;
  confidence?: number;
  savedAt: string;
}

export interface SearchSummary {
  id: string;
  query: string;
  queryType: string;
  profiles: Array<{
    platform: string;
    username?: string;
    displayName?: string;
    profileUrl: string;
    confidence?: number;
    confidenceLabel?: string;
  }>;
  repositoryCount: number;
  websiteCount: number;
  packageCount: number;
  durationMs: number;
  createdAt: string;
}

export interface ApiErrorShape {
  success: false;
  error: { code: string; message: string };
}
