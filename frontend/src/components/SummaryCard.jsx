import Money from './ui/Money';

/** Compact stat tile: label, amount, optional icon and footnote. */
export default function SummaryCard({ title, amount = 0, icon, tone = 'ink', currency = 'INR', note }) {
  const toneCls = tone === 'income' ? 'text-income bg-income/10' : tone === 'expense' ? 'text-expense bg-expense/10' : 'text-ink bg-surface-2';
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink-2">{title}</p>
        {icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneCls}`}>{icon}</div>}
      </div>
      <Money value={amount} currency={currency} animate className="block mt-3 text-[22px] sm:text-[26px] font-semibold tracking-tight" />
      {note && <p className="text-[12px] text-muted mt-1">{note}</p>}
    </div>
  );
}
