import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';
import { CURRENCIES } from '../lib/format';
import AuthShell from '../components/AuthShell';

function strengthOf(pwd) {
  if (!pwd) return { level: 0, label: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  return { level: score, label: labels[score] };
}

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', currency: 'INR' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const strength = strengthOf(form.password);
  const mismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password, form.currency);
      toast.success('Welcome to Aura');
      navigate('/dashboard');
    } catch (err) {
      toast.error(errorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Takes less than a minute. No bank linking required."
      panelTitle={<>Begin with<br />intention.</>}
      panelText="Know exactly what comes in, what goes out, and what you keep — every month."
      footer={<>Already have an account? <Link to="/login" className="text-ink font-semibold hover:underline underline-offset-4">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reg-name" className="field-label">Full name</label>
          <input id="reg-name" value={form.name} onChange={set('name')} placeholder="Your name" required minLength={2} autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="reg-email" className="field-label">Email</label>
          <input id="reg-email" type="email" inputMode="email" autoCapitalize="none" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className="field" />
        </div>
        <div>
          <span className="field-label">Currency</span>
          <div className="grid grid-cols-4 gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setForm((f) => ({ ...f, currency: c.code }))}
                aria-pressed={form.currency === c.code}
                className={`h-14 rounded-2xl border flex flex-col items-center justify-center transition active:scale-95
                  ${form.currency === c.code ? 'border-ink bg-surface' : 'border-line/70 hover:border-ink/30'}`}
              >
                <span className="text-[15px] font-semibold leading-none">{c.symbol}</span>
                <span className="text-[11px] text-muted mt-1">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="reg-password" className="field-label">Password</label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
              className="field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.level ? (strength.level >= 4 ? 'bg-income' : strength.level >= 3 ? 'bg-ink' : 'bg-expense') : 'bg-line'}`} />
                ))}
              </div>
              <span className="text-[12px] text-muted w-16 text-right">{strength.label}</span>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="reg-confirm" className="field-label">Confirm password</label>
          <input
            id="reg-confirm"
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="Repeat password"
            required
            autoComplete="new-password"
            className={`field ${mismatch ? '!border-expense' : ''}`}
          />
          {mismatch && <p className="text-[12.5px] text-expense mt-1.5">Passwords don't match</p>}
        </div>
        <button type="submit" disabled={loading || mismatch} className="btn-primary w-full !mt-6">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-canvas/40 border-t-canvas rounded-full animate-spin" /> Creating account…</>
          ) : (
            <>Create account <ArrowRight size={18} /></>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
