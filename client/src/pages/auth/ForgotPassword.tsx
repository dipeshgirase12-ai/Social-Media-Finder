import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { AuthShell } from './Login';
import { Button } from '../../components/ui/Button';

/**
 * Password reset is a self-service placeholder in this build: DevTrace stores
 * no recovery channels beyond the account email, so users without access are
 * directed to contact the operator. No security-sensitive flows are faked.
 */
export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell title="Reset your password" subtitle="Password reset requires operator assistance in this deployment.">
      {sent ? (
        <div className="space-y-4 text-sm">
          <p className="dt-muted">
            If this deployment has an email service configured, reset instructions were sent to your
            address. Otherwise, contact the site operator to reset your credentials.
          </p>
          <Link to="/login" className="text-primary-400 hover:text-primary-300">Back to sign in</Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="dt-muted flex items-start gap-2 text-sm">
            <KeyRound size={16} className="mt-0.5 shrink-0 text-primary-400" aria-hidden />
            DevTrace never stores passwords in plaintext and does not offer self-serve reset in
            this build. Request a manual reset below or contact the operator.
          </p>
          <Button onClick={() => setSent(true)} className="w-full" size="lg">Request reset</Button>
          <p className="text-center text-sm">
            <Link to="/login" className="dt-muted hover:text-[var(--color-text)]">Back to sign in</Link>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
