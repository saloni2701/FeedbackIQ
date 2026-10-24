import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authErrorMessage } from '../api/auth';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back. Sign in to see what your customers are saying.">
      <form onSubmit={onSubmit} noValidate>
        {error && <p role="alert" className="mb-4 rounded-lg border border-neg p-3 text-sm text-neg">{error}</p>}
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <label className="mb-6 flex items-center gap-2 text-sm text-mut">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show password
        </label>
        <button type="submit" disabled={busy || !email || !password} className="min-h-[46px] w-full rounded-lg bg-acc px-5 text-[15px] font-medium text-page disabled:opacity-60">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mb-0 mt-6 text-center text-[15px] text-mut">
        New here? <Link to="/register" className="text-acc hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
