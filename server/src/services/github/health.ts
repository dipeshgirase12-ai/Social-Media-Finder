import type { PublicRepository, RepositoryHealthBreakdown } from '../../types';

/**
 * Application-level repository quality indicator (0–100).
 *
 * This is NOT an official GitHub score and says nothing about code quality.
 * It transparently measures observable metadata: documentation, activity,
 * popularity, topics, licensing, and completeness.
 */
export function computeRepositoryHealth(repo: {
  description?: string;
  hasReadme?: boolean;
  homepage?: string;
  topics?: string[];
  license?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  pushedAt?: string;
  createdAt?: string;
  language?: string;
}): { score: number; breakdown: RepositoryHealthBreakdown } {
  // Documentation (30): description, README, homepage.
  let documentation = 0;
  if (repo.description) documentation += 12;
  if (repo.hasReadme) documentation += 12;
  if (repo.homepage) documentation += 6;

  // Activity (25): recency of last push.
  let activity = 0;
  if (repo.pushedAt) {
    const days = (Date.now() - new Date(repo.pushedAt).getTime()) / 86_400_000;
    if (days <= 7) activity = 25;
    else if (days <= 30) activity = 20;
    else if (days <= 90) activity = 15;
    else if (days <= 180) activity = 10;
    else if (days <= 365) activity = 6;
    else activity = 2;
  }

  // Popularity (20): log-scaled stars + forks.
  let popularity = 0;
  const stars = repo.stars ?? 0;
  const forks = repo.forks ?? 0;
  popularity += Math.min(14, Math.round(Math.log2(stars + 1) * 2));
  popularity += Math.min(6, Math.round(Math.log2(forks + 1) * 1.5));

  // Topics (10).
  const topicCount = repo.topics?.length ?? 0;
  const topics = Math.min(10, topicCount * 3);

  // License (8).
  const license = repo.license ? 8 : 0;

  // Completeness (7): language + issues + age signal.
  let completeness = 0;
  if (repo.language) completeness += 3;
  if (repo.openIssues !== undefined) completeness += 2;
  if (repo.createdAt) completeness += 2;

  const breakdown: RepositoryHealthBreakdown = {
    documentation,
    activity,
    popularity,
    topics,
    license,
    completeness,
  };

  const score = Math.min(100, documentation + activity + popularity + topics + license + completeness);
  return { score, breakdown };
}

/** Attach health data to a repository (returns a copy). */
export function withHealth(repo: PublicRepository): PublicRepository {
  const { score, breakdown } = computeRepositoryHealth({
    description: repo.description,
    hasReadme: repo.hasReadme,
    homepage: repo.homepage,
    topics: repo.topics,
    license: repo.license,
    stars: repo.stars,
    forks: repo.forks,
    openIssues: repo.openIssues,
    pushedAt: repo.pushedAt,
    createdAt: repo.createdAt,
    language: repo.language,
  });
  return { ...repo, healthScore: score, healthBreakdown: breakdown };
}
