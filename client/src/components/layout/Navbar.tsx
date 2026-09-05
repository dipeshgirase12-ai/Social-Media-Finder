import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, LayoutDashboard, LogOut, Search, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

/** Top navigation bar. */
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const canGoBack = window.history.length > 1;

  return (
    <header className="sticky top-0 z-50 border-b dt-border bg-[var(--color-bg)]">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-1.5 px-3 sm:h-16 sm:gap-4 sm:px-6" aria-label="Main">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={!canGoBack}
          className="dt-muted rounded-lg p-2 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft size={18} aria-hidden />
        </button>
        <Link to="/" className="flex shrink-0 items-center gap-2 font-bold tracking-tight text-lg" aria-label="DevTrace home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-400/40 bg-primary-400/10">
            <Github size={17} className="text-primary-300" aria-hidden />
          </span>
          <span className="hidden sm:inline">Dev<span className="text-primary-400">Trace</span></span>
        </Link>

        <div className="ml-6 hidden items-center gap-1 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'text-primary-300' : 'dt-muted hover:text-[var(--color-text)]'}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/docs"
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? 'text-primary-400' : 'dt-muted hover:text-[var(--color-text)]'}`}
          >
            API Docs
          </NavLink>
          <NavLink
            to="/privacy"
            className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? 'text-primary-400' : 'dt-muted hover:text-[var(--color-text)]'}`}
          >
            Privacy
          </NavLink>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <Button to="/dashboard" variant="secondary" size="sm" className="px-2 sm:px-3">
                <LayoutDashboard size={14} aria-hidden /> <span className="hidden sm:inline">Dashboard</span>
              </Button>
              {user.role === 'admin' && (
                <Button to="/admin" variant="ghost" size="sm" aria-label="Admin dashboard">
                  <Shield size={14} aria-hidden />
                </Button>
              )}
              <button
                onClick={() => logout().then(() => navigate('/'))}
                className="dt-muted hover:text-[var(--color-text)] p-2"
                aria-label="Sign out"
              >
                <LogOut size={16} aria-hidden />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button to="/login" variant="ghost" size="sm" className="px-2 sm:px-3">
                Sign in
              </Button>
              <Button to="/register" size="sm" className="px-2 sm:px-3">
                <Search size={14} aria-hidden /> <span className="hidden sm:inline">Get started</span>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
