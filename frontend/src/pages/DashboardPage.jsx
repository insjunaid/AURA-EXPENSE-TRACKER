import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Receipt, Wallet, TrendingUp, ChartPie, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDate } from '../context/DateContext';
import { useUI } from '../context/UIContext';
import { incomeAPI, expenseAPI, analyticsAPI } from '../services/api';
import { useFetch } from '../lib/useFetch';
import { greeting, MONTHS } from '../lib/format';
import MonthPicker from '../components/MonthPicker';
import Money from '../components/ui/Money';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import { TransactionRow } from '../components/TransactionList';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

export default function DashboardPage() {
  const { user } = useAuth();
  const { month, year, setMonthYear } = useDate();
  const { openTransaction } = useUI();
  const currency = user?.currency || 'INR';

  const { data, initialLoading } = useFetch(async () => {
    const [a, e, i] = await Promise.all([
      analyticsAPI.monthly(month, year),
      expenseAPI.list(month, year),
      incomeAPI.list(month, year),
    ]);
    return { summary: a.data.summary, breakdown: a.data.breakdown, expenses: e.data, incomes: i.data };
  }, [month, year], { errorText: 'Could not load your dashboard' });

  const firstName = user?.name?.split(' ')[0] || '';

  const header = (
    <div className="flex items-end justify-between gap-3 mb-5">
      <div className="min-w-0">
        <p className="eyebrow mb-1.5">{greeting()}{firstName && `, ${firstName}`}</p>
        <h1 className="font-display text-[40px] sm:text-[44px] leading-[0.95] tracking-tight">Overview</h1>
      </div>
      <MonthPicker month={month} year={year} onChange={setMonthYear} />
    </div>
  );

  if (initialLoading) return <>{header}<DashboardSkeleton /></>;

  const s = data?.summary || { total_income: 0, total_expenses: 0, total_investments: 0, savings: 0, savings_rate: 0 };
  const recent = [
    ...(data?.incomes || []).map((x) => ({ ...x, _type: 'income', _date: x.date_credited })),
    ...(data?.expenses || []).map((x) => ({ ...x, _type: 'expense', _date: x.date_spent })),
  ]
    .sort((a, b) => (b._date.localeCompare(a._date)) || (new Date(b.created_at) - new Date(a.created_at)))
    .slice(0, 6);

  const spentPct = s.total_income > 0 ? Math.min(100, ((s.total_expenses + s.total_investments) / s.total_income) * 100) : 0;

  const actions = [
    { label: 'Expense', icon: Receipt, onClick: () => openTransaction('expense') },
    { label: 'Income', icon: Wallet, onClick: () => openTransaction('income') },
    { label: 'Invest', icon: TrendingUp, onClick: () => openTransaction('investment') },
    { label: 'Insights', icon: ChartPie, to: '/analytics' },
  ];

  return (
    <div className="space-y-5 lg:space-y-6">
      {header}

      {/* ── Balance hero ─────────────────────────────────────────────── */}
      <section className="hero-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">Remaining · {MONTHS[month - 1]}</p>
            <Money
              value={s.savings}
              currency={currency}
              animate
              className="block font-display text-[52px] sm:text-[64px] leading-none tracking-tight mt-3"
              symbolClassName="text-white/50 mr-1"
            />
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-semibold tabular
            ${s.savings_rate >= 0 ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'}`}>
            {s.savings_rate >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(s.savings_rate).toFixed(0)}% saved
          </span>
        </div>

        {/* Spend progress against income */}
        <div className="mt-6">
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-white/80 transition-[width] duration-700" style={{ width: `${spentPct}%` }} />
          </div>
          <p className="text-[12px] text-white/50 mt-2">
            {s.total_income > 0 ? `${spentPct.toFixed(0)}% of income spent or invested` : 'Add your income to track your savings rate'}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-3">
          {[
            ['Income', s.total_income, 'text-emerald-300'],
            ['Spent', s.total_expenses, 'text-rose-300'],
            ['Invested', s.total_investments, 'text-white'],
          ].map(([label, val, cls]) => (
            <div key={label} className="min-w-0">
              <p className="text-[11.5px] text-white/50">{label}</p>
              <Money value={val} currency={currency} animate className={`block text-[15px] sm:text-[18px] font-semibold mt-1 truncate ${cls}`} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick actions ────────────────────────────────────────────── */}
      <section className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map(({ label, icon: Icon, onClick, to }) => {
          const inner = (
            <>
              <span className="w-11 h-11 rounded-2xl bg-surface-2 flex items-center justify-center text-ink">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <span className="text-[12.5px] font-medium text-ink-2">{label}</span>
            </>
          );
          const cls = 'card !shadow-none flex flex-col items-center gap-2 py-3.5 active:scale-[0.97] transition hover:border-ink/20';
          return to
            ? <Link key={label} to={to} className={cls}>{inner}</Link>
            : <button key={label} onClick={onClick} className={cls}>{inner}</button>;
        })}
      </section>

      <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
        {/* ── Spending breakdown ─────────────────────────────────────── */}
        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Where it went</h2>
            <Link to="/analytics" className="text-[13px] font-medium text-muted hover:text-ink inline-flex items-center gap-0.5">
              Details <ChevronRight size={15} />
            </Link>
          </div>
          <ExpensePieChart breakdown={data?.breakdown || []} currency={currency} limit={5} />
        </section>

        {/* ── Recent activity ────────────────────────────────────────── */}
        <section className="card p-2 sm:p-3">
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <h2 className="section-title">Recent activity</h2>
            <Link to="/expenses" className="text-[13px] font-medium text-muted hover:text-ink inline-flex items-center gap-0.5">
              See all <ChevronRight size={15} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-3 pb-3">
              <EmptyState
                compact
                title="Nothing here yet"
                message="Your latest income and expenses will appear here."
                action={<button className="btn-primary" onClick={() => openTransaction('expense')}>Add an expense</button>}
              />
            </div>
          ) : (
            recent.map((t) => (
              <TransactionRow
                key={t.uuid}
                t={t}
                type={t._type}
                currency={currency}
                showDate
                onOpen={(item) => openTransaction(t._type, item)}
              />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
