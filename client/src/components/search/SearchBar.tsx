import { forwardRef, useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  size?: 'md' | 'lg';
  placeholder?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}

const EXAMPLES = ['Rahul Sharma', 'torvalds', 'github.com/torvalds'];

/** Primary search input with example suggestions. */
export const SearchBar = forwardRef<HTMLFormElement, SearchBarProps>(function SearchBar(
  { onSearch, size = 'md', placeholder = 'Search name, username or GitHub URL...', defaultValue, autoFocus },
  ref
) {
  const [value, setValue] = useState(defaultValue ?? '');

  const submit = (e: React.FormEvent): void => {
    e.preventDefault();
    const q = value.trim();
    if (q.length >= 2) onSearch(q);
  };

  return (
    <form ref={ref} onSubmit={submit} role="search" className="w-full">
      <div
        className={`flex items-center gap-2 rounded-xl border border-primary-400/30 bg-[var(--color-input)] p-1.5 shadow-card transition-colors focus-within:border-primary-400/70 ${
          size === 'lg' ? 'shadow-glow' : ''
        }`}
      >
        <Search size={size === 'lg' ? 20 : 17} className="dt-muted ml-2 shrink-0" aria-hidden />
        <label htmlFor="devtrace-search" className="sr-only">
          Search name, username or GitHub URL
        </label>
        <input
          id="devtrace-search"
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          maxLength={100}
          className={`flex-1 bg-transparent outline-none placeholder:text-[var(--color-text-muted)] ${
            size === 'lg' ? 'py-2.5 text-base' : 'py-1.5 text-sm'
          }`}
        />
        <button
          type="submit"
          disabled={value.trim().length < 2}
            className={`rounded-lg bg-primary-500 font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-40 ${
            size === 'lg' ? 'px-6 py-2.5 text-sm' : 'px-4 py-1.5 text-xs'
          }`}
        >
          Search
        </button>
      </div>
      {size === 'lg' && (
        <p className="dt-muted mt-3 text-center text-sm">
          Try:{' '}
          {EXAMPLES.map((ex, i) => (
            <span key={ex}>
              <button
                type="button"
                onClick={() => {
                  setValue(ex);
                  onSearch(ex);
                }}
                className="text-primary-400 hover:text-primary-300 font-mono"
              >
                "{ex}"
              </button>
              {i < EXAMPLES.length - 1 && <span className="mx-1.5">·</span>}
            </span>
          ))}
        </p>
      )}
    </form>
  );
});
