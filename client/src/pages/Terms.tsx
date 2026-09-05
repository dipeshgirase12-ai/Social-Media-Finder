import { FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';

const SECTIONS = [
  {
    title: '1. What DevTrace is',
    body: 'DevTrace is a public information discovery and aggregation tool. It searches publicly available developer profiles and project information across platforms that provide legitimate public APIs or publicly accessible pages, and presents them with transparent, probabilistic confidence scores.',
  },
  {
    title: '2. No guarantees of identity',
    body: 'Profile matches are probabilistic and may be incorrect. DevTrace never claims that discovered accounts belong to the same person. You must verify important information independently before relying on it.',
  },
  {
    title: '3. Acceptable use',
    body: 'You must not use DevTrace for harassment, stalking, discrimination, impersonation, or invasive profiling of any individual or group. You must comply with all applicable laws and the terms of the underlying platforms.',
  },
  {
    title: '4. Data sources and limits',
    body: 'Data comes from official public APIs (GitHub, GitLab, npm) and basic public metadata of websites you explicitly analyze. Platforms without an appropriate public API are shown as "External search" — DevTrace does not scrape or bypass their restrictions. Some data may be incomplete, cached, or unavailable.',
  },
  {
    title: '5. Your account and data',
    body: 'We store only the data necessary to provide the service: your account credentials (password hashed with bcrypt), your search history, and saved public profiles. You may delete your search history at any time from the Privacy Center or your history page.',
  },
  {
    title: '6. Demo mode',
    body: 'When demo mode is enabled, some results are synthetic and clearly labelled with a DEMO badge. Demo data never represents real people and must not be relied upon.',
  },
  {
    title: '7. Disclaimer',
    body: 'The service is provided "as is" without warranties of any kind. Repository health indicators are application-level heuristics — not official platform scores and not assessments of code quality.',
  },
];

/** Terms & disclaimer page at /terms. */
export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-6">
      <div className="text-center">
        <FileText size={32} className="mx-auto text-primary-400" aria-hidden />
        <h1 className="mt-3 text-3xl font-bold">Terms & Disclaimer</h1>
      </div>
      {SECTIONS.map((s) => (
        <Card key={s.title}>
          <h2 className="font-semibold">{s.title}</h2>
          <p className="dt-muted mt-2 text-sm leading-relaxed">{s.body}</p>
        </Card>
      ))}
    </div>
  );
}
