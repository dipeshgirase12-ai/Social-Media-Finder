import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { errorMessage, searchService } from '../lib/api';
import { SearchBar } from '../components/search/SearchBar';
import { SearchProgress } from '../components/search/SearchProgress';
import { ErrorState, SkeletonCard } from '../components/ui/Feedback';
import type { SearchResponse } from '../types';

/**
 * Executes a new search from ?q= and forwards to /search/:searchId.
 * Shows progressive discovery UX while the request is in flight.
 */
export default function SearchRun() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get('q') ?? '';

  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [ran, setRan] = useState('');

  const run = useCallback(
    async (q: string) => {
      if (!q || q.length < 2 || running) return;
      setRunning(true);
      setError('');
      setRan(q);
      try {
        const res: SearchResponse = await searchService.search(q);
        // Persistence is best-effort; keep live results usable when MongoDB is unavailable.
        const resultId = res.searchId || `local-${Date.now()}`;
        sessionStorage.setItem(`dt_search_${resultId}`, JSON.stringify(res));
        navigate(`/search/${resultId}`, { replace: true });
      } catch (err) {
        setError(errorMessage(err, 'Search failed. Please try again.'));
      } finally {
        setRunning(false);
      }
    },
    [navigate, running]
  );

  useEffect(() => {
    if (query) void run(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-2xl pt-6">
        <SearchBar onSearch={(q) => navigate(`/search-results?q=${encodeURIComponent(q)}`)} defaultValue={query} size="lg" autoFocus />
      </div>

      {running && (
        <AnimatePresence>
          <SearchProgress visible />
        </AnimatePresence>
      )}

      {error && (
        <ErrorState
          title="Search failed"
          message={error}
          onRetry={() => {
            setError('');
            void run(ran || query);
          }}
        />
      )}

      {!running && !error && !ran && (
        <div className="mx-auto max-w-2xl space-y-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={3} />
        </div>
      )}
    </div>
  );
}
