import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChartPie, ShieldCheck, TrendingUp, Smartphone, ArrowRight, UtensilsCrossed, Fuel, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { warmUpServer } from '../services/api';
import Logo from '../components/ui/Logo';
import ThemeToggle from '../components/ThemeToggle';

const FEATURES = [
  { icon: ChartPie, title: 'See where it goes', text: 'Category breakdowns and six-month trends, at a glance.' },
  { icon: TrendingUp, title: 'Track what grows', text: 'Investments are kept apart from spending for a true savings picture.' },
  { icon: ShieldCheck, title: 'Private by design', text: 'No bank linking, no trackers. Your data is isolated to your account.' },
  { icon: Smartphone, title: 'Made for your phone', text: 'Add an expense in seconds. Install it to your home screen like an app.' },
];

function PhonePreview() {
  const rows = [
    { icon: UtensilsCrossed, name: 'Food', meta: 'Today · UPI', amt: '−₹480', tint: '#16a34a' },
    { icon: Briefcase, name: 'Salary', meta: 'Yesterday', amt: '+₹85,000', income: true },
    { icon: Fuel, name: 'Petrol', meta: 'Mon, 3 Nov · Card', amt: '−₹2,100', tint: '#ea580c' },
  ];
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -inset-10 bg-[radial-gradient(closest-side,rgb(var(--ink)/0.08),transparent)] -z-10" />
      <div className="rounded-[44px] p-2.5 bg-ink/90 shadow-lift">
        <div className="rounded-[36px] bg-canvas overflow-hidden p-4 pt-6 space-y-3">
          <div className="hero-card p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">Remaining · November</p>
            <p className="font-display text-[42px] leading-none mt-2 tabular">₹48,250</p>
            <div className="mt-4 h-1 rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-white/80" /></div>
            <div className="mt-4 grid grid-cols-3 text-[11px]">
              <div><p className="text-white/50">Income</p><p className="text-emerald-300 font-semibold mt-0.5">₹1.25L</p></div>
              <div><p className="text-white/50">Spent</p><p className="text-rose-300 font-semibold mt-0.5">₹61.7k</p></div>
              <div><p className="text-white/50">Invested</p><p className="font-semibold mt-0.5">₹15k</p></div>
            </div>
          </div>
          <div className="card p-1.5">
            {rows.map(({ icon: Icon, name, meta, amt, tint, income }) => (
              <div key={name} className="flex items-center gap-3 p-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${income ? 'bg-income/10 text-income' : ''}`}
                  style={tint ? { backgroundColor: `${tint}1f`, color: tint } : undefined}
                >
                  <Icon size={16} strokeWidth={1.9} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{name}</p>
                  <p className="text-[11px] text-muted">{meta}</p>
                </div>
                <p className={`text-[13px] font-semibold tabular ${income ? 'text-income' : ''}`}>{amt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();

  // Start waking the backend the moment someone lands here
  useEffect(() => { warmUpServer(); }, []);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-dvh bg-canvas text-ink flex flex-col">
      <header className="sticky top-0 z-20 bg-canvas/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-5 sm:px-8">
          <Logo size={32} subtitle={null} />
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle compact />
            <Link to="/login" className="btn-ghost !h-10 !px-4">Sign in</Link>
            <Link to="/register" className="btn-primary !h-10 !px-4 hidden sm:inline-flex">Get started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
          <div className="animate-rise text-center lg:text-left">
            <p className="eyebrow">Personal wealth manager</p>
            <h1 className="font-display text-[56px] sm:text-[76px] lg:text-[88px] leading-[0.92] tracking-tight mt-4">
              Your money,<br /><span className="italic text-ink-2">beautifully</span> clear.
            </h1>
            <p className="text-[17px] sm:text-lg text-ink-2 mt-6 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Aura tracks your income, spending and investments in one calm place — so you always know what you keep.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/register" className="btn-primary !h-14 !px-7 text-base">
                Start free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-outline !h-14 !px-7 text-base">I have an account</Link>
            </div>
          </div>
          <div className="animate-rise [animation-delay:120ms]">
            <PhonePreview />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6">
                <div className="w-11 h-11 rounded-2xl bg-surface-2 flex items-center justify-center">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 text-[16px] font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-[14px] text-ink-2 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line/70 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-muted">
          <Logo size={24} subtitle={null} />
          <p>© {new Date().getFullYear()} Aura Wealth Manager</p>
        </div>
      </footer>
    </div>
  );
}
