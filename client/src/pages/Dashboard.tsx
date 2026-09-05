import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Globe, Search, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchService } from '../lib/api';
import { SearchBar } from '../components/search/SearchBar';
import { Card } from '../components/ui/Card';
import { relativeTime } from '../lib/format';
import type { SearchHistoryItem } from '../types';

const PLATFORM_CARDS = [
  { name: 'GitHub', note: 'Official REST API', tone: 'text-primary-400' },
  { name: 'GitLab', note: 'Official REST API', tone: 'text-orange-400' },
  { name: 'npm', note: 'Public registry', tone: 'text-red-400' },
  { name: 'Websites', note: 'Metadata analysis', tone: 'text-accent-500' },
];

/** Signed-in landing view: quick search, stats, recent searches. */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchService
      .history()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = history.reduce(
    (acc, h) => ({
      repos: acc.repos + (h.repositoryCount ?? 0),
      sites: acc.sites + (h.websiteCount ?? 0),
    }),
    { repos: 0, sites: 0 }
  );

  const statCards = [
    { icon: Search, label: 'Searches', value: history.length },
    { icon: Users, label: 'Profiles Found', value: history.length > 0 ? '✓' : '—' },
    { icon: GitBranch, label: 'Repositories Analyzed', value: totals.repos },
    { icon: Globe, label: 'Websites Detected', value: totals.sites },
  ];

  return (
    <div className="space-y-8 pt-4">
      <div>
        <p className="dt-kicker">Workspace overview</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Good to see you{user?.name ? `, ${user.name}` : ''}.</h1>
        <p className="dt-muted mt-2 text-sm">Discover public developer profiles and technical context faster.</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <SearchBar onSearch={(q) => navigate(`/search-results?q=${encodeURIComponent(q)}`)} size="lg" />
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Your statistics">
        {statCards.map((s) => (
          <Card key={s.label} className="!p-4">
            <div className="flex items-center justify-between"><s.icon size={17} className="text-primary-300" aria-hidden /><span className="h-1.5 w-1.5 rounded-full bg-accent-500" /></div>
            <p className="mt-4 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="dt-muted text-xs">{s.label}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent searches */}
        <Card>
          <div className="flex items-center justify-between"><div><p className="dt-kicker">Activity</p><h2 className="mt-1 font-semibold">Recent searches</h2></div><span className="text-xs dt-muted">Last 8</span></div>
          {loading ? (
            <p className="dt-muted mt-3 text-sm">Loading…</p>
          ) : history.length === 0 ? (
            <p className="dt-muted mt-3 text-sm">
              No searches yet. Try searching for a developer above.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.slice(0, 8).map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => navigate(`/search/${h.id}`)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-overlay"
                  >
                    <span className="truncate font-medium">{h.query}</span>
                    <span className="dt-muted shrink-0 text-xs">{relativeTime(h.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Popular platforms */}
        <Card>
          <div><p className="dt-kicker">Coverage</p><h2 className="mt-1 font-semibold">Connected sources</h2></div>
          <ul className="mt-3 space-y-2.5">
            {PLATFORM_CARDS.map((p) => (
              <li key={p.name} className="flex items-center gap-3 text-sm">
                <span className={`h-2 w-2 rounded-full bg-current ${p.tone}`} aria-hidden />
                <span className="font-medium">{p.name}</span>
                <span className="dt-muted ml-auto text-xs">{p.note}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
