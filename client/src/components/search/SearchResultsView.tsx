import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, LayoutGrid, Network, FileDown, FileSpreadsheet } from 'lucide-react';
import type { PublicProfile, SearchResponse } from '../../types';
import { ProfileCard } from '../profile/ProfileCard';
import { PlatformCard } from '../profile/PlatformCard';
import { WebsiteCard } from '../misc/WebsiteCard';
import { RepositoryGrid } from '../repo/RepositoryCard';
import { SkillChart } from '../skills/SkillChart';
import { RelationshipGraph } from '../graph/RelationshipGraph';
import { FilterBar } from './FilterBar';
import type { FilterValue, SortValue } from './FilterBar';
import { SectionTitle } from '../ui/Card';
import { savedService } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

function matchesFilter(p: PublicProfile, filter: FilterValue): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'developers':
      return p.platform === 'github' || p.platform === 'gitlab';
    case 'github':
      return p.platform === 'github';
    case 'gitlab':
      return p.platform === 'gitlab';
    case 'social':
      return ['linkedin', 'instagram', 'x', 'medium', 'devpost'].includes(p.platform);
    case 'websites':
      return p.platform === 'website';
    default:
      return true;
  }
}

/** Full search results view: filters, sorting, graph, export. */
export function SearchResultsView({ data, onOpenProfile }: { data: SearchResponse; onOpenProfile: (p: PublicProfile) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [sort, setSort] = useState<SortValue>('match');
  const [view, setView] = useState<'grid' | 'graph'>('grid');
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  const skills = useMemo(() => {
    const scores = new Map<string, number>();
    for (const r of data.repositories) {
      const add = (s: string, w: number) => scores.set(s, (scores.get(s) ?? 0) + w);
      if (r.language) add(r.language, 3);
      for (const t of r.topics ?? []) add(t, 1.5);
    }
    return [...scores.entries()]
      .map(([skill, weight]) => ({ skill, weight: Math.round(weight * 10) / 10, count: 0 }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 8);
  }, [data.repositories]);

  const visibleProfiles = useMemo(() => {
    const list = data.profiles.filter((p) => matchesFilter(p, filter));
    const comparators: Record<SortValue, (a: PublicProfile, b: PublicProfile) => number> = {
      match: (a, b) => (b.confidence ?? 0) - (a.confidence ?? 0),
      followers: (a, b) => (b.followers ?? 0) - (a.followers ?? 0),
      repos: (a, b) => (b.publicProjectCount ?? 0) - (a.publicProjectCount ?? 0),
      active: (a, b) => (b.publicProjectCount ?? 0) - (a.publicProjectCount ?? 0),
      updated: (a, b) => (b.confidence ?? 0) - (a.confidence ?? 0),
    };
    return [...list].sort(comparators[sort]);
  }, [data.profiles, filter, sort]);

  const toggleSave = async (p: PublicProfile): Promise<void> => {
    if (!user) {
      toast('Sign in to save profiles.', 'info');
      return;
    }
    const key = `${p.platform}:${p.username ?? p.profileUrl}`;
    try {
      if (savedKeys.has(key)) {
        await savedService.remove(p.platform, encodeURIComponent(p.username ?? p.profileUrl));
        setSavedKeys((s) => {
          const n = new Set(s);
          n.delete(key);
          return n;
        });
        toast('Profile removed from saved.', 'info');
      } else {
        await savedService.save({
          platform: p.platform,
          username: p.username ?? encodeURIComponent(p.profileUrl),
          displayName: p.displayName,
          avatarUrl: p.avatarUrl,
          profileUrl: p.profileUrl,
          bio: p.bio,
          confidence: p.confidence,
        });
        setSavedKeys((s) => new Set(s).add(key));
        toast('Profile saved.', 'success');
      }
    } catch {
      toast('Could not update saved profiles.', 'error');
    }
  };

  const doExport = (format: 'json' | 'csv'): void => {
    if (!user) {
      toast('Sign in to export your searches.', 'info');
      return;
    }
    window.open(`/api/search/${data.searchId}/export?format=${format}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Summary header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b dt-border pb-5">
        <div>
          <p className="dt-kicker">Discovery report</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Search results</h1>
          <p className="dt-muted text-sm">
            Query "{data.query}" · {data.queryType.replace(/_/g, ' ').toLowerCase()} · {data.searchTime}ms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => doExport('json')} className="inline-flex items-center gap-1.5 rounded-lg dt-border border px-3 py-1.5 text-xs hover:bg-surface-overlay" aria-label="Export results as JSON">
            <FileDown size={13} aria-hidden /> JSON
          </button>
          <button onClick={() => doExport('csv')} className="inline-flex items-center gap-1.5 rounded-lg dt-border border px-3 py-1.5 text-xs hover:bg-surface-overlay" aria-label="Export results as CSV">
            <FileSpreadsheet size={13} aria-hidden /> CSV
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg dt-border border px-3 py-1.5 text-xs hover:bg-surface-overlay" aria-label="Print or save as PDF">
            PDF (print)
          </button>
        </div>
      </div>

      {/* Provider status */}
      <section aria-label="Provider status">
        <SectionTitle hint="Compliance status per provider">Providers</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.platforms.map((s) => (
            <PlatformCard key={s.platform} state={s} />
          ))}
        </div>
      </section>

      {/* View toggle + filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} aria-pressed={view === 'grid'} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${view === 'grid' ? 'bg-primary-500 text-white' : 'dt-border border dt-muted hover:text-[var(--color-text)]'}`}>
            <LayoutGrid size={13} aria-hidden /> Cards
          </button>
          <button onClick={() => setView('graph')} aria-pressed={view === 'graph'} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${view === 'graph' ? 'bg-primary-500 text-white' : 'dt-border border dt-muted hover:text-[var(--color-text)]'}`}>
            <Network size={13} aria-hidden /> Graph
          </button>
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs dt-muted">
            <GitBranch size={13} aria-hidden /> {data.profiles.length} profiles · {data.repositories.length} repos · {data.websites.length} sites
          </span>
        </div>
        <FilterBar filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} />
      </div>

      {view === 'graph' ? (
        <RelationshipGraph profiles={data.profiles} repositories={data.repositories} />
      ) : (
        <section aria-label="Discovered profiles">
          {visibleProfiles.length === 0 ? (
            <p className="dt-muted text-sm">No profiles match this filter.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {visibleProfiles.map((p, i) => (
                <ProfileCard
                  key={`${p.platform}-${p.username ?? p.profileUrl}`}
                  profile={p}
                  onOpen={onOpenProfile}
                  onToggleSave={toggleSave}
                  saved={savedKeys.has(`${p.platform}:${p.username ?? p.profileUrl}`)}
                  delay={i * 0.05}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Repositories */}
      {data.repositories.length > 0 && (
        <section aria-label="Public repositories">
          <SectionTitle hint="Health is a DevTrace indicator, not an official GitHub score">Public repositories</SectionTitle>
          <RepositoryGrid repositories={data.repositories.slice(0, 12)} />
        </section>
      )}

      {/* Websites */}
      {data.websites.length > 0 && (
        <section aria-label="Discovered websites" className="space-y-4">
          <SectionTitle>Websites</SectionTitle>
          {data.websites.map((w) => (
            <WebsiteCard key={w.url} website={w} />
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section aria-label="Technical profile">
          <SectionTitle>Technical profile</SectionTitle>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dt-card p-5">
            <SkillChart skills={skills} />
          </motion.div>
        </section>
      )}

    </div>
  );
}


