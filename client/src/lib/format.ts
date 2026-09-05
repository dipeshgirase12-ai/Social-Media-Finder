 /** Presentation helpers. */

export function formatNumber(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function formatDate(iso: string | undefined): string {
  if (!iso) return 'Not available';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function relativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export const CONFIDENCE_LABELS: Record<string, string> = {
  very_likely: 'Very likely',
  likely: 'Likely',
  possible: 'Possible',
  weak: 'Weak match',
};

export function confidenceColor(label?: string): string {
  switch (label) {
    case 'very_likely':
      return 'text-accent-500';
    case 'likely':
      return 'text-primary-400';
    case 'possible':
      return 'text-amber-400';
    default:
      return 'dt-muted';
  }
}

export const PLATFORM_LABELS: Record<string, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  npm: 'npm',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  x: 'X',
  medium: 'Medium',
  devpost: 'Devpost',
  website: 'Website',
};

export const PLATFORM_COLORS: Record<string, string> = {
  github: '#8b5cf6',
  gitlab: '#fc6d26',
  npm: '#cb3837',
  linkedin: '#0a66c2',
  instagram: '#e1306c',
  x: '#e7e9ea',
  medium: '#00ab6c',
  devpost: '#008cee',
  website: '#6366f1',
};
