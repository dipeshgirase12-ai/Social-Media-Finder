import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, GitFork, Scale, Globe, CircleDot, FileText, ArrowLeft } from 'lucide-react';
import { platformService, errorMessage } from '../lib/api';
import { ErrorState, SkeletonCard } from '../components/ui/Feedback';
import { Card, SectionTitle } from '../components/ui/Card';
import { formatDate, formatNumber, relativeTime } from '../lib/format';
import type { PublicRepository, RepositoryHealthBreakdown } from '../types';

const BREAKDOWN_LABELS: Array<[keyof RepositoryHealthBreakdown, string, number]> = [
  ['documentation', 'Documentation', 30],
  ['activity', 'Activity', 25],
  ['popularity', 'Popularity', 20],
  ['topics', 'Topics', 10],
  ['license', 'License', 8],
  ['completeness', 'Completeness', 7],
];

/** Repository page at /repository/:owner/:repo with transparent health score. */
export default function RepositoryPage() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const [repository, setRepository] = useState<PublicRepository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        if (owner && repo) {
          const r = await platformService.githubRepo(owner, repo);
          if (!cancelled) setRepository(r);
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, 'Could not load this repository.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [owner, repo]);

  if (loading) return <div className="pt-4"><SkeletonCard lines={4} /></div>;

  if (error || !repository) {
    return <div className="pt-8"><ErrorState title="Repository not available" message={error || 'Not found.'} /></div>;
  }

  const health = repository.healthScore ?? 0;

  return (
    <div className="space-y-6 pt-4">
      <Link to="/" className="dt-muted inline-flex items-center gap-1.5 text-sm hover:text-[var(--color-text)]">
        <ArrowLeft size={14} aria-hidden /> Back to search
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b dt-border pb-5">
        <div className="min-w-0">
          <p className="dt-kicker">Repository intelligence</p>
          <h1 className="mt-2 font-mono text-2xl font-semibold text-primary-300">{repository.fullName ?? repository.name}</h1>
          {repository.description && <p className="dt-muted mt-1 max-w-2xl text-sm">{repository.description}</p>}
        </div>
        {repository.healthScore !== undefined && (
          <div className="text-right">
            <p className="text-3xl font-semibold tracking-tight" style={{ color: health >= 70 ? '#22C55E' : health >= 40 ? '#F59E0B' : '#64748B' }}>
              {health}
              <span className="dt-muted text-base font-medium">/100</span>
            </p>
            <p className="dt-muted text-xs">Repository Health</p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div><dt className="dt-muted text-xs">Language</dt><dd className="mt-0.5">{repository.language ?? 'Not available'}</dd></div>
            <div><dt className="dt-muted text-xs">Stars</dt><dd className="mt-0.5 inline-flex items-center gap-1"><Star size={12} aria-hidden />{formatNumber(repository.stars)}</dd></div>
            <div><dt className="dt-muted text-xs">Forks</dt><dd className="mt-0.5 inline-flex items-center gap-1"><GitFork size={12} aria-hidden />{formatNumber(repository.forks)}</dd></div>
            <div><dt className="dt-muted text-xs">Open issues</dt><dd className="mt-0.5 inline-flex items-center gap-1"><CircleDot size={12} aria-hidden />{formatNumber(repository.openIssues)}</dd></div>
            <div><dt className="dt-muted text-xs">License</dt><dd className="mt-0.5 inline-flex items-center gap-1"><Scale size={12} aria-hidden />{repository.license ?? 'None'}</dd></div>
            <div><dt className="dt-muted text-xs">Default branch</dt><dd className="mt-0.5 font-mono text-xs">{repository.defaultBranch ?? '—'}</dd></div>
            <div><dt className="dt-muted text-xs">Created</dt><dd className="mt-0.5">{formatDate(repository.createdAt)}</dd></div>
            <div><dt className="dt-muted text-xs">Updated</dt><dd className="mt-0.5">{formatDate(repository.updatedAt)}</dd></div>
            <div><dt className="dt-muted text-xs">Last push</dt><dd className="mt-0.5">{relativeTime(repository.pushedAt)}</dd></div>
          </dl>
          {repository.homepage && (
            <a
              href={repository.homepage.startsWith('http') ? repository.homepage : `https://${repository.homepage}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300"
            >
              <Globe size={14} aria-hidden /> {repository.homepage}
            </a>
          )}
          {repository.topics && repository.topics.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {repository.topics.map((t) => (
                <span key={t} className="rounded-full bg-primary-500/10 px-2 py-0.5 text-[11px] text-primary-300">{t}</span>
              ))}
            </div>
          )}
          <a
            href={repository.url}
            target="_blank" rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-400"
          >
            View on GitHub <FileText size={12} aria-hidden />
          </a>
        </Card>

        {/* Health breakdown */}
        <div>
          <SectionTitle>Health factors</SectionTitle>
          <Card>
            {repository.healthBreakdown ? (
              <ul className="space-y-3">
                {BREAKDOWN_LABELS.map(([key, label, max]) => {
                  const value = repository.healthBreakdown?.[key] ?? 0;
                  return (
                    <li key={key}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>{label}</span>
                        <span className="dt-muted">{value}/{max}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--color-border)]" role="presentation">
                        <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${(value / max) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="dt-muted text-sm">Not available.</p>
            )}
            <p className="dt-muted mt-4 border-t dt-border pt-3 text-xs">
              A DevTrace application indicator based on documentation, activity, popularity, topics,
              license and completeness. NOT an official GitHub score and says nothing about code quality.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

