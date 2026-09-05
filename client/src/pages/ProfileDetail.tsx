import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Globe, MapPin, Building2, Users } from 'lucide-react';
import { platformService, errorMessage } from '../lib/api';
import { ErrorState, SkeletonCard } from '../components/ui/Feedback';
import { Badge, Card, SectionTitle } from '../components/ui/Card';
import { RepositoryGrid } from '../components/repo/RepositoryCard';
import { SkillChart } from '../components/skills/SkillChart';
import { MatchEvidence } from '../components/profile/MatchEvidence';
import { MatchScore } from '../components/profile/MatchScore';
import { PLATFORM_LABELS, formatNumber } from '../lib/format';
import type { PublicProfile, PublicRepository } from '../types';

interface ProfileData {
  repositories: PublicRepository[];
  skills: Array<{ skill: string; weight: number; count: number }>;
}

/** Profile detail at /profile/:platform/:username — public data only. */
export default function ProfileDetail() {
  const { platform, username } = useParams<{ platform: string; username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        if (platform === 'github' && username) {
          const user = await platformService.githubUser(username);
          const repos = await platformService.githubRepos(username);
          if (!cancelled) {
            setProfile(user);
            setData(repos);
          }
        } else if (platform === 'gitlab' && username) {
          const res = await platformService.gitlabUser(username);
          if (!cancelled) {
            setProfile(res.user);
            setData({ repositories: res.projects, skills: [] });
          }
        } else {
          setError(
            `${PLATFORM_LABELS[platform ?? ''] ?? platform} does not provide a public profile API through this integration. Use the search page for compliant public search links.`
          );
        }
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, 'Could not load this profile.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [platform, username]);

  if (loading) {
    return <div className="space-y-4 pt-4"><SkeletonCard lines={3} /><SkeletonCard lines={2} /></div>;
  }

  if (error || !profile) {
    return (
      <div className="pt-8">
        <ErrorState title="Profile not available" message={error || 'Profile not found.'} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4">
      {/* Overview */}
      <Card className="relative overflow-hidden !p-6 sm:!p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-primary-500/10 to-transparent" aria-hidden />
        <div className="flex flex-wrap items-start gap-5">
          <img
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.username ?? 'dev')}`}
            alt=""
            className="h-20 w-20 rounded-full border dt-border"
          />
          <div className="min-w-0 flex-1">
            <p className="dt-kicker">Public profile</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">{profile.displayName ?? profile.username}</h1>
              <Badge tone="primary">{PLATFORM_LABELS[profile.platform] ?? profile.platform}</Badge>
              {profile.isDemo && <Badge tone="warning">DEMO</Badge>}
            </div>
            {profile.username && <p className="dt-muted">@{profile.username}</p>}
            {profile.bio && <p className="mt-2 max-w-2xl text-sm">{profile.bio}</p>}
            <div className="dt-muted mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {profile.location && <span className="inline-flex items-center gap-1"><MapPin size={12} aria-hidden />{profile.location}</span>}
              {profile.company && <span className="inline-flex items-center gap-1"><Building2 size={12} aria-hidden />{profile.company}</span>}
              {profile.followers !== undefined && <span className="inline-flex items-center gap-1"><Users size={12} aria-hidden />{formatNumber(profile.followers)} followers</span>}
              {profile.websiteUrl && (
                <a href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-400">
                  <Globe size={12} aria-hidden /> Website
                </a>
              )}
            </div>
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-400"
            >
              View on {PLATFORM_LABELS[profile.platform] ?? profile.platform} <ExternalLink size={12} aria-hidden />
            </a>
          </div>
          {profile.confidence !== undefined && profile.confidence > 0 && (
            <div className="flex flex-col items-end gap-1">
              <MatchScore score={profile.confidence} label={profile.confidenceLabel} />
              <MatchEvidence evidence={profile.evidence} score={profile.confidence} />
            </div>
          )}
        </div>
      </Card>

      {/* Repositories */}
      {data && data.repositories.length > 0 && (
        <section aria-label="Public repositories">
          <SectionTitle hint="From public repositories">Projects & repositories</SectionTitle>
          <RepositoryGrid repositories={data.repositories.slice(0, 10)} />
        </section>
      )}

      {/* Skills */}
      {data && data.skills.length > 0 && (
        <section aria-label="Technical profile">
          <SectionTitle>Technical profile</SectionTitle>
          <Card>
            <SkillChart skills={data.skills} />
          </Card>
        </section>
      )}
    </div>
  );
}

