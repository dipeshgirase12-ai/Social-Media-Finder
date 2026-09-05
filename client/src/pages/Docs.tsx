import { BookOpen } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface Endpoint {
  method: string;
  path: string;
  auth: string;
  desc: string;
}

const GROUPS: Array<{ name: string; endpoints: Endpoint[] }> = [
  {
    name: 'Authentication',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', auth: 'Public', desc: 'Create an account (email + password).' },
      { method: 'POST', path: '/api/auth/login', auth: 'Public', desc: 'Sign in; sets an httpOnly JWT cookie and returns a token.' },
      { method: 'POST', path: '/api/auth/logout', auth: 'Public', desc: 'Clear the auth cookie.' },
      { method: 'GET', path: '/api/auth/me', auth: 'Required', desc: 'Current authenticated user.' },
    ],
  },
  {
    name: 'Search & history',
    endpoints: [
      { method: 'POST', path: '/api/search', auth: 'Optional', desc: 'Run a discovery search. Body: { "query": "..." } (2–100 chars). Rate limited.' },
      { method: 'GET', path: '/api/search/:id', auth: 'Public', desc: 'Persisted summary of a previous search.' },
      { method: 'GET', path: '/api/search/history', auth: 'Required', desc: 'Your recent searches.' },
      { method: 'DELETE', path: '/api/search/:id', auth: 'Required', desc: 'Delete one of your search records.' },
      { method: 'DELETE', path: '/api/search/history', auth: 'Required', desc: 'Clear all of your search history.' },
      { method: 'GET', path: '/api/search/:id/export', auth: 'Required', desc: 'Export your search as JSON or CSV (?format=csv).' },
    ],
  },
  {
    name: 'Saved profiles',
    endpoints: [
      { method: 'GET', path: '/api/saved', auth: 'Required', desc: 'List saved public profiles.' },
      { method: 'POST', path: '/api/saved', auth: 'Required', desc: 'Save a public profile.' },
      { method: 'DELETE', path: '/api/saved/:platform/:username', auth: 'Required', desc: 'Remove a saved profile.' },
    ],
  },
  {
    name: 'Platforms',
    endpoints: [
      { method: 'GET', path: '/api/github/users?q=', auth: 'Public', desc: 'Search GitHub users (official API).' },
      { method: 'GET', path: '/api/github/users/:username', auth: 'Public', desc: 'GitHub public profile with README link extraction.' },
      { method: 'GET', path: '/api/github/users/:username/repos', auth: 'Public', desc: 'Public repositories + inferred skills.' },
      { method: 'GET', path: '/api/github/repos/:owner/:repo', auth: 'Public', desc: 'Repository detail with health score.' },
      { method: 'GET', path: '/api/gitlab/users?q=', auth: 'Public', desc: 'Search GitLab users (official API).' },
      { method: 'GET', path: '/api/gitlab/users/:username', auth: 'Public', desc: 'GitLab public profile + public projects.' },
      { method: 'GET', path: '/api/npm/search?q=', auth: 'Public', desc: 'Search the public npm registry.' },
      { method: 'GET', path: '/api/website/analyze?url=', auth: 'Public', desc: 'Public metadata of a single web page. Rate limited.' },
    ],
  },
  {
    name: 'Admin',
    endpoints: [
      { method: 'GET', path: '/api/admin/stats', auth: 'Admin', desc: 'Aggregate usage statistics (no private user data).' },
    ],
  },
];

const METHOD_TONES: Record<string, string> = {
  GET: 'bg-accent-500/10 text-accent-500',
  POST: 'bg-primary-500/10 text-primary-400',
  DELETE: 'bg-red-500/10 text-red-400',
};

/** In-app API documentation at /docs. */
export default function Docs() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pt-6">
      <div className="text-center">
        <BookOpen size={32} className="mx-auto text-primary-400" aria-hidden />
        <h1 className="mt-3 text-3xl font-bold">API Documentation</h1>
        <p className="dt-muted mx-auto mt-2 max-w-xl text-sm">
          All endpoints return <code className="font-mono text-xs">{`{ success, ... }`}</code> on success or{' '}
          <code className="font-mono text-xs">{`{ success: false, error: { code, message } }`}</code> on failure.
          Authentication uses httpOnly JWT cookies or an <code className="font-mono text-xs">Authorization: Bearer</code> header.
        </p>
      </div>

      {GROUPS.map((g) => (
        <Card key={g.name}>
          <h2 className="font-semibold">{g.name}</h2>
          <ul className="mt-3 space-y-2.5">
            {g.endpoints.map((e) => (
              <li key={`${e.method}-${e.path}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <span className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-bold ${METHOD_TONES[e.method]}`}>{e.method}</span>
                <code className="font-mono text-xs text-primary-300">{e.path}</code>
                <span className="dt-muted text-[11px] uppercase">{e.auth}</span>
                <span className="dt-muted w-full text-xs sm:w-auto">{e.desc}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}

      <Card>
        <h2 className="font-semibold">Error codes</h2>
        <p className="dt-muted mt-2 text-sm">
          Common codes: <code className="font-mono text-xs">VALIDATION_ERROR</code>,{' '}
          <code className="font-mono text-xs">RATE_LIMITED</code>,{' '}
          <code className="font-mono text-xs">GITHUB_RATE_LIMIT</code>,{' '}
          <code className="font-mono text-xs">EMAIL_NOT_ALLOWED</code>,{' '}
          <code className="font-mono text-xs">MALFORMED_URL</code>,{' '}
          <code className="font-mono text-xs">NOT_FOUND</code>,{' '}
          <code className="font-mono text-xs">UNAUTHORIZED</code>.
        </p>
      </Card>
    </div>
  );
}
