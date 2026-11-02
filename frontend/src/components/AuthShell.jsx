import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { warmUpServer } from '../services/api';
import { useServerStatus } from './ServerWakeBanner';
import Logo, { LogoMark } from './ui/Logo';
import ThemeToggle from './ThemeToggle';

/** Small live indicator so users know the backend is starting up. */
export function ServerChip() {
  const { status } = useServerStatus();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 2500);
    warmUpServer();
    return () => clearTimeout(t);
  }, []);

  const online = status === 'online';
  if (!online && !slow) return null;
  return (
    <span className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-surface border border-line/70 text-[12px] text-ink-2 animate-fade-in">
      <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-income' : 'bg-warn animate-pulse-dot'}`} />
      {online ? 'Secure server ready' : 'Starting secure server…'}
    </span>
  );
}

export default function AuthShell({ title, subtitle, children, footer, panelTitle, panelText }) {
  return (
    <div className="min-h-dvh flex bg-canvas">
      {/* Brand panel (desktop) */}
      <div className="hidden lg:flex lg:w-[46%] p-4">
        <div className="hero-card !rounded-[32px] w-full flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="rounded-[14px] bg-white p-0.5"><LogoMark size={36} className="[&_rect]:fill-black [&_path]:stroke-white" /></div>
            <span className="font-display text-3xl">Aura</span>
          </div>

          <div>
            <h1 className="font-display text-[64px] leading-[0.95] tracking-tight">{panelTitle}</h1>
            <p className="text-white/60 text-lg mt-5 max-w-md leading-relaxed">{panelText}</p>
          </div>

          {/* Mini preview card */}
          <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-6 backdrop-blur-sm max-w-sm">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Remaining this month</p>
            <p className="font-display text-5xl mt-2 tabular">₹48,250</p>
            <div className="mt-5 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-[62%] bg-white/80 rounded-full" /></div>
            <div className="mt-4 flex justify-between text-[13px]">
              <span className="text-emerald-300">+ ₹1,25,000 in</span>
              <span className="text-rose-300">− ₹76,750 out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form column */}
      <div className="flex-1 flex flex-col px-5 sm:px-8 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between h-12">
          <Link to="/" className="lg:invisible" aria-label="Aura home"><Logo size={32} subtitle={null} /></Link>
          <ThemeToggle compact />
        </div>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-[400px] animate-rise">
            <ServerChip />
            <h2 className="font-display text-[44px] leading-none tracking-tight mt-5">{title}</h2>
            <p className="text-ink-2 mt-3 mb-8">{subtitle}</p>
            {children}
            {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
