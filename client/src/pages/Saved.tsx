import { useCallback, useEffect, useState } from 'react';
import { savedService, errorMessage } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { EmptyState, SkeletonCard } from '../components/ui/Feedback';
import { Badge } from '../components/ui/Card';
import { PLATFORM_LABELS, CONFIDENCE_LABELS } from '../lib/format';
import type { SavedProfileItem } from '../types';

/** Bookmarked public profiles. */
export default function Saved() {
  const { toast } = useToast();
  const [items, setItems] = useState<SavedProfileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    savedService
      .list()
      .then(setItems)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const remove = async (item: SavedProfileItem): Promise<void> => {
    try {
      await savedService.remove(item.platform, encodeURIComponent(item.username));
      setItems((xs) => xs.filter((x) => x.id !== item.id));
      toast('Profile removed.', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  if (loading) return <div className="pt-4"><SkeletonCard lines={4} /></div>;

  return (
    <div className="space-y-6 pt-4">
      <div>
        <p className="dt-kicker">Your shortlist</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Saved profiles</h1>
        <p className="dt-muted mt-1 text-sm">Public profiles you bookmarked for quick access.</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing saved yet."
          hints={['Run a search and press "Save" on a profile card']}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((s) => (
            <article key={s.id} className="dt-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary-400/40 hover:shadow-glow">
              <div className="flex items-start gap-3">
                {s.avatarUrl && (
                  <img src={s.avatarUrl} alt="" className="h-11 w-11 rounded-full border dt-border" loading="lazy" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold">{s.displayName ?? s.username}</h2>
                    <Badge tone="primary">{PLATFORM_LABELS[s.platform] ?? s.platform}</Badge>
                  </div>
                  {s.bio && <p className="dt-muted mt-1 line-clamp-2 text-sm">{s.bio}</p>}
                  <div className="dt-muted mt-2 flex flex-wrap gap-x-3 text-xs">
                    {s.confidence !== undefined && (
                      <span>
                        {s.confidence}% {CONFIDENCE_LABELS[String(s.confidence >= 90 ? 'very_likely' : s.confidence >= 75 ? 'likely' : s.confidence >= 55 ? 'possible' : 'weak')] ?? ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={s.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-400"
                >
                  View profile
                </a>
                <button
                  onClick={() => remove(s)}
                  className="rounded-lg dt-border border px-3 py-1.5 text-xs hover:bg-white/5"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
