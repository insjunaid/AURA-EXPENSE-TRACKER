import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDate } from '../context/DateContext';
import { useUI } from '../context/UIContext';
import { apiFor } from '../services/api';
import { useFetch } from '../lib/useFetch';
import { TYPES } from '../lib/transactionTypes';
import { MONTHS } from '../lib/format';
import MonthPicker from '../components/MonthPicker';
import TransactionList from '../components/TransactionList';
import CategoryIcon from '../components/CategoryIcon';
import Money from '../components/ui/Money';
import PageHeader from '../components/ui/PageHeader';
import { ListSkeleton, Skeleton } from '../components/ui/Skeleton';

const SUBTITLES = {
  expense: 'Everything you spent, organised.',
  income: 'Everything coming in.',
  investment: 'Where your wealth is growing.',
};

/** Shared page for Expenses, Income and Investments. */
export default function LedgerPage({ type }) {
  const cfg = TYPES[type];
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const { month, year, setMonthYear } = useDate();
  const { openTransaction, deleteTransaction, categories } = useUI();
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data: items, initialLoading } = useFetch(
    () => apiFor[type].list(month, year).then((r) => r.data),
    [type, month, year],
    { errorText: `Could not load ${cfg.plural.toLowerCase()}` }
  );

  const list = items || [];
  const total = list.reduce((s, x) => s + x.amount, 0);

  // Expense category chips — only categories used this month, by spend
  const usedCategories = useMemo(() => {
    if (type !== 'expense') return [];
    const totals = new Map();
    list.forEach((e) => {
      const id = e.category?.id;
      if (id != null) totals.set(id, (totals.get(id) || 0) + e.amount);
    });
    return categories
      .filter((c) => totals.has(c.id))
      .sort((a, b) => totals.get(b.id) - totals.get(a.id));
  }, [type, list, categories]);

  const visible = categoryFilter === 'all' ? list : list.filter((e) => String(e.category?.id) === categoryFilter);
  const visibleTotal = visible.reduce((s, x) => s + x.amount, 0);
  const largest = list.reduce((m, x) => (x.amount > (m?.amount || 0) ? x : m), null);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={`${MONTHS[month - 1]} ${year}`}
        title={cfg.plural}
        subtitle={SUBTITLES[type]}
        actions={
          <>
            <MonthPicker month={month} year={year} onChange={setMonthYear} />
            <button onClick={() => openTransaction(type)} className="btn-primary hidden lg:inline-flex">
              <Plus size={18} /> Add {cfg.label.toLowerCase()}
            </button>
          </>
        }
      />

      {/* Total summary */}
      {initialLoading ? (
        <Skeleton className="h-[120px] rounded-3xl" />
      ) : (
        <section className="card p-5 sm:p-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-ink-2">
              {categoryFilter === 'all' ? `Total ${cfg.plural.toLowerCase()}` : categories.find((c) => String(c.id) === categoryFilter)?.name}
            </p>
            <Money
              value={categoryFilter === 'all' ? total : visibleTotal}
              currency={currency}
              animate
              className={`block font-display text-[44px] sm:text-[52px] leading-none tracking-tight mt-2 ${type === 'income' ? 'text-income' : ''}`}
            />
          </div>
          <div className="text-right shrink-0">
            <p className="text-[22px] font-semibold tabular leading-none">{visible.length}</p>
            <p className="text-[12px] text-muted mt-1">{visible.length === 1 ? 'entry' : 'entries'}</p>
            {largest && categoryFilter === 'all' && list.length > 1 && (
              <p className="text-[12px] text-muted mt-2 hidden sm:block">
                Largest: <Money value={largest.amount} currency={currency} className="text-ink-2 font-medium" />
              </p>
            )}
          </div>
        </section>
      )}

      {/* Category filter chips (expenses) */}
      {type === 'expense' && usedCategories.length > 1 && (
        <div className="rail">
          <button onClick={() => setCategoryFilter('all')} className={`chip ${categoryFilter === 'all' ? 'chip-active' : ''}`}>All</button>
          {usedCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(String(c.id))}
              className={`chip !pl-1.5 ${categoryFilter === String(c.id) ? 'chip-active' : ''}`}
            >
              <CategoryIcon type="expense" name={c.name} emoji={c.icon} color={c.color} className="!w-6 !h-6 !rounded-full [&_svg]:w-3.5 [&_svg]:h-3.5" />
              {c.name}
            </button>
          ))}
        </div>
      )}

      {initialLoading ? (
        <ListSkeleton rows={6} />
      ) : (
        <TransactionList
          transactions={visible}
          type={type}
          currency={currency}
          onOpen={(item) => openTransaction(type, item)}
          onDelete={(item) => deleteTransaction(type, item)}
          onAdd={() => openTransaction(type)}
        />
      )}
    </div>
  );
}
