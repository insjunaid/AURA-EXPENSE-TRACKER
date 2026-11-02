import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';
import AuthShell from '../components/AuthShell';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      toast.success(`Welcome back, ${u?.name?.split(' ')[0] || ''}`.trim());
      navigate('/dashboard');
    } catch (err) {
      toast.error(errorMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your wealth overview."
      panelTitle={<>Quiet clarity<br />for your money.</>}
      panelText="Track income, spending and investments in one calm, beautifully simple place."
      footer={<>New to Aura? <Link to="/register" className="text-ink font-semibold hover:underline underline-offset-4">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="field-label">Email</label>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="field"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="field-label">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
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
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !mt-6">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-canvas/40 border-t-canvas rounded-full animate-spin" /> Signing in…</>
          ) : (
            <>Sign in <ArrowRight size={18} /></>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
