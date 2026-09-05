import { SearchX, ServerCrash, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

/** Friendly empty state with suggestions. */
export function EmptyState({ title, hints, action }: { title: string; hints?: string[]; action?: ReactNode }) {
  return (
    <div className="dt-card flex flex-col items-center gap-3 p-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500/10 text-primary-300"><SearchX size={22} aria-hidden /></span>
      <p className="font-medium">{title}</p>
      {hints && hints.length > 0 && (
        <ul className="dt-muted text-sm space-y-1">
          {hints.map((h) => (
            <li key={h}>• {h}</li>
          ))}
        </ul>
      )}
      {action}
    </div>
  );
}

/** Friendly error state — never shows raw backend errors. */
export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
}) {
  const Icon = /limit|rate/i.test(title) ? ServerCrash : WifiOff;
  return (
    <div className="dt-card flex flex-col items-center gap-3 p-10 text-center" role="alert">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400"><Icon size={22} aria-hidden /></span>
      <p className="font-medium">{title}</p>
      {message && <p className="dt-muted text-sm max-w-md">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Skeleton placeholder card. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="dt-card p-5 space-y-3" aria-hidden>
      <div className="flex items-center gap-3">
        <div className="dt-skeleton h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="dt-skeleton h-4 w-1/3" />
          <div className="dt-skeleton h-3 w-1/4" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="dt-skeleton h-3" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  );
}
