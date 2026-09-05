import { Star, GitFork, Scale, Globe, CircleDot } from 'lucide-react';
import type { PublicRepository } from '../../types';
import { formatNumber } from '../../lib/format';
import { Badge } from '../ui/Card';

/** Reusable repository card with health indicator. */
export function RepositoryCard({ repo, delay = 0 }: { repo: PublicRepository; delay?: number }) {
  const health = repo.healthScore;
  const healthTone = health === undefined ? 'neutral' : health >= 70 ? 'success' : health >= 40 ? 'warning' : 'danger';

  return (
    <article
      className="dt-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary-400/40 hover:shadow-glow"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate font-mono text-sm font-semibold text-primary-300 hover:text-primary-200"
          >
            {repo.fullName ?? repo.name}
          </a>
          {repo.description && <p className="dt-muted text-sm mt-1 line-clamp-2">{repo.description}</p>}
        </div>
        {health !== undefined && (
          <div className="shrink-0 text-right" title="Repository health (DevTrace indicator, not an official GitHub score)">
            <Badge tone={healthTone as 'success' | 'warning' | 'danger'}>Health {health}/100</Badge>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs dt-muted">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-400" aria-hidden />
            {repo.language}
          </span>
        )}
        {repo.stars !== undefined && (
          <span className="inline-flex items-center gap-1"><Star size={12} aria-hidden /> {formatNumber(repo.stars)}</span>
        )}
        {repo.forks !== undefined && (
          <span className="inline-flex items-center gap-1"><GitFork size={12} aria-hidden /> {formatNumber(repo.forks)}</span>
        )}
        {repo.openIssues !== undefined && repo.openIssues > 0 && (
          <span className="inline-flex items-center gap-1"><CircleDot size={12} aria-hidden /> {formatNumber(repo.openIssues)}</span>
        )}
        {repo.license && (
          <span className="inline-flex items-center gap-1"><Scale size={12} aria-hidden /> {repo.license}</span>
        )}
        {repo.homepage && (
          <a
            href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300"
          >
            <Globe size={12} aria-hidden /> Homepage
          </a>
        )}
        {repo.isDemo && <Badge tone="warning">DEMO</Badge>}
      </div>

      {repo.topics && repo.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 6).map((t) => (
            <span key={t} className="rounded-full bg-primary-500/10 px-2 py-0.5 text-[11px] text-primary-300">
              {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export function RepositoryGrid({ repositories }: { repositories: PublicRepository[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {repositories.map((r, i) => (
        <RepositoryCard key={`${r.platform}-${r.fullName ?? r.name}`} repo={r} delay={i * 0.04} />
      ))}
    </div>
  );
}
