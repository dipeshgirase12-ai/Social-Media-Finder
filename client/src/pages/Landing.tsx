import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Zap, GitBranch, Globe, Eye, Lock, Search, Code2, Database,
  Server, Layers, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { SearchBar } from '../components/search/SearchBar';
import { PlatformStatusStrip } from '../components/search/PlatformStatusStrip';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';

const FEATURES = [
  { icon: ShieldCheck, title: 'Public data only', text: 'Official APIs and legitimately accessible public information. No scraping, no private data, ever.' },
  { icon: Eye, title: 'Transparent confidence', text: 'Every match shows an explainable score with itemized public evidence — click "Why?" on any result.' },
  { icon: Zap, title: 'Fast concurrent search', text: 'Providers run in parallel with caching and rate limiting for quick, reliable discovery.' },
  { icon: GitBranch, title: 'Repository analysis', text: 'Transparent repository health indicators based on documentation, activity and completeness.' },
  { icon: Globe, title: 'Website detection', text: 'Detects portfolios, GitHub Pages, Vercel and Netlify sites that are publicly discoverable.' },
  { icon: Lock, title: 'Privacy by design', text: 'No email-based identity search, no password collection, delete your history any time.' },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'Search', text: 'Enter a name, username or public URL. Emails are rejected as identity search by design.' },
  { step: 2, title: 'Discover', text: 'DevTrace queries official public APIs concurrently and normalizes the results.' },
  { step: 3, title: 'Match', text: 'A transparent engine scores cross-platform signals and shows the evidence behind each match.' },
  { step: 4, title: 'Understand', text: 'Explore profiles, repositories, skills and websites — all from public sources.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const handleSearch = (q: string) => navigate(`/search-results?q=${encodeURIComponent(q)}`);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b dt-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{ background: 'radial-gradient(700px 360px at 22% 0%, rgba(85,214,190,0.14), transparent), radial-gradient(500px 300px at 90% 80%, rgba(213,242,108,0.08), transparent)' }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="dt-kicker mb-5 inline-flex items-center gap-2">
              <CheckCircle2 size={13} className="text-accent-500" aria-hidden />
              Public intelligence / 01
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              Find the signal in the{' '}
              <span className="text-primary-300">developer footprint.</span>
            </h1>
            <p className="dt-muted mt-6 max-w-xl text-base leading-7 sm:text-lg">
              Search a name, username, or website and quickly discover publicly available developer
              profiles, projects, repositories, and professional links.
            </p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8 max-w-2xl">
              <SearchBar onSearch={handleSearch} size="lg" autoFocus />
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.12 }} className="relative hidden min-h-[320px] lg:block">
            <div className="absolute inset-0 rounded-2xl border border-primary-400/20 bg-[var(--color-card)]/70 p-6 shadow-glow backdrop-blur-sm">
              <div className="flex items-center justify-between border-b dt-border pb-4">
                <span className="dt-kicker">Live network</span>
                <span className="flex items-center gap-2 text-xs text-accent-400"><span className="h-2 w-2 rounded-full bg-accent-400 shadow-[0_0_12px_currentColor]" />Operational</span>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3">
                {[['04', 'sources indexed'], ['92%', 'match confidence'], ['18', 'signals found'], ['2.4s', 'avg. response']].map(([value, label]) => (
                  <div key={label} className="rounded-xl border dt-border bg-[var(--color-bg)]/70 p-4">
                    <p className="text-2xl font-semibold tracking-tight text-primary-300">{value}</p>
                    <p className="dt-muted mt-1 text-xs">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 border-t dt-border pt-4 text-xs dt-muted"><span className="font-mono text-accent-400">01</span> Cross-platform identity matching</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6" aria-label="Supported platforms">
        <PlatformStatusStrip />
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="how-title">
        <p className="dt-kicker text-center">A clear path to context</p>
        <h2 id="how-title" className="mt-3 text-center text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div key={s.step} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="dt-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-400/10 font-mono text-sm font-bold text-primary-300">0{s.step}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="dt-muted mt-1.5 text-sm">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="features-title">
        <h2 id="features-title" className="text-center text-2xl font-bold sm:text-3xl">Built responsible by default</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="dt-card p-5">
              <f.icon size={20} className="text-primary-400" aria-hidden />
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="dt-muted mt-1.5 text-sm">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Example search CTA */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="example-title">
        <div className="dt-card relative overflow-hidden p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden style={{ background: 'radial-gradient(400px 200px at 50% 0%, rgba(34,197,94,0.15), transparent)' }} />
          <h2 id="example-title" className="relative text-2xl font-bold">See it in action</h2>
          <p className="dt-muted relative mx-auto mt-2 max-w-xl text-sm">
            Try a live search — GitHub and GitLab results come from their official public APIs; other platforms offer compliant public search links.
          </p>
          <div className="relative mx-auto mt-6 max-w-xl">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button to="/register" size="lg">Create free account <ArrowRight size={16} aria-hidden /></Button>
            <Button to="/privacy" variant="secondary" size="lg"><ShieldCheck size={16} aria-hidden /> Read the privacy approach</Button>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="tech-title">
        <h2 id="tech-title" className="text-center text-2xl font-bold sm:text-3xl">Under the hood</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Code2, label: 'React + Vite + TypeScript' },
            { icon: Layers, label: 'Tailwind CSS + Framer Motion' },
            { icon: Server, label: 'Node.js + Express + TypeScript' },
            { icon: Database, label: 'MongoDB + Mongoose' },
          ].map((t) => (
            <div key={t.label} className="dt-card flex items-center gap-3 p-4">
              <t.icon size={18} className="text-accent-500" aria-hidden />
              <span className="text-sm">{t.label}</span>
            </div>
          ))}
        </div>
        <div className="dt-card mt-4 p-5">
          <p className="dt-muted text-sm">
            <Search size={14} className="mr-1.5 inline text-primary-400" aria-hidden />
            Architecture: Frontend → API → Controller → Service → Provider → External API → Normalizer →
            Matching Engine → Unified Profile → Cache → Frontend. External APIs are never called directly from the browser.
          </p>
        </div>
      </section>

      {/* Privacy */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="privacy-title">
        <div className="dt-card p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck size={28} className="shrink-0 text-accent-500" aria-hidden />
            <div>
              <h2 id="privacy-title" className="text-xl font-bold">Our commitment</h2>
              <ul className="dt-muted mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <li>✓ Publicly available information only</li>
                <li>✓ No private account access</li>
                <li>✓ No password or credential collection</li>
                <li>✓ No private repository access</li>
                <li>✓ No CAPTCHA or security bypassing</li>
                <li>✓ Delete your search history anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}

