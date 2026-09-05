import { NavLink, useNavigate } from 'react-router-dom';
import { Bookmark, History, LayoutDashboard, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

const ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/', icon: Search, label: 'Search', end: true },
  { to: '/history', icon: History, label: 'History' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
] as const;

/** Desktop sidebar for signed-in users. */
export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r dt-border bg-[var(--color-card)]/70 pt-20 backdrop-blur-xl lg:flex" aria-label="Sidebar">
      <div className="px-5 pb-6">
        <p className="dt-kicker">Workspace</p>
        <p className="mt-1 font-semibold tracking-tight">Dev<span className="text-primary-300">Trace</span></p>
        <p className="dt-muted mt-1 text-xs">Find. Connect. Understand.</p>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Dashboard sections">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item && item.end}
            className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'border-primary-400/20 bg-primary-400/10 font-medium text-primary-300' : 'dt-muted hover:bg-white/5 hover:text-[var(--color-text)]'
              }`
            }
          >
            <item.icon size={16} aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t dt-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="dt-muted text-xs">Theme</span>
          <ThemeToggle />
        </div>
        {user && (
          <button
            onClick={() => logout().then(() => navigate('/'))}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm dt-muted hover:text-[var(--color-text)] hover:bg-white/5"
          >
            <LogOut size={16} aria-hidden /> Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
