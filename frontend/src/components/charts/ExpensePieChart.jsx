import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { ChartPie } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { chartTheme, baseTooltip } from '../../lib/chartTheme';
import { formatMoney, formatCompact } from '../../lib/format';
import CategoryIcon from '../CategoryIcon';

ChartJS.register(ArcElement, Tooltip);

/**
 * Donut with the month's total in the centre, plus a ranked legend of
 * categories with share bars (the legend is the readable part on phones).
 */
export default function ExpensePieChart({ breakdown = [], currency = 'INR', limit }) {
  const { isDark } = useTheme();
  const t = chartTheme(isDark);

  if (breakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-muted mb-3">
          <ChartPie size={22} strokeWidth={1.7} />
        </div>
        <p className="text-sm text-muted">No spending recorded this month</p>
      </div>
    );
  }

  const sorted = [...breakdown].sort((a, b) => b.total_amount - a.total_amount);
  const total = sorted.reduce((s, b) => s + b.total_amount, 0);
  const shown = limit ? sorted.slice(0, limit) : sorted;

  const data = {
    labels: sorted.map((b) => b.category_name),
    datasets: [{
      data: sorted.map((b) => b.total_amount),
      backgroundColor: sorted.map((b) => b.category_color),
      borderColor: t.surface,
      borderWidth: 3,
      borderRadius: 6,
      hoverOffset: 6,
      spacing: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    layout: { padding: 6 },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...baseTooltip(t),
        callbacks: {
          label: (ctx) => ` ${formatMoney(ctx.raw, currency)} · ${((ctx.raw / total) * 100).toFixed(1)}%`,
        },
      },
    },
    animation: { animateRotate: true, duration: 800, easing: 'easeOutQuart' },
  };

  return (
    <div className="grid sm:grid-cols-[200px_1fr] gap-6 items-center">
      <div className="relative h-[200px] w-[200px] mx-auto">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="eyebrow">Spent</span>
          <span className="font-display text-[30px] leading-none mt-1 tabular">{formatCompact(total, currency)}</span>
        </div>
      </div>

      <ul className="space-y-3">
        {shown.map((b) => (
          <li key={b.category_name} className="flex items-center gap-3">
            <CategoryIcon type="expense" name={b.category_name} emoji={b.category_icon} color={b.category_color} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[14px] font-medium truncate">{b.category_name}</span>
                <span className="text-[14px] font-semibold tabular shrink-0">{formatMoney(b.total_amount, currency, { decimals: 0 })}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${b.percentage}%`, backgroundColor: b.category_color }} />
                </div>
                <span className="text-[11.5px] text-muted tabular w-10 text-right">{b.percentage}%</span>
              </div>
            </div>
          </li>
        ))}
        {limit && sorted.length > limit && (
          <li className="text-[12.5px] text-muted pl-12">+{sorted.length - limit} more categories</li>
        )}
      </ul>
    </div>
  );
}
