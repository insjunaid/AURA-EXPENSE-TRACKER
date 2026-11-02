import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  House, Receipt, Wallet, TrendingUp, ChartPie, UserRound, LogOut, Plus,
  LayoutGrid, ChevronRight, Moon, Sun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useTheme } from '../context/ThemeContext';
import Logo, { LogoMark } from './ui/Logo';
import Sheet from './ui/Sheet';
import ThemeToggle from './ThemeToggle';

const NAV = [
  { path: '/dashboard', label: 'Home', icon: House },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/income', label: 'Income', icon: Wallet },
  { path: '/investments', label: 'Investments', icon: TrendingUp },
  { path: '/analytics', label: 'Analytics', icon: ChartPie },
  { path: '/profile', label: 'Profile', icon: UserRound },
];

const MORE_PATHS = ['/investments', '/analytics', '/profile'];

function Avatar({ name, size = 'md' }) {
  const s = size === 'sm' ? 'w-9 h-9 text-[13px]' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} rounded-full bg-surface-2 border border-line flex items-center justify-center font-semibold text-ink shrink-0`}>
      {name?.trim()?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

/** Choose what to add — opened by the centre "+" button on phones. */
function AddChooser({ open, onClose, onPick }) {
  const items = [
    { type: 'expense', label: 'Expense', hint: 'Money you spent', icon: Receipt, tone: 'bg-expense/10 text-expense' },
    { type: 'income', label: 'Income', hint: 'Money you received', icon: Wallet, tone: 'bg-income/10 text-income' },
    { type: 'investment', label: 'Investment', hint: 'Money you put to work', icon: TrendingUp, tone: 'bg-surface-2 text-ink' },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Add new" size="sm">
      <div className="space-y-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ type, label, hint, icon: Icon, tone }) => (
          <button
            key={type}
            onClick={() => onPick(type)}
            className="w-full flex items-center gap-4 p-3 rounded-2xl border border-line/70 hover:bg-surface-2/70 active:scale-[0.99] transition text-left"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tone}`}>
              <Icon size={21} strokeWidth={1.9} />
            </div>
            <div className="flex-1">
              <p className="font-semibold tracking-tight">{label}</p>
              <p className="text-[13px] text-muted">{hint}</p>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function MoreSheet({ open, onClose, user, onLogout }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const go = (p) => { onClose(); navigate(p); };
  const links = NAV.filter((n) => MORE_PATHS.includes(n.path));

  return (
    <Sheet open={open} onClose={onClose} size="sm">
      <div className="flex items-center gap-3 pb-4 mb-2 border-b border-line/70">
        <Avatar name={user?.name} />
        <div className="min-w-0">
          <p className="font-semibold truncate">{user?.name}</p>
          <p className="text-[13px] text-muted truncate">{user?.email}</p>
        </div>
      </div>
      <div className="space-y-1">
        {links.map(({ path, label, icon: Icon }) => (
          <button key={path} onClick={() => go(path)} className="w-full flex items-center gap-3 h-14 px-3 rounded-2xl hover:bg-surface-2/70 active:bg-surface-2 transition">
            <Icon size={20} strokeWidth={1.8} className="text-ink-2" />
            <span className="flex-1 text-left font-medium">{label}</span>
            <ChevronRight size={18} className="text-muted" />
          </button>
        ))}
        <button onClick={toggleTheme} className="w-full flex items-center gap-3 h-14 px-3 rounded-2xl hover:bg-surface-2/70 transition">
          {isDark ? <Sun size={20} strokeWidth={1.8} className="text-ink-2" /> : <Moon size={20} strokeWidth={1.8} className="text-ink-2" />}
          <span className="flex-1 text-left font-medium">{isDark ? 'Light appearance' : 'Dark appearance'}</span>
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 h-14 px-3 rounded-2xl hover:bg-expense/5 text-expense transition mb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <LogOut size={20} strokeWidth={1.8} />
          <span className="flex-1 text-left font-medium">Sign out</span>
        </button>
      </div>
    </Sheet>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { openTransaction, confirm } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [addOpen, setAddOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = async () => {
    setMoreOpen(false);
    const ok = await confirm({ title: 'Sign out of Aura?', message: 'Your data stays safe — you can sign back in any time.', confirmLabel: 'Sign out' });
    if (!ok) return;
    logout();
    navigate('/login');
  };

  const moreActive = MORE_PATHS.includes(location.pathname);

  return (
    <div className="min-h-dvh bg-canvas lg:flex">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex sticky top-0 h-dvh w-[264px] shrink-0 flex-col border-r border-line/70 bg-surface/60 backdrop-blur-xl">
        <div className="px-6 pt-7 pb-6">
          <Logo size={38} />
        </div>

        <div className="px-4">
          <button onClick={() => openTransaction('expense')} className="btn-primary w-full">
            <Plus size={18} /> New expense
          </button>
        </div>

        <nav className="flex-1 px-3 pt-6 space-y-0.5" aria-label="Main">
          {NAV.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 h-11 px-3 rounded-xl text-[14.5px] transition-colors ${
                  isActive ? 'bg-surface-2 text-ink font-semibold' : 'text-ink-2 hover:text-ink hover:bg-surface-2/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} strokeWidth={isActive ? 2.1 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-2xl border border-line/70 bg-surface">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[12px] text-muted truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-expense transition">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-canvas/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => navigate('/dashboard')} aria-label="Home">
              <Logo size={30} subtitle={null} />
            </button>
            <div className="flex items-center gap-1">
              <ThemeToggle compact />
              <button onClick={() => navigate('/profile')} aria-label="Profile" className="ml-1">
                <Avatar name={user?.name} size="sm" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 pt-3 lg:pt-10 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-14">
          <div key={location.pathname} className="animate-rise">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile tab bar ──────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/85 backdrop-blur-xl border-t border-line/70 pb-[env(safe-area-inset-bottom)]"
        aria-label="Main"
      >
        <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
          {[NAV[0], NAV[1]].map((item) => <TabLink key={item.path} {...item} />)}

          <div className="flex items-center justify-center">
            <button
              onClick={() => setAddOpen(true)}
              className="w-14 h-14 -mt-6 rounded-[20px] bg-ink text-canvas shadow-fab flex items-center justify-center active:scale-95 transition ring-4 ring-canvas"
              aria-label="Add transaction"
            >
              <Plus size={26} strokeWidth={2.2} />
            </button>
          </div>

          <TabLink {...NAV[2]} />
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 ${moreActive ? 'text-ink' : 'text-muted'}`}
            aria-label="More"
          >
            <LayoutGrid size={22} strokeWidth={moreActive ? 2.1 : 1.7} />
            <span className={`text-[10.5px] ${moreActive ? 'font-semibold' : 'font-medium'}`}>More</span>
          </button>
        </div>
      </nav>

      <AddChooser
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onPick={(type) => { setAddOpen(false); setTimeout(() => openTransaction(type), 180); }}
      />
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} user={user} onLogout={handleLogout} />
    </div>
  );
}

function TabLink({ path, label, icon: Icon }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) => `flex flex-col items-center justify-center gap-1 transition-colors ${isActive ? 'text-ink' : 'text-muted'}`}
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.1 : 1.7} />
          <span className={`text-[10.5px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
        </>
      )}
    </NavLink>
  );
}
