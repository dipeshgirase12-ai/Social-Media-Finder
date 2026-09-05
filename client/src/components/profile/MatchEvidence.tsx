import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import type { MatchEvidence } from '../../types';
import { Modal } from '../ui/Modal';

const KIND_LABELS: Record<string, string> = {
  NAME_SIMILARITY: 'Name',
  USERNAME_SIMILARITY: 'Username',
  CROSS_LINK: 'Cross-link',
  WEBSITE_MATCH: 'Website',
  PROJECT_SIMILARITY: 'Project',
  LOCATION_SIMILARITY: 'Location',
  BIO_SIMILARITY: 'Bio',
};

/** "Why this match?" — itemized, transparent evidence list. */
export function MatchEvidence({ evidence, score }: { evidence?: MatchEvidence[]; score?: number }) {
  const [open, setOpen] = useState(false);
  if (!evidence || evidence.length === 0) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300"
        aria-label="Why this match?"
      >
        <HelpCircle size={13} aria-hidden /> Why?
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Why this match?">
        <p className="dt-muted text-sm mb-4">
          Likely match based on publicly available signals{score !== undefined ? ` — score ${score}/100` : ''}:
        </p>
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {evidence.map((e) => (
              <motion.li
                key={`${e.kind}-${e.description}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-accent-500 mt-0.5" aria-hidden>✓</span>
                <span className="flex-1">
                  <span className="dt-muted text-xs uppercase tracking-wide mr-1.5">
                    +{e.points}/{e.maxPoints} {KIND_LABELS[e.kind] ?? e.kind}
                  </span>
                  {e.description}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <p className="dt-muted text-xs mt-5 border-t dt-border pt-3">
          Matches are probabilistic and may be incorrect. Always verify important information independently.
        </p>
      </Modal>
    </>
  );
}
