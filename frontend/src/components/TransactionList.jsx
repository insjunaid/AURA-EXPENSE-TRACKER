import { useMemo, useState } from 'react';
import { Search, ArrowDownWideNarrow, CalendarDays, Trash2, ChevronRight, X } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import Money from './ui/Money';
import EmptyState from './ui/EmptyState';
import { TYPES } from '../lib/transactionTypes';
import { relativeDayLabel, parseISODate } from '../lib/format';

/** One tappable transaction row (tap → edit). */
export function TransactionRow({ t, type, currency, onOpen, onDelete, showDate = false }) {
  const cfg = TYPES[type];
  const meta = [
    showDate && relativeDayLabel(t[cfg.dateField]),
    type === 'expense' && t.payment_mode,
    t.notes,
  ].filter(Boolean).join(' · ');

  return (
    <div className="group relative flex items-center">
      <button
        onClick={() => onOpen?.(t)}
        className="flex-1 min-w-0 flex items-center gap-3 px-3 py-3 rounded-2xl text-left
          hover:bg-surface-2/70 active:bg-surface-2 transition-colors"
      >
        <CategoryIcon type={type} name={cfg.titleOf(t)} emoji={t.category?.icon} color={t.category?.color} />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-ink truncate">{cfg.titleOf(t)}</p>
          {meta && <p className="text-[12.5px] text-muted truncate mt-0.5">{meta}</p>}
        </div>
        <Money
          value={t.amount}
          currency={currency}
          sign={cfg.sign}
          className={`text-[15px] font-semibold shrink-0 ${type === 'expense' ? 'text-ink' : type === 'income' ? 'text-income' : 'text-ink'}`}
        />
        <ChevronRight size={16} className="text-muted/60 shrink-0 -mr-1 lg:hidden" />
      </button>
      {onDelete && (
        <button
          onClick={() => onDelete(t)}
          className="hidden lg:flex absolute right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 w-9 h-9 items-center justify-center rounded-xl
            bg-surface border border-line text-muted hover:text-expense hover:border-expense/40 transition"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

/**
 * Searchable list grouped by day ("Today", "Yesterday", "Mon, 3 Nov"),
 * with day subtotals and a sort toggle.
 */
export default function TransactionList({ transactions = [], type = 'expense', currency = 'INR', onOpen, onDelete, onAdd }) {
  const cfg = TYPES[type];
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date | amount

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? transactions.filter((t) =>
          [cfg.titleOf(t), t.notes, t.payment_mode, String(t.amount)].some((v) => v?.toLowerCase().includes(q)))
      : transactions;
    return [...list].sort((a, b) =>
      sortBy === 'amount'
        ? b.amount - a.amount
        : parseISODate(b[cfg.dateField]) - parseISODate(a[cfg.dateField]) || new Date(b.created_at) - new Date(a.created_at));
  }, [transactions, query, sortBy, cfg]);

  const groups = useMemo(() => {
    if (sortBy !== 'date') return [{ key: 'all', label: null, items: filtered }];
    const map = new Map();
    filtered.forEach((t) => {
      const k = t[cfg.dateField];
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(t);
    });
    return [...map.entries()].map(([k, items]) => ({
      key: k,
      label: relativeDayLabel(k),
      total: items.reduce((s, x) => s + x.amount, 0),
      items,
    }));
  }, [filtered, sortBy, cfg]);

  if (transactions.length === 0) {
    return (
      <EmptyState
        type={type}
        title={`No ${cfg.plural.toLowerCase()} this month`}
        message={`Tap below to add your first ${cfg.label.toLowerCase()}.`}
        action={onAdd && <button className="btn-primary" onClick={onAdd}>Add {cfg.label.toLowerCase()}</button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="field pl-11 pr-10 !bg-surface border-line/70"
            aria-label={`Search ${cfg.plural.toLowerCase()}`}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted hover:text-ink" aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setSortBy((s) => (s === 'date' ? 'amount' : 'date'))}
          className="h-12 px-4 rounded-2xl bg-surface border border-line/70 text-[13px] font-medium text-ink-2 hover:text-ink inline-flex items-center gap-2 shrink-0"
          aria-label={`Sort by ${sortBy === 'date' ? 'amount' : 'date'}`}
        >
          {sortBy === 'date' ? <CalendarDays size={16} /> : <ArrowDownWideNarrow size={16} />}
          <span className="hidden sm:inline">{sortBy === 'date' ? 'Newest' : 'Largest'}</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted py-10">No matches for “{query}”.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <section key={g.key} className="card p-1.5">
              {g.label && (
                <header className="flex items-center justify-between px-3 pt-2.5 pb-1">
                  <h3 className="eyebrow">{g.label}</h3>
                  <Money value={g.total} currency={currency} className="text-[12px] text-muted" />
                </header>
              )}
              <div>
                {g.items.map((t) => (
                  <TransactionRow
                    key={t.uuid}
                    t={t}
                    type={type}
                    currency={currency}
                    onOpen={onOpen}
                    onDelete={onDelete}
                    showDate={sortBy !== 'date'}
                  />
                ))}
              </div>
            </section>
          ))}
          <p className="text-center text-[12px] text-muted">
            {filtered.length} of {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      )}
    </div>
  );
}
