import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

/** App shell: navbar + sidebar + scrollable content + mobile bottom nav. */
export function AppLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Sidebar />
      <main id="main-content" className="lg:pl-60 pb-20 lg:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
