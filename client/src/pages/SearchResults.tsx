import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { searchService } from '../lib/api';
import { SearchResultsView } from '../components/search/SearchResultsView';
import { EmptyState, ErrorState, SkeletonCard } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import type { PublicProfile, SearchResponse, SearchSummary } from '../types';

/**
 * Results page at /search/:searchId. Prefers the full payload cached in
 * sessionStorage by SearchRun; falls back to the persisted server summary.
 */
export default function SearchResults() {
  const { searchId } = useParams<{ searchId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [loadedId, setLoadedId] = useState('');

  if (loadedId !== searchId) {
    setLoadedId(searchId ?? '');
    setLoading(true);
    setError('');
    setData(null);
    setSummary(null);
    void (async () => {
      try {
        const cached = sessionStorage.getItem(`dt_search_${searchId}`);
        if (cached) {
          setData(JSON.parse(cached) as SearchResponse);
        } else if (searchId) {
          const res = await searchService.getSearch(searchId);
          setSummary(res.search);
        } else {
          setError('Unknown search.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load this search.');
      } finally {
        setLoading(false);
      }
    })();
  }

  const openProfile = (p: PublicProfile): void => {
    navigate(`/profile/${p.platform}/${encodeURIComponent(p.username ?? p.profileUrl)}`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 pt-6">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    );
  }

  if (error) return <ErrorState title="Could not load search" message={error} />;

  if (data) return <SearchResultsView data={data} onOpenProfile={openProfile} />;

  if (summary) {
    return (
      <div className="space-y-6">
        <div className="dt-card p-6">
          <h1 className="text-xl font-bold">Results for "{summary.query}"</h1>
          <p className="dt-muted mt-1 text-sm">
            {summary.profiles?.length ?? 0} profiles · {summary.repositoryCount} repositories ·{' '}
            {summary.websiteCount} websites · completed in {summary.durationMs}ms
          </p>
          <p className="dt-muted mt-3 text-sm">
            The full result set for this session is not in local storage anymore. Re-run the search to
            see complete results.
          </p>
          <div className="mt-4">
            <Button onClick={() => navigate(`/search-results?q=${encodeURIComponent(summary.query)}`)}>
              Re-run search
            </Button>
          </div>
        </div>
        {(!summary.profiles || summary.profiles.length === 0) && (
          <EmptyState
            title="No public profiles found."
            hints={['a username', 'a full name', 'a GitHub URL']}
          />
        )}
        {(summary.profiles ?? []).map((p) => (
          <div key={`${p.platform}-${p.username}`} className="dt-card flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium">{p.displayName ?? p.username}</p>
              <p className="dt-muted text-xs">
                {p.platform}{p.username ? ` · @${p.username}` : ''}
                {p.confidence !== undefined ? ` · ${p.confidence}%` : ''}
              </p>
            </div>
            <a href={p.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-400 hover:text-primary-300">
              Open ↗
            </a>
          </div>
        ))}
      </div>
    );
  }

  return <EmptyState title="Search not found." hints={['Run a new search from the home page']} />;
}
