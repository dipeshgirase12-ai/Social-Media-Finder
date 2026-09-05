import { NavLink } from 'react-router-dom';
import { Bookmark, History, Home, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/** Mobile bottom navigation: Home / Search / History / Profile. */
export function MobileNav() {
  const { user } = useAuth();

  const items = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/dashboard', icon: Search, label: 'Search' },
    { to: '/history', icon: History, label: 'History' },
    user
      ? { to: '/saved', icon: Bookmark, label: 'Saved' }
      : { to: '/login', icon: User, label: 'Sign in' },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t dt-border bg-[var(--color-card)] pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Mobile">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] ${
                isActive ? 'text-primary-400' : 'dt-muted'
              }`
            }
          >
            <item.icon size={18} aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
