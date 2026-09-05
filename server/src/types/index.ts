/** Unified, normalized data model shared across all providers. */

export type QueryType =
  | 'NAME'
  | 'USERNAME'
  | 'GITHUB_URL'
  | 'WEBSITE_URL'
  | 'EMAIL_NOT_ALLOWED_AS_IDENTITY_SEARCH';

export type PlatformName =
  | 'github'
  | 'gitlab'
  | 'npm'
  | 'linkedin'
  | 'instagram'
  | 'x'
  | 'medium'
  | 'devpost'
  | 'website';

export type ProviderStatus =
  | 'FOUND'
  | 'LIKELY'
  | 'POSSIBLE'
  | 'NOT_FOUND'
  | 'UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'ERROR';

export type MatchEvidenceKind =
  | 'NAME_SIMILARITY'
  | 'USERNAME_SIMILARITY'
  | 'CROSS_LINK'
  | 'WEBSITE_MATCH'
  | 'PROJECT_SIMILARITY'
  | 'LOCATION_SIMILARITY'
  | 'BIO_SIMILARITY'
  | 'CONSISTENCY_BONUS';

export interface MatchEvidence {
  kind: MatchEvidenceKind;
  points: number;
  maxPoints: number;
  description: string;
}

export type ConfidenceLabel = 'very_likely' | 'likely' | 'possible' | 'weak';

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
  /** Public links extracted from this profile (README, website social links, etc.) */
  outboundLinks?: string[];
  /** npm packages authored/maintained (npm provider) */
  packages?: NpmPackageSummary[];
  confidence?: number;
  confidenceLabel?: ConfidenceLabel;
  evidence?: MatchEvidence[];
  verifiedLink?: boolean;
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
  hasReadme?: boolean;
  homepage?: string;
  healthScore?: number;
  healthBreakdown?: RepositoryHealthBreakdown;
  isDemo?: boolean;
}

export interface RepositoryHealthBreakdown {
  documentation: number;
  activity: number;
  popularity: number;
  topics: number;
  license: number;
  completeness: number;
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
  siteType?: 'portfolio' | 'github_pages' | 'vercel' | 'netlify' | 'personal' | 'other';
  isDemo?: boolean;
}

export interface ProviderResult<T = unknown> {
  provider: PlatformName;
  status: ProviderStatus;
  /** Human-readable note surfaced in the UI (e.g. "External search only"). */
  note?: string;
  profiles?: PublicProfile[];
  repositories?: PublicRepository[];
  packages?: NpmPackageSummary[];
  websites?: WebsiteMetadata[];
  /** Legitimate external search URL when direct API search is not offered. */
  externalSearchUrl?: string;
  errorCode?: string;
  durationMs?: number;
  data?: T;
}

export interface PlatformState {
  platform: PlatformName;
  status: ProviderStatus;
  note?: string;
  externalSearchUrl?: string;
  profileCount?: number;
}

export interface DiscoveryLink {
  platform: PlatformName;
  url: string;
  /** How the link was discovered: profile field, README, website page, etc. */
  source: string;
}

export interface SearchResponsePayload {
  searchId: string;
  query: string;
  queryType: QueryType;
  profiles: PublicProfile[];
  repositories: PublicRepository[];
  websites: WebsiteMetadata[];
  packages: NpmPackageSummary[];
  platforms: PlatformState[];
  links: DiscoveryLink[];
  searchTime: number;
  cached?: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt?: string;
}
