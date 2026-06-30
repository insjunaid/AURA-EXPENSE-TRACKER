import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'INR',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const currencies = [
    { code: 'INR', label: '₹ INR — Indian Rupee', symbol: '₹' },
    { code: 'USD', label: '$ USD — US Dollar', symbol: '$' },
    { code: 'SAR', label: '﷼ SAR — Saudi Riyal', symbol: '﷼' },
    { code: 'AED', label: 'د.إ AED — UAE Dirham', symbol: 'د.إ' },
  ];

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { level: score, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { level: score, label: 'Good', color: 'bg-emerald-500' };
    return { level: score, label: 'Strong', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.currency);
      toast.success('Account created! Welcome aboard! 🚀');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex"
    >
      {/* Left side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-black text-3xl mb-8 shadow-glow-lg font-bold">
            A
          </div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Start Your<br />Financial Journey
          </h1>
          <p className="text-xl text-white/80 max-w-md leading-relaxed">
            Join thousands of users who track, save, and grow their wealth intelligently with Aura.
          </p>

          {/* Features list */}
          <div className="mt-12 space-y-4">
            {['📊 Real-time analytics', '💡 Smart suggestions', '🔒 Secure & private', '📱 Works everywhere'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90 animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-white/10 animate-pulse-soft" />
          <div className="absolute bottom-32 right-32 w-20 h-20 rounded-full bg-white/5 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-dark-50 dark:bg-dark-950">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-2xl font-bold mx-auto mb-4 shadow-glow">
              A
            </div>
          </div>

          <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">Create account</h2>
          <p className="text-dark-500 dark:text-dark-400 mb-8">Fill in the details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Full Name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Email</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="reg-currency" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Currency</label>
              <select
                id="reg-currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input-field"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : 'bg-dark-200 dark:bg-dark-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-dark-500">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input-field"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || formData.password !== formData.confirmPassword}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500 dark:text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
