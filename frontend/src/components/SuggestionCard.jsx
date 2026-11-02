import { TriangleAlert, Lightbulb, CircleCheck, PiggyBank } from 'lucide-react';
import { formatMoney } from '../lib/format';

const STYLES = {
  warning: { icon: TriangleAlert, tone: 'bg-warn/10 text-warn' },
  info: { icon: Lightbulb, tone: 'bg-surface-2 text-ink' },
  success: { icon: CircleCheck, tone: 'bg-income/10 text-income' },
};

export default function SuggestionCard({ suggestion, currency = 'INR' }) {
  const { icon: Icon, tone } = STYLES[suggestion.type] || STYLES.info;
  return (
    <div className="card p-4 flex gap-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
        <Icon size={19} strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[14.5px] font-semibold tracking-tight">{suggestion.title}</h4>
        <p className="text-[13.5px] text-ink-2 mt-1 leading-relaxed">{suggestion.message}</p>
        {suggestion.potential_savings > 0 && (
          <p className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-income">
            <PiggyBank size={14} /> Could save {formatMoney(suggestion.potential_savings, currency, { decimals: 0 })}
          </p>
        )}
      </div>
    </div>
  );
}
