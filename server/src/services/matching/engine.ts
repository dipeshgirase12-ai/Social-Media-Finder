import type { MatchEvidence, MatchEvidenceKind, PublicProfile, PublicRepository, WebsiteMetadata } from '../../types';
import { extractDomain, normalizeName, normalizeUsername } from '../../utils/normalize';
import { nameSimilarity, usernameSimilarity } from '../../utils/similarity';

/**
 * Deterministic, explainable matching engine.
 *
 * Weights (total 100):
 *   Name similarity            +25
 *   Username similarity        +20
 *   Cross-link evidence        +25
 *   Website/domain match       +15
 *   Project similarity         +10
 *   Public location similarity +5
 *
 * The engine never claims identity — it produces a probabilistic score plus
 * itemized evidence so users can see exactly WHY a match was suggested.
 */

export interface MatchingInput {
  /** The anchor profile (usually GitHub) against which others are compared. */
  anchor: PublicProfile;
  /** Repositories owned by the anchor profile (used for project similarity). */
  anchorRepositories?: PublicRepository[];
  /** Candidate profile from another platform. */
  candidate: PublicProfile;
  /** Website metadata associated with the candidate or discovered independently. */
  websites?: WebsiteMetadata[];
}

export interface MatchOutput {
  score: number;
  label: 'very_likely' | 'likely' | 'possible' | 'weak';
  evidence: MatchEvidence[];
}

const WEIGHTS: Record<MatchEvidenceKind, number> = {
  NAME_SIMILARITY: 25,
  USERNAME_SIMILARITY: 20,
  CROSS_LINK: 25,
  WEBSITE_MATCH: 15,
  PROJECT_SIMILARITY: 10,
  LOCATION_SIMILARITY: 5,
  BIO_SIMILARITY: 0, // informational only, not scored separately
  // Consolidation bonus: when >=3 independent signal kinds agree, confidence
  // rises above the sum of parts. Transparent and shown in the evidence list.
  CONSISTENCY_BONUS: 10,
};

export function confidenceLabel(score: number): MatchOutput['label'] {
  if (score >= 90) return 'very_likely';
  if (score >= 75) return 'likely';
  if (score >= 55) return 'possible';
  return 'weak';
}

function collectLinks(profile: PublicProfile, websites: WebsiteMetadata[]): string[] {
  const links = [...(profile.outboundLinks ?? [])];
  for (const site of websites) {
    if (site.socialLinks) links.push(...site.socialLinks);
    if (site.githubLinks) links.push(...site.githubLinks);
    if (site.linkedinLinks) links.push(...site.linkedinLinks);
  }
  return links;
}

function linkMentions(links: string[], needle: string): boolean {
  if (!needle) return false;
  const n = needle.toLowerCase();
  return links.some((link) => link.toLowerCase().includes(n));
}

/**
 * Score a candidate profile against the anchor. Pure function: same inputs
 * always produce the same score, which keeps the engine unit-testable.
 */
export function scoreMatch(input: MatchingInput): MatchOutput {
  const { anchor, candidate, anchorRepositories = [], websites = [] } = input;
  const evidence: MatchEvidence[] = [];
  const anchorLinks = collectLinks(anchor, websites);
  const candidateLinks = collectLinks(candidate, websites);
  const candidateDomains = [
    extractDomain(candidate.websiteUrl),
    // For website pseudo-profiles the profile URL itself is the site.
    candidate.platform === 'website' ? extractDomain(candidate.profileUrl) : '',
    ...websites.map((w) => extractDomain(w.finalUrl ?? w.url)),
  ].filter(Boolean);

  // 1. Name similarity (max 25)
  const nameSim = Math.max(
    nameSimilarity(anchor.displayName ?? '', candidate.displayName ?? ''),
    nameSimilarity(anchor.displayName ?? '', candidate.username ?? ''),
    nameSimilarity(anchor.username ?? '', candidate.displayName ?? '')
  );
  if (nameSim >= 0.9) {
    evidence.push({
      kind: 'NAME_SIMILARITY', points: 25, maxPoints: 25,
      description: `Same public name ("${candidate.displayName ?? candidate.username}")`,
    });
  } else if (nameSim >= 0.72) {
    evidence.push({
      kind: 'NAME_SIMILARITY', points: Math.round(25 * nameSim), maxPoints: 25,
      description: `Similar public name ("${anchor.displayName ?? anchor.username}" vs "${candidate.displayName ?? candidate.username}")`,
    });
  }

  // 2. Username similarity (max 20)
  const userSim = usernameSimilarity(anchor.username ?? '', candidate.username ?? '');
  if (userSim === 1) {
    evidence.push({
      kind: 'USERNAME_SIMILARITY', points: 20, maxPoints: 20,
      description: `Identical username ("${candidate.username}")`,
    });
  } else if (userSim >= 0.8) {
    evidence.push({
      kind: 'USERNAME_SIMILARITY', points: Math.round(20 * userSim), maxPoints: 20,
      description: `Similar username ("${anchor.username}" vs "${candidate.username}")`,
    });
  }

  // 3. Cross-link evidence (max 25): anchor links to candidate or vice versa.
  let crossPoints = 0;
  const crossDescriptions: string[] = [];
  const anchorUsername = anchor.username ?? '';
  const candidateUsername = candidate.username ?? '';

  if (candidateUsername && linkMentions(anchorLinks, candidateUsername)) {
    crossPoints += 15;
    crossDescriptions.push(`Anchor profile publicly links to "${candidateUsername}"`);
  }
  if (anchorUsername && linkMentions(candidateLinks, anchorUsername)) {
    crossPoints += 10;
    crossDescriptions.push(`"${candidateUsername}" publicly links back to "${anchorUsername}"`);
  }
  if (candidateDomains[0] && linkMentions(anchorLinks, candidateDomains[0])) {
    crossPoints = Math.max(crossPoints, 20);
    crossDescriptions.push(`Anchor profile publicly links to website "${candidateDomains[0]}"`);
  }
  // Both profiles publicly list the same website — strong cross-platform signal.
  const anchorDomain = extractDomain(anchor.websiteUrl);
  if (anchorDomain && candidateDomains.some((d) => d === anchorDomain)) {
    crossPoints = 25;
    crossDescriptions.push(`Both profiles publicly reference the same website ("${anchorDomain}")`);
  }
  if (crossPoints > 0) {
    evidence.push({
      kind: 'CROSS_LINK', points: Math.min(crossPoints, 25), maxPoints: 25,
      description: crossDescriptions.join('; '),
    });
  }

  // 4. Website match (max 15): candidate's website domain resembles the username.
  const anchorUser = normalizeUsername(anchorUsername);
  for (const domain of candidateDomains) {
    if (!domain || !anchorUser) continue;
    const base = domain.split('.')[0];
    const sim = usernameSimilarity(anchorUser, base);
    if (sim >= 0.9) {
      evidence.push({
        kind: 'WEBSITE_MATCH', points: 15, maxPoints: 15,
        description: `Website domain "${domain}" matches the username`,
      });
      break;
    }
    if (sim >= 0.75) {
      evidence.push({
        kind: 'WEBSITE_MATCH', points: Math.round(15 * sim), maxPoints: 15,
        description: `Website domain "${domain}" is similar to the username`,
      });
      break;
    }
  }

  // 5. Project similarity (max 10): candidate bio/links reference anchor repos.
  if (anchorRepositories.length > 0) {
    const haystack = `${candidate.bio ?? ''} ${candidateLinks.join(' ')}`.toLowerCase();
    for (const repo of anchorRepositories.slice(0, 20)) {
      const repoName = repo.name.toLowerCase();
      if (repoName.length >= 4 && haystack.includes(repoName)) {
        evidence.push({
          kind: 'PROJECT_SIMILARITY', points: 10, maxPoints: 10,
          description: `References the same public project "${repo.name}"`,
        });
        break;
      }
    }
  }

  // 6. Public location similarity (max 5)
  const anchorLoc = normalizeName(anchor.location);
  const candidateLoc = normalizeName(candidate.location);
  if (anchorLoc && candidateLoc && (anchorLoc === candidateLoc || anchorLoc.includes(candidateLoc) || candidateLoc.includes(anchorLoc))) {
    evidence.push({
      kind: 'LOCATION_SIMILARITY', points: 5, maxPoints: 5,
      description: `Same public location ("${candidate.location}")`,
    });
  }

  // Consolidation bonus: multiple independent signal kinds agreeing is stronger
  // evidence than any single signal. +5 per kind beyond two, capped at +10.
  const kinds = new Set(evidence.map((e) => e.kind));
  if (kinds.size >= 3) {
    const bonus = Math.min(10, 5 * (kinds.size - 2));
    evidence.push({
      kind: 'CONSISTENCY_BONUS',
      points: bonus,
      maxPoints: 10,
      description: `${kinds.size} independent public signals agree`,
    });
  }

  const score = Math.min(100, evidence.reduce((sum, e) => sum + e.points, 0));
  return { score, label: confidenceLabel(score), evidence };
}

/** Attach confidence data to a candidate profile (mutates a copy). */
export function withConfidence(profile: PublicProfile, match: MatchOutput): PublicProfile {
  return {
    ...profile,
    confidence: match.score,
    confidenceLabel: match.label,
    evidence: match.evidence,
  };
}

export { WEIGHTS as MATCH_WEIGHTS };

