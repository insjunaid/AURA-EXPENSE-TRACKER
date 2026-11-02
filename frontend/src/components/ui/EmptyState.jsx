import { Receipt, Wallet, TrendingUp, Inbox } from 'lucide-react';

const ICONS = { expense: Receipt, income: Wallet, investment: TrendingUp };

export default function EmptyState({ type, icon: IconProp, title, message, action, compact = false }) {
  const Icon = IconProp || ICONS[type] || Inbox;
  return (
    <div className={`card text-center ${compact ? 'px-6 py-10' : 'px-6 py-14'}`}>
      <div className="mx-auto w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center text-ink-2">
        <Icon size={24} strokeWidth={1.7} />
      </div>
      <h3 className="mt-4 text-[16px] font-semibold tracking-tight">{title}</h3>
      {message && <p className="mt-1.5 text-sm text-muted max-w-xs mx-auto">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
