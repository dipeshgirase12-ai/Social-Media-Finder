import { Link } from 'react-router-dom';

/** Site footer with legal + compliance links. */
export function Footer() {
  return (
    <footer className="border-t dt-border py-10 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-bold">
              Dev<span className="text-primary-400">Trace</span>
            </p>
            <p className="dt-muted text-xs mt-1 max-w-md">
              Public information discovery and aggregation. Profile matches are probabilistic and may be
              incorrect — verify important information independently.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm dt-muted" aria-label="Footer">
            <Link to="/privacy" className="hover:text-[var(--color-text)]">Privacy</Link>
            <Link to="/terms" className="hover:text-[var(--color-text)]">Terms</Link>
            <Link to="/docs" className="hover:text-[var(--color-text)]">API Docs</Link>
            <a href="https://docs.github.com/rest" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text)]">
              GitHub API Policy
            </a>
          </nav>
        </div>
        <p className="dt-muted text-xs mt-8">© {new Date().getFullYear()} DevTrace. Public data only. Built responsibly.</p>
      </div>
    </footer>
  );
}
