import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  delay?: number;
}

/** Standard card surface with optional entrance animation. */
export function Card({ children, className = '', interactive, delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={interactive ? { opacity: 0, y: 14 } : false}
      animate={interactive ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={`dt-card p-5 ${interactive ? 'hover:-translate-y-0.5 hover:border-primary-400/40 hover:shadow-glow transition-all' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'primary' | 'warning' | 'danger';
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-surface-overlay dt-muted',
    success: 'bg-accent-500/10 text-accent-500',
    primary: 'bg-primary-500/10 text-primary-300',
    warning: 'bg-amber-500/10 text-amber-400',
    danger: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-primary-400 border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4 border-b dt-border pb-3">
      <h2 className="text-lg font-semibold tracking-tight">{children}</h2>
      {hint && <span className="text-right text-xs dt-muted">{hint}</span>}
    </div>
  );
}
