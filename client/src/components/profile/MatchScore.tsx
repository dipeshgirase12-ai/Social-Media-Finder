import { motion } from 'framer-motion';
import { CONFIDENCE_LABELS, confidenceColor } from '../../lib/format';

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Animated circular confidence indicator with label. */
export function MatchScore({ score, label, size = 'md' }: { score: number; label?: string; size?: 'sm' | 'md' }) {
  const clamped = Math.max(0, Math.min(100, score));
  const color = clamped >= 90 ? '#22C55E' : clamped >= 75 ? '#818CF8' : clamped >= 55 ? '#F59E0B' : '#64748B';
  const px = size === 'sm' ? 52 : 68;

  return (
    <div className="flex items-center gap-2.5" title={`Confidence: ${clamped}%`}>
      <svg width={px} height={px} viewBox="0 0 52 52" role="img" aria-label={`Match confidence ${clamped} percent`}>
        <circle cx="26" cy="26" r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="4" />
        <motion.circle
          cx="26"
          cy="26"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - clamped / 100) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          transform="rotate(-90 26 26)"
        />
        <text x="26" y="30" textAnchor="middle" className="fill-current" fontSize="13" fontWeight="700">
          {clamped}%
        </text>
      </svg>
      {label && (
          <span className={`text-xs font-medium ${confidenceColor(label)}`}>
          {CONFIDENCE_LABELS[label] ?? label}
        </span>
      )}
    </div>
  );
}
