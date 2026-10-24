import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authErrorMessage } from '../api/auth';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function validate(): string | null {
    if (name.trim().length < 2) return 'Please enter your name.';
    if (!EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Your password needs at least 8 characters.';
    if (password.length > 64) return 'Your password can have at most 64 characters.';
    if (password !== confirm) return 'The two passwords do not match.';
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const type = show ? 'text' : 'password';
  return (
    <AuthLayout title="Create your account" subtitle="It takes less than a minute.">
      <form onSubmit={onSubmit} noValidate>
        {error && <p role="alert" className="mb-4 rounded-lg border border-neg p-3 text-sm text-neg">{error}</p>}
        <Field label="Full name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type={type} autoComplete="new-password" required hint="At least 8 characters." value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field label="Confirm password" type={type} autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <label className="mb-6 flex items-center gap-2 text-sm text-mut">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
        </label>
        <button type="submit" disabled={busy} className="min-h-[46px] w-full rounded-lg bg-acc px-5 text-[15px] font-medium text-page disabled:opacity-60">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mb-0 mt-6 text-center text-[15px] text-mut">
        Already have an account? <Link to="/login" className="text-acc hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
