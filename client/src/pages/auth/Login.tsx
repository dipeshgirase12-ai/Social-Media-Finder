import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { errorMessage } from '../../lib/api';
import { ShieldCheck, Sparkles } from 'lucide-react';

/** Shared auth form shell. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[72vh] items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border dt-border bg-[var(--color-card)] shadow-card lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden border-r dt-border bg-gradient-to-br from-primary-600/20 via-[var(--color-card)] to-[var(--color-card)] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="font-semibold tracking-tight">Dev<span className="text-primary-300">Trace</span></p>
            <p className="dt-kicker mt-10">Developer intelligence</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">Public context for better technical decisions.</h2>
          </div>
          <div className="space-y-3 text-sm dt-muted">
            <p className="flex items-center gap-2"><ShieldCheck size={15} className="text-accent-400" /> Public sources only</p>
            <p className="flex items-center gap-2"><Sparkles size={15} className="text-primary-300" /> Explainable match confidence</p>
          </div>
        </div>
        <div className="p-6 sm:p-10">
        <p className="dt-kicker">Secure workspace</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="dt-muted mt-1.5 text-sm">{subtitle}</p>
        <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'dt-input';

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err, 'Could not sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to access your dashboard, history and saved profiles.">
      <form onSubmit={submit} className="space-y-4" aria-label="Sign in">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">Sign in</Button>
        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="dt-muted hover:text-[var(--color-text)]">Forgot password?</Link>
          <Link to="/register" className="text-primary-400 hover:text-primary-300">Create account</Link>
        </div>
      </form>
    </AuthShell>
  );
}
