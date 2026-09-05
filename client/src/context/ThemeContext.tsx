import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolved: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'devtrace_theme';

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'dark';
  });
  const [resolved, setResolved] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const compute = (): 'dark' | 'light' => {
      if (mode === 'system') return systemPrefersDark() ? 'dark' : 'light';
      return mode;
    };
    const apply = (): void => {
      const r = compute();
      setResolved(r);
      document.documentElement.classList.toggle('dark', r === 'dark');
      document.documentElement.classList.toggle('light', r === 'light');
      localStorage.setItem(STORAGE_KEY, mode);
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode: setModeState, resolved }), [mode, resolved]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
