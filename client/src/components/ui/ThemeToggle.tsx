import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const OPTIONS = [
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
] as const;

/** Dark / Light / System theme switch, persisted to localStorage. */
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <div className="flex items-center rounded-lg dt-border border p-0.5" role="radiogroup" aria-label="Theme">
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = mode === o.value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            aria-label={`${o.label} theme`}
            onClick={() => setMode(o.value)}
            className={`rounded-md p-1.5 transition-colors ${active ? 'bg-primary-500/20 text-primary-400' : 'dt-muted hover:text-[var(--color-text)]'}`}
          >
            <Icon size={14} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
