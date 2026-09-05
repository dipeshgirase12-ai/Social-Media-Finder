import { ExternalLink, Bookmark, BookmarkCheck, MapPin, Building2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PublicProfile } from '../../types';
import { PLATFORM_LABELS, formatNumber } from '../../lib/format';
import { Badge } from '../ui/Card';
import { MatchScore } from './MatchScore';
import { MatchEvidence } from './MatchEvidence';

interface ProfileCardProps {
  profile: PublicProfile;
  onOpen?: (p: PublicProfile) => void;
  saved?: boolean;
  onToggleSave?: (p: PublicProfile) => void;
  delay?: number;
}

/** Reusable profile result card with confidence + evidence. */
export function ProfileCard({ profile, onOpen, saved, onToggleSave, delay = 0 }: ProfileCardProps) {
  const name = profile.displayName || profile.username || PLATFORM_LABELS[profile.platform];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className="dt-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary-400/40 hover:shadow-glow"
      aria-label={`${PLATFORM_LABELS[profile.platform]} profile ${profile.username ?? name}`}
    >
      <div className="flex items-start gap-4">
        <img
          src={profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.username ?? name)}`}
          alt=""
          loading="lazy"
          className="h-12 w-12 rounded-full border dt-border object-cover bg-[var(--color-input)]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold truncate">{name}</h3>
            {profile.isDemo && <Badge tone="warning">DEMO</Badge>}
          </div>
          {profile.username && profile.username !== name && (
            <p className="dt-muted text-sm truncate">@{profile.username}</p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <Badge tone="primary">{PLATFORM_LABELS[profile.platform] ?? profile.platform}</Badge>
            {profile.confidence !== undefined && profile.confidence > 0 && (
              <MatchEvidence evidence={profile.evidence} score={profile.confidence} />
            )}
          </div>
        </div>
        {profile.confidence !== undefined && profile.confidence > 0 && (
          <MatchScore score={profile.confidence} label={profile.confidenceLabel} size="sm" />
        )}
      </div>

      {profile.bio && <p className="dt-muted text-sm mt-3 line-clamp-2">{profile.bio}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs dt-muted">
        {profile.location && (
          <span className="inline-flex items-center gap-1"><MapPin size={12} aria-hidden /> {profile.location}</span>
        )}
        {profile.company && (
          <span className="inline-flex items-center gap-1"><Building2 size={12} aria-hidden /> {profile.company}</span>
        )}
        {profile.followers !== undefined && (
          <span className="inline-flex items-center gap-1"><Users size={12} aria-hidden /> {formatNumber(profile.followers)} followers</span>
        )}
        {profile.publicProjectCount !== undefined && (
          <span>{formatNumber(profile.publicProjectCount)} public repos</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {onOpen ? (
          <button
            onClick={() => onOpen(profile)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-400"
          >
            View profile <ExternalLink size={12} aria-hidden />
          </button>
        ) : (
          <a
            href={profile.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-600"
          >
            View profile <ExternalLink size={12} aria-hidden />
          </a>
        )}
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(profile)}
            className="inline-flex items-center gap-1.5 rounded-lg dt-border border px-3 py-1.5 text-xs hover:bg-surface-overlay"
            aria-label={saved ? 'Remove from saved' : 'Save profile'}
          >
            {saved ? <BookmarkCheck size={13} className="text-accent-500" aria-hidden /> : <Bookmark size={13} aria-hidden />}
            {saved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
    </motion.article>
  );
}
