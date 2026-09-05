import { Globe, Github, Linkedin, Cpu } from 'lucide-react';
import type { WebsiteMetadata } from '../../types';
import { Badge } from '../ui/Card';

const SITE_TYPE_LABELS: Record<string, string> = {
  portfolio: 'Portfolio',
  github_pages: 'GitHub Pages',
  vercel: 'Vercel',
  netlify: 'Netlify',
  personal: 'Personal site',
  other: 'Website',
};

/** Public website metadata card. */
export function WebsiteCard({ website }: { website: WebsiteMetadata }) {
  const url = website.finalUrl ?? website.url;
  return (
    <article className="dt-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary-400/40 hover:shadow-glow">
      <div className="flex items-start gap-3">
        {website.favicon ? (
          <img src={website.favicon} alt="" className="h-10 w-10 rounded-lg border dt-border" loading="lazy" />
        ) : (
          <Globe size={22} className="dt-muted mt-2" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-400 hover:text-primary-300 truncate"
            >
              {website.title || url}
            </a>
            <Badge tone="primary">{SITE_TYPE_LABELS[website.siteType ?? 'other'] ?? 'Website'}</Badge>
            {website.isDemo && <Badge tone="warning">DEMO</Badge>}
          </div>
          <p className="dt-muted text-xs truncate">{url}</p>
          {website.description && <p className="dt-muted text-sm mt-2 line-clamp-2">{website.description}</p>}
        </div>
      </div>

      {website.previewUrl && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 block overflow-hidden rounded-xl border dt-border">
          <img
            src={website.previewUrl}
            alt={website.title ? `${website.title} preview` : 'Website preview'}
            className="h-40 w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
            loading="lazy"
          />
        </a>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {website.githubLinks && website.githubLinks.length > 0 && (
          <a href={website.githubLinks[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 dt-muted hover:text-[var(--color-text)]">
            <Github size={12} aria-hidden /> GitHub link
          </a>
        )}
        {website.linkedinLinks && website.linkedinLinks.length > 0 && (
          <a href={website.linkedinLinks[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 dt-muted hover:text-[var(--color-text)]">
            <Linkedin size={12} aria-hidden /> LinkedIn link
          </a>
        )}
        {website.technologyHints && website.technologyHints.length > 0 && (
          <span className="inline-flex items-center gap-1 dt-muted">
            <Cpu size={12} aria-hidden /> {website.technologyHints.slice(0, 3).join(', ')}
          </span>
        )}
      </div>
    </article>
  );
}
