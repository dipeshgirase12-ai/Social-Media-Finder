import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import type { ApiError } from '../../utils/apiError';
import type {
  DiscoveryLink, NpmPackageSummary, PlatformState, ProviderResult, PublicProfile,
  PublicRepository, SearchResponsePayload, WebsiteMetadata,
} from '../../types';
import { normalizeQuery, extractDomain } from '../../utils/normalize';
import { githubService } from '../github/githubService';
import { gitlabService } from '../gitlab/gitlabService';
import { npmService } from '../npm/npmService';
import { websiteSearch } from '../website/websiteService';
import { externalResult } from '../external/externalProviders';
import { scoreMatch, withConfidence, confidenceLabel } from '../matching/engine';
import { demoGithubResult, demoGitlabResult, demoNpmResult, demoWebsiteResult } from '../demo/demoData';
import { saveSearch } from '../../models/Search';

/** Run one GitHub discovery step; never throws — maps to a ProviderResult. */
async function runGithub(
  query: string,
  githubUsername: string | undefined,
  requireExact: boolean
): Promise<{ result: ProviderResult; anchor?: PublicProfile; repos: PublicRepository[] }> {
  const start = Date.now();
  try {
    let profile: PublicProfile | undefined;
    if (githubUsername) {
      profile = await githubService.getUser(githubUsername);
    } else {
      const candidates = await githubService.searchUsers(query, 5);
      profile = candidates[0] ? await githubService.getUser(candidates[0].username ?? query) : undefined;
      if (profile && requireExact) {
        const q = query.toLowerCase().replace(/\s+/g, '');
        const uname = (profile.username ?? '').toLowerCase();
        const dname = (profile.displayName ?? '').toLowerCase().replace(/\s+/g, '');
        if (!uname.includes(q) && !dname.includes(q)) profile = undefined;
      }
    }
    if (!profile) {
      return { result: { provider: 'github', status: 'NOT_FOUND', durationMs: Date.now() - start }, repos: [] };
    }
    const repos = await githubService.getRepositories(profile.username ?? '', 20);
    const result: ProviderResult = {
      provider: 'github',
      status: 'FOUND',
      profiles: [profile],
      repositories: repos,
      durationMs: Date.now() - start,
    };
    return { result, anchor: profile, repos };
  } catch (err) {
    const apiErr = err as ApiError;
    const isRate = apiErr?.code === 'GITHUB_RATE_LIMIT';
    logger.warn('GitHub provider failed', { code: apiErr?.code });
    return {
      result: {
        provider: 'github',
        status: isRate ? 'RATE_LIMITED' : 'ERROR',
        errorCode: apiErr?.code,
        durationMs: Date.now() - start,
      },
      repos: [],
    };
  }
}

/**
 * Run a full discovery pipeline. Independent providers run concurrently via
 * Promise.allSettled so a single provider failure never destroys the search.
 */
export async function runSearch(rawQuery: string, userId?: string): Promise<SearchResponsePayload> {
  const searchTimeStart = Date.now();
  const nq = normalizeQuery(rawQuery);
  const queryType = nq.queryType;

  const websites: WebsiteMetadata[] = [];
  const packages: NpmPackageSummary[] = [];
  const profiles: PublicProfile[] = [];
  const repositories: PublicRepository[] = [];
  const links: DiscoveryLink[] = [];

  // ── Concurrent provider execution ────────────────────────────────────────
  const [githubRes, gitlabRes, npmRes, websiteRes] = await Promise.allSettled([
    env.demoMode && !nq.githubUsername
      ? Promise.resolve(demoGithubResult(nq.term)).then((r) => ({
          result: r,
          anchor: r.profiles?.[0],
          repos: r.repositories ?? [],
        }))
      : runGithub(nq.term, nq.githubUsername, queryType === 'NAME'),
    queryType === 'NAME'
      ? Promise.resolve(gitlabService.search(''))
      : gitlabService.search(nq.term),
    npmService.search(nq.term),
    websiteSearch(queryType === 'WEBSITE_URL' ? nq.websiteUrl : undefined),
  ]);

  // GitHub (anchor)
  let anchor: PublicProfile | undefined;
  let anchorRepos: PublicRepository[] = [];
  if (githubRes.status === 'fulfilled') {
    const gh = githubRes.value as Awaited<ReturnType<typeof runGithub>>;
    anchor = gh.anchor;
    anchorRepos = gh.repos;
    repositories.push(...anchorRepos);
    if (anchor) profiles.push(anchor);
  }

  // GitLab
  let gitlabResult: ProviderResult | null = null;
  if (gitlabRes.status === 'fulfilled') {
    gitlabResult = gitlabRes.value as ProviderResult;
    if (env.demoMode && queryType !== 'NAME') gitlabResult = demoGitlabResult(nq.term);
    profiles.push(...(gitlabResult.profiles ?? []));
    repositories.push(...(gitlabResult.repositories ?? []));
  }

  // npm
  let npmResult: ProviderResult | null = null;
  if (npmRes.status === 'fulfilled') {
    npmResult = npmRes.value as ProviderResult;
    if (env.demoMode) npmResult = demoNpmResult();
    packages.push(...(npmResult.packages ?? []));
  }

  // Website (from URL query, or discovered from the GitHub profile blog field)
  let websiteResult: WebsiteMetadata | null = null;
  if (websiteRes.status === 'fulfilled') {
    websiteResult = (websiteRes.value as WebsiteMetadata | null) ?? null;
  }
  if (!websiteResult && anchor?.websiteUrl) {
    websiteResult = env.demoMode ? demoWebsiteResult() : await websiteSearch(anchor.websiteUrl);
  } else if (websiteResult && env.demoMode) {
    websiteResult = demoWebsiteResult();
  }
  if (websiteResult) websites.push(websiteResult);

  // ── Cross-platform matching ─────────────────────────────────────────────
  const others = profiles.filter((p) => p !== anchor);
  const scored = anchor
    ? others.map((p) => withConfidence(p, scoreMatch({ anchor, candidate: p, anchorRepositories: anchorRepos, websites })))
    : others;
  const finalProfiles = anchor ? [anchor, ...scored] : others;

  // Website as a pseudo-profile for confidence display (when it matches).
  if (websiteResult && anchor) {
    const siteProfile: PublicProfile = {
      platform: 'website',
      username: extractDomain(websiteResult.finalUrl ?? websiteResult.url),
      displayName: websiteResult.title,
      profileUrl: websiteResult.finalUrl ?? websiteResult.url,
      websiteUrl: websiteResult.url,
      avatarUrl: websiteResult.favicon,
      isDemo: websiteResult.isDemo,
    };
    finalProfiles.push(
      withConfidence(siteProfile, scoreMatch({ anchor, candidate: siteProfile, anchorRepositories: anchorRepos, websites: [websiteResult] }))
    );
  }

  // ── Discovery links ─────────────────────────────────────────────────────
  if (websiteResult) {
    for (const l of websiteResult.socialLinks ?? []) {
      links.push({ platform: 'website', url: l, source: 'website social link' });
    }
  }
  if (anchor?.websiteUrl) {
    links.push({ platform: 'website', url: anchor.websiteUrl, source: 'GitHub profile' });
  }

  // ── Platform states ─────────────────────────────────────────────────────
  const ghStatus = githubRes.status === 'fulfilled'
    ? (githubRes.value as Awaited<ReturnType<typeof runGithub>>).result.status
    : 'ERROR';
    const platformStates: PlatformState[] = [
      { platform: 'github', status: ghStatus, note: env.demoMode ? 'Demo mode — synthetic data.' : undefined, profileCount: anchor ? 1 : 0 },
      { platform: 'gitlab', status: gitlabResult?.status ?? 'ERROR', note: gitlabResult?.note, profileCount: gitlabResult?.profiles?.length ?? 0 },
      { platform: 'npm', status: npmResult?.status ?? 'ERROR', note: npmResult?.note, profileCount: packages.length },
      { platform: 'website', status: websiteResult ? 'FOUND' : 'NOT_FOUND', profileCount: websites.length },
      ...(['linkedin', 'instagram', 'x', 'medium', 'devpost'] as const).map((p) => {
        const r = externalResult(p, p === 'instagram' ? nq.term : nq.raw);
        return {
          platform: r.provider,
          status: r.status,
          note: r.note,
          externalSearchUrl: r.externalSearchUrl,
          profileCount: 0,
        };
      }),
    ];

  const searchTime = Date.now() - searchTimeStart;

  // ── Persist (best-effort; search still works if DB is down) ─────────────
  let searchId = '';
  try {
    searchId = await saveSearch({
      userId,
      query: nq.raw,
      queryType,
      profiles: finalProfiles.map((p) => ({
        platform: p.platform,
        username: p.username,
        displayName: p.displayName,
        profileUrl: p.profileUrl,
        confidence: p.confidence,
        confidenceLabel: p.confidenceLabel,
      })),
      repositoryCount: repositories.length,
      websiteCount: websites.length,
      packageCount: packages.length,
      platformStates,
      durationMs: searchTime,
    });
  } catch (err) {
    logger.warn('Search persistence failed', { error: err instanceof Error ? err.message : '' });
  }

  return {
    searchId,
    query: nq.raw,
    queryType,
    profiles: finalProfiles,
    repositories,
    websites,
    packages,
    platforms: platformStates,
    links,
    searchTime,
  };
}

export function isDemoMode(): boolean {
  return env.demoMode;
}

export { confidenceLabel };



