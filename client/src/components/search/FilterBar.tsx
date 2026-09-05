import { ArrowDownWideNarrow } from 'lucide-react';

export type FilterValue = 'all' | 'developers' | 'github' | 'gitlab' | 'social' | 'websites' | 'projects';
export type SortValue = 'match' | 'followers' | 'repos' | 'active' | 'updated';

const FILTERS: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'developers', label: 'Developers' },
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'social', label: 'Social' },
  { value: 'websites', label: 'Websites' },
  { value: 'projects', label: 'Projects' },
];

export const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: 'match', label: 'Best Match' },
  { value: 'followers', label: 'Most Followers' },
  { value: 'repos', label: 'Most Repositories' },
  { value: 'active', label: 'Most Active' },
  { value: 'updated', label: 'Recently Updated' },
];

interface FilterBarProps {
  filter: FilterValue;
  onFilter: (f: FilterValue) => void;
  sort: SortValue;
  onSort: (s: SortValue) => void;
}

export function FilterBar({ filter, onFilter, sort, onSort }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="tablist" aria-label="Result filters" className="flex max-w-full gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => onFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'dt-border border dt-muted hover:text-[var(--color-text)] hover:bg-surface-overlay'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ArrowDownWideNarrow size={14} className="dt-muted" aria-hidden />
        <label htmlFor="sort-select" className="sr-only">Sort results</label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortValue)}
          className="dt-input !w-auto text-xs py-1.5"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
