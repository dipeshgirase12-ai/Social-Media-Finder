import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { searchService, errorMessage } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ui/Modal';
import { EmptyState, SkeletonCard } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { relativeTime } from '../lib/format';
import type { SearchHistoryItem } from '../types';

/** Search history with per-item and bulk delete. */
export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    searchService
      .history()
      .then(setItems)
      .catch((err) => toast(errorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const removeItem = async (id: string): Promise<void> => {
    try {
      await searchService.deleteSearch(id);
      setItems((xs) => xs.filter((x) => x.id !== id));
      toast('Search deleted.', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const clearAll = async (): Promise<void> => {
    try {
      await searchService.clearHistory();
      setItems([]);
      toast('History cleared.', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="dt-kicker">Workspace activity</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Search history</h1>
          <p className="dt-muted mt-1 text-sm">Only data necessary for app functionality is stored.</p>
        </div>
        {items.length > 0 && (
          <Button variant="danger" size="sm" onClick={() => setConfirmClear(true)}>
            <Trash2 size={13} aria-hidden /> Clear all
          </Button>
        )}
      </div>

      {loading ? (
        <SkeletonCard lines={4} />
      ) : items.length === 0 ? (
        <EmptyState title="No searches yet." hints={['Try a username, a full name, or a GitHub URL']} />
      ) : (
        <ul className="space-y-2">
          {items.map((h) => (
            <li key={h.id} className="dt-card flex items-center gap-3 p-4 transition-colors hover:border-primary-400/30">
              <button onClick={() => navigate(`/search/${h.id}`)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-medium text-primary-100">{h.query}</p>
                <p className="dt-muted text-xs">
                  {h.repositoryCount} repos · {h.websiteCount} sites · {h.durationMs}ms · {relativeTime(h.createdAt)}
                </p>
              </button>
              <button
                onClick={() => setDeleteId(h.id)}
                className="dt-muted p-2 hover:text-red-400"
                aria-label={`Delete search ${h.query}`}
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={clearAll}
        title="Clear all history?"
        message="This permanently deletes all of your search history from DevTrace."
        confirmLabel="Clear all"
        danger
      />
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && removeItem(deleteId)}
        title="Delete this search?"
        message="This removes the search record from your history."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
