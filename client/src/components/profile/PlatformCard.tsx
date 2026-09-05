import { CheckCircle2, CircleDashed, ExternalLink, AlertTriangle } from 'lucide-react';
import type { PlatformState } from '../../types';
import { PLATFORM_LABELS } from '../../lib/format';

const STATUS_META: Record<string, { icon: typeof CheckCircle2; tone: string; label: string }> = {
  FOUND: { icon: CheckCircle2, tone: 'text-accent-500', label: 'Found' },
  LIKELY: { icon: CheckCircle2, tone: 'text-accent-500', label: 'Likely' },
  POSSIBLE: { icon: CircleDashed, tone: 'text-amber-400', label: 'Possible' },
  NOT_FOUND: { icon: CircleDashed, tone: 'dt-muted', label: 'Not found' },
  UNAVAILABLE: { icon: CircleDashed, tone: 'dt-muted', label: 'External search' },
  RATE_LIMITED: { icon: AlertTriangle, tone: 'text-amber-400', label: 'Rate limited' },
  ERROR: { icon: AlertTriangle, tone: 'text-amber-400', label: 'Unavailable' },
};

/** Compact per-platform status card (provider transparency). */
export function PlatformCard({ state }: { state: PlatformState }) {
  const meta = STATUS_META[state.status] ?? STATUS_META.ERROR;
  const Icon = meta.icon;

  return (
    <div className="dt-card flex items-center gap-3 p-4 transition-colors hover:border-primary-400/30">
      <Icon size={18} className={`shrink-0 ${meta.tone}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{PLATFORM_LABELS[state.platform] ?? state.platform}</p>
        <p className="dt-muted text-xs truncate">
          {state.status === 'FOUND' && state.profileCount
            ? `${state.profileCount} result${state.profileCount > 1 ? 's' : ''}`
            : state.note ?? meta.label}
        </p>
      </div>
      {state.externalSearchUrl && (
        <a
          href={state.externalSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg dt-border border px-2.5 py-1 text-xs hover:bg-white/5"
          aria-label={`Open ${state.platform} public search`}
        >
          Search <ExternalLink size={11} aria-hidden />
        </a>
      )}
    </div>
  );
}
