import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { errorMessage } from '../../lib/api';
import { AuthShell } from './Login';

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name || undefined);
      toast('Account created — welcome to DevTrace!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(errorMessage(err, 'Could not create the account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Save searches, keep history, and bookmark public profiles.">
      <form onSubmit={submit} className="space-y-4" aria-label="Register">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">Name (optional)</label>
          <input id="name" type="text" autoComplete="name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="dt-input" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="dt-input" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="dt-input" aria-describedby="pw-hint" />
          <p id="pw-hint" className="dt-muted mt-1 text-xs">At least 8 characters with a letter and a number.</p>
        </div>
        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">Create account</Button>
        <p className="dt-muted text-center text-sm">
          Already registered? <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
