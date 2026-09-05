import { motion } from 'framer-motion';
import { Check, Loader2, Circle, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const STEPS = ['GitHub', 'GitLab', 'Websites', 'npm', 'LinkedIn', 'Instagram'];

const STEPS_BEFORE_OTHERS: Record<string, number> = {
  GitHub: 0,
  GitLab: 1,
  Websites: 2,
  npm: 3,
  LinkedIn: 4,
  Instagram: 5,
};

/**
 * Progressive discovery UI. Stays visible while the request is in flight and
 * animates steps as complete. Never blocks or freezes the page.
 */
export function SearchProgress({ visible }: { visible: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) {
      setStep(0);
      return;
    }
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 450);
    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="dt-card mx-auto max-w-md p-5"
      role="status"
      aria-label="Searching public profiles"
    >
      <p className="mb-4 flex items-center gap-2 text-sm font-medium">
        <Search size={15} className="text-primary-400" aria-hidden />
        Searching public profiles...
      </p>
      <ul className="space-y-2.5">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s} className="flex items-center gap-2.5 text-sm">
              {done ? (
                <Check size={15} className="text-accent-500" aria-hidden />
              ) : active ? (
                <Loader2 size={15} className="animate-spin text-primary-400" aria-hidden />
              ) : (
                <Circle size={15} className="dt-muted opacity-50" aria-hidden />
              )}
              <span className={done ? 'text-[var(--color-text)]' : active ? '' : 'dt-muted'}>{s}</span>
              {s === 'LinkedIn' || s === 'Instagram' ? (
                <span className="ml-auto dt-muted text-xs">External search</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export { STEPS_BEFORE_OTHERS };
