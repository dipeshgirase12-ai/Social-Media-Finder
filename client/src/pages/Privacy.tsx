import { useState } from 'react';
import { ShieldCheck, Trash2, Lock, EyeOff, Ban, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { searchService, errorMessage } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';

const COMMITMENTS = [
  { icon: EyeOff, title: 'Public information only', text: 'DevTrace aggregates publicly available data from official APIs and legitimately accessible public pages. We never access private accounts, private repositories, or hidden data.' },
  { icon: Lock, title: 'No password collection', text: 'We never ask for platform credentials. The only password DevTrace stores is your own account password, hashed with bcrypt — never in plaintext.' },
  { icon: Ban, title: 'No bypassing security', text: 'We do not bypass CAPTCHA, authentication, robots restrictions, rate limits, paywalls, or access controls of any platform.' },
  { icon: FileText, title: 'Platform policies apply', text: 'External platform data remains subject to the respective platform terms and policies. Matches are probabilistic and may be incorrect — verify important information independently.' },
];

/** Privacy Center at /privacy with self-service history deletion. */
export default function Privacy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteHistory = async (): Promise<void> => {
    setDeleting(true);
    try {
      await searchService.clearHistory();
      toast('Your search history has been deleted.', 'success');
    } catch (err) {
      toast(errorMessage(err, 'Could not delete history.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pt-6">
      <div className="text-center">
        <ShieldCheck size={36} className="mx-auto text-accent-500" aria-hidden />
        <h1 className="mt-3 text-3xl font-bold">Privacy Center</h1>
        <p className="dt-muted mx-auto mt-2 max-w-xl text-sm">
          DevTrace is a public information discovery and aggregation tool. It finds publicly available
          developer profiles and resources that may correspond to a searched identity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {COMMITMENTS.map((c) => (
          <Card key={c.title}>
            <c.icon size={18} className="text-primary-400" aria-hidden />
            <h2 className="mt-2 font-semibold">{c.title}</h2>
            <p className="dt-muted mt-1 text-sm">{c.text}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-semibold">Your controls</h2>
        <p className="dt-muted mt-1 text-sm">
          You can delete your search history at any time. Only data necessary for application
          functionality is stored — no sensitive personal information.
        </p>
        {user ? (
          <Button variant="danger" className="mt-4" loading={deleting} onClick={() => setConfirm(true)}>
            <Trash2 size={14} aria-hidden /> Delete My Search History
          </Button>
        ) : (
          <p className="dt-muted mt-4 text-sm">Sign in to manage your search history.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold">Do not use DevTrace for harm</h2>
        <p className="dt-muted mt-1 text-sm">
          Do not use the service for harassment, stalking, discrimination, impersonation, or invasive
          profiling. Use is subject to our <a href="/terms" className="text-primary-400 hover:text-primary-300">Terms</a>.
        </p>
      </Card>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={deleteHistory}
        title="Delete all search history?"
        message="This permanently removes all of your search history. This cannot be undone."
        confirmLabel="Delete everything"
        danger
      />
    </div>
  );
}
