import { useState } from 'react';

export default function TransactionList({
  transactions = [],
  type = 'expense', // 'expense' or 'income'
  currency = '₹',
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount'
  const [sortDir, setSortDir] = useState('desc');

  const isExpense = type === 'expense';
  const isIncome = type === 'income';
  const isInvestment = type === 'investment';

  // Filter
  const filtered = transactions.filter(t => {
    const term = search.toLowerCase();
    if (isExpense) {
      return (
        t.category?.name?.toLowerCase().includes(term) ||
        t.notes?.toLowerCase().includes(term) ||
        t.amount?.toString().includes(term)
      );
    } else if (isIncome) {
      return (
        t.source?.toLowerCase().includes(term) ||
        t.notes?.toLowerCase().includes(term) ||
        t.amount?.toString().includes(term)
      );
    } else {
      return (
        t.asset_type?.toLowerCase().includes(term) ||
        t.notes?.toLowerCase().includes(term) ||
        t.amount?.toString().includes(term)
      );
    }
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const dateField = isExpense ? 'date_spent' : isIncome ? 'date_credited' : 'date_invested';
    if (sortBy === 'date') {
      return sortDir === 'desc'
        ? new Date(b[dateField]) - new Date(a[dateField])
        : new Date(a[dateField]) - new Date(b[dateField]);
    }
    return sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount;
  });

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
  };

  if (transactions.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-6xl mb-4">{isExpense ? '💳' : '💰'}</div>
        <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-300 mb-2">
          No {isExpense ? 'expenses' : isIncome ? 'income' : 'investments'} yet
        </h3>
        <p className="text-sm text-dark-500 dark:text-dark-400">
          Start tracking by adding your first {isExpense ? 'expense' : isIncome ? 'income entry' : 'investment'}.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Search & Sort bar */}
      <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleSort('date')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              sortBy === 'date'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400'
            }`}
          >
            Date {sortBy === 'date' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => toggleSort('amount')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              sortBy === 'amount'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400'
            }`}
          >
            Amount {sortBy === 'amount' && (sortDir === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Transaction list */}
      <div className="divide-y divide-dark-100 dark:divide-dark-700/50">
        {sorted.map((t, i) => (
          <div
            key={t.uuid}
            className="flex items-center gap-4 p-4 hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Category/Source icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{
                backgroundColor: isExpense
                  ? `${t.category?.color}20`
                  : isIncome ? '#22c55e20' : '#8b5cf620',
              }}
            >
              {isExpense ? t.category?.icon || '📦' : isIncome ? '💵' : '📈'}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-900 dark:text-white truncate">
                {isExpense ? t.category?.name : isIncome ? t.source : t.asset_type}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-dark-500 dark:text-dark-400">
                  {new Date(isExpense ? t.date_spent : isIncome ? t.date_credited : t.date_invested).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
                {isExpense && t.payment_mode && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 font-medium">
                    {t.payment_mode}
                  </span>
                )}
                {t.notes && (
                  <p className="text-xs text-dark-400 dark:text-dark-500 truncate max-w-[150px]">
                    • {t.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Amount */}
            <p className={`text-sm font-bold shrink-0 ${isExpense ? 'text-red-500' : isIncome ? 'text-emerald-500' : 'text-purple-500'}`}>
              {isExpense ? '-' : '+'}{currency}{t.amount?.toLocaleString('en-IN')}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(t)}
                className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-400 hover:text-primary-500"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(t.uuid)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-dark-400 hover:text-red-500"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Results count */}
      <div className="px-4 py-3 border-t border-dark-100 dark:border-dark-700/50 text-xs text-dark-500 dark:text-dark-400">
        {sorted.length} of {transactions.length} transactions
      </div>
    </div>
  );
}
