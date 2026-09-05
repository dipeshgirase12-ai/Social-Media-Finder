import { useEffect, useState } from 'react';
import { Users, Search, Clock, AlertTriangle, Flame } from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { SkeletonCard } from '../components/ui/Feedback';

interface AdminStats {
  totalUsers: number;
  totalSearches: number;
  searchesToday: number;
  avgSearchTimeMs: number;
  githubApiCallsThisProcess: number;
  popularQueries: Array<{ query: string; count: number }>;
  providerErrors: Array<{ platform: string; count: number }>;
}

/** Admin dashboard at /admin — aggregates only, no private user data. */
export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((res) => setStats(res.data.stats))
      .catch((err) => {
        setError(errorMessage(err, 'Admin access required.'));
        toast(errorMessage(err), 'error');
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="pt-10 text-center">
        <h1 className="text-xl font-bold">Admin access required</h1>
        <p className="dt-muted mt-2 text-sm">This area is restricted to administrators.</p>
      </div>
    );
  }

  if (loading) return <div className="pt-4"><SkeletonCard lines={3} /></div>;
  if (error || !stats) {
    return <p className="pt-8 text-center text-sm dt-muted">{error || 'Statistics unavailable.'}</p>;
  }

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers },
    { icon: Search, label: 'Total Searches', value: stats.totalSearches },
    { icon: Flame, label: 'Searches Today', value: stats.searchesToday },
    { icon: Clock, label: 'Avg Search Time', value: `${stats.avgSearchTimeMs}ms` },
    { icon: Search, label: 'GitHub API Calls (process)', value: stats.githubApiCallsThisProcess },
    { icon: AlertTriangle, label: 'Provider Error Records', value: stats.providerErrors.reduce((a, b) => a + b.count, 0) },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <p className="dt-muted mt-1 text-sm">Aggregate statistics only — no private user information.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="!p-4">
            <c.icon size={18} className="text-primary-400" aria-hidden />
            <p className="mt-2 text-2xl font-bold">{c.value}</p>
            <p className="dt-muted text-xs">{c.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Popular queries</h2>
          {stats.popularQueries.length === 0 ? (
            <p className="dt-muted mt-2 text-sm">No searches recorded yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.popularQueries.map((q) => (
                <li key={q.query} className="flex items-center justify-between">
                  <span className="truncate">{q.query}</span>
                  <span className="dt-muted text-xs">{q.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-semibold">Provider errors</h2>
          {stats.providerErrors.length === 0 ? (
            <p className="dt-muted mt-2 text-sm">No provider errors recorded.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.providerErrors.map((e) => (
                <li key={e.platform} className="flex items-center justify-between">
                  <span className="capitalize">{e.platform}</span>
                  <span className="text-amber-400">{e.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
