import { Download, Wallet, Receipt, TrendingUp, PiggyBank } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDate } from '../context/DateContext';
import { analyticsAPI } from '../services/api';
import { useFetch } from '../lib/useFetch';
import { MONTHS, formatMoney } from '../lib/format';
import MonthPicker from '../components/MonthPicker';
import SummaryCard from '../components/SummaryCard';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import SavingsBarChart from '../components/charts/SavingsBarChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import SuggestionCard from '../components/SuggestionCard';
import PageHeader from '../components/ui/PageHeader';
import CategoryIcon from '../components/CategoryIcon';
import { Skeleton } from '../components/ui/Skeleton';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const { month, year, setMonthYear } = useDate();

  const { data, initialLoading } = useFetch(async () => {
    const [a, t] = await Promise.all([analyticsAPI.monthly(month, year), analyticsAPI.trends(6)]);
    return { analytics: a.data, trends: t.data.trends };
  }, [month, year], { errorText: 'Could not load analytics' });

  const summary = data?.analytics?.summary;
  const breakdown = data?.analytics?.breakdown || [];
  const suggestions = data?.analytics?.suggestions || [];
  const trends = data?.trends || [];

  const downloadCsv = () => {
    if (!summary) return;
    const rows = [
      [`Aura Wealth Manager — Monthly Report (${MONTHS[month - 1]} ${year})`],
      [],
      ['Summary'],
      ['Total Income', summary.total_income],
      ['Total Expenses', summary.total_expenses],
      ['Total Investments', summary.total_investments],
      ['Net Savings', summary.savings],
      ['Savings Rate (%)', summary.savings_rate],
      [],
      ['Expense Breakdown'],
      ['Category', 'Amount', 'Share (%)', 'Transactions'],
      ...breakdown.map((b) => [b.category_name, b.total_amount, b.percentage, b.transaction_count]),
    ];
    const csv = rows.map((r) => r.map((c) => (typeof c === 'string' && /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-report-${year}-${String(month).padStart(2, '0')}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        eyebrow={`${MONTHS[month - 1]} ${year}`}
        title="Analytics"
        subtitle="Patterns in how you earn, spend and save."
        actions={
          <>
            <MonthPicker month={month} year={year} onChange={setMonthYear} />
            <button onClick={downloadCsv} disabled={!summary} className="btn-outline !h-11 !px-3.5 sm:!px-4" aria-label="Export CSV" title="Export CSV">
              <Download size={17} /> <span className="hidden sm:inline">Export</span>
            </button>
          </>
        }
      />

      {initialLoading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[104px] rounded-3xl" />)}</div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <SummaryCard title="Income" amount={summary?.total_income} tone="income" icon={<Wallet size={16} />} currency={currency} />
            <SummaryCard title="Expenses" amount={summary?.total_expenses} tone="expense" icon={<Receipt size={16} />} currency={currency} />
            <SummaryCard title="Invested" amount={summary?.total_investments} icon={<TrendingUp size={16} />} currency={currency} />
            <SummaryCard
              title="Saved"
              amount={summary?.savings}
              icon={<PiggyBank size={16} />}
              currency={currency}
              note={`${(summary?.savings_rate ?? 0).toFixed(1)}% savings rate`}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
            <section className="card p-5 sm:p-6">
              <h2 className="section-title mb-5">Spending by category</h2>
              <ExpensePieChart breakdown={breakdown} currency={currency} />
            </section>
            <section className="card p-5 sm:p-6">
              <h2 className="section-title mb-4">Monthly comparison</h2>
              <SavingsBarChart trends={trends} currency={currency} />
            </section>
          </div>

          <section className="card p-5 sm:p-6">
            <h2 className="section-title mb-4">Income vs expenses · last 6 months</h2>
            <TrendLineChart trends={trends} currency={currency} />
          </section>

          {breakdown.length > 0 && (
            <section className="card p-2 sm:p-3">
              <h2 className="section-title px-3 pt-3 pb-2">Category details</h2>
              <div className="divide-y divide-line/60">
                {[...breakdown].sort((a, b) => b.total_amount - a.total_amount).map((b) => (
                  <div key={b.category_name} className="flex items-center gap-3 px-3 py-3">
                    <CategoryIcon type="expense" name={b.category_name} emoji={b.category_icon} color={b.category_color} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14.5px] font-medium truncate">{b.category_name}</p>
                      <p className="text-[12.5px] text-muted">
                        {b.transaction_count} {b.transaction_count === 1 ? 'transaction' : 'transactions'} · {b.percentage}%
                      </p>
                    </div>
                    <p className="text-[15px] font-semibold tabular">{formatMoney(b.total_amount, currency)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {suggestions.length > 0 && (
            <section>
              <h2 className="section-title mb-3">Smart suggestions</h2>
              <div className="grid md:grid-cols-2 gap-3 lg:gap-4">
                {suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} currency={currency} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
