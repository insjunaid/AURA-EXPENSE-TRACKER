import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { ChartNoAxesColumn } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { chartTheme, baseTooltip } from '../../lib/chartTheme';
import { formatMoney, formatCompact } from '../../lib/format';
import ChartLegend from './ChartLegend';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function SavingsBarChart({ trends = [], currency = 'INR' }) {
  const { isDark } = useTheme();
  const t = chartTheme(isDark);

  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-muted text-sm gap-3">
        <ChartNoAxesColumn size={22} /> No trend data yet
      </div>
    );
  }

  const bar = { borderRadius: 6, borderSkipped: false, maxBarThickness: 14, categoryPercentage: 0.7, barPercentage: 0.85 };
  const data = {
    labels: trends.map((x) => String(x.label).split(" ")[0].slice(0, 3)),
    datasets: [
      { label: 'Income', data: trends.map((x) => x.total_income), backgroundColor: t.income, ...bar },
      { label: 'Expenses', data: trends.map((x) => x.total_expenses), backgroundColor: t.expense, ...bar },
      { label: 'Savings', data: trends.map((x) => x.savings), backgroundColor: t.ink, ...bar },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: t.tick, font: { family: 'Geist', size: 11 } } },
      y: {
        grid: { color: t.grid }, border: { display: false },
        ticks: { color: t.tick, font: { family: 'Geist', size: 11 }, maxTicksLimit: 5, callback: (v) => formatCompact(v, currency) },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { ...baseTooltip(t), callbacks: { label: (c) => ` ${c.dataset.label}: ${formatMoney(c.raw, currency)}` } },
    },
    animation: { duration: 700, easing: 'easeOutQuart' },
  };

  return (
    <div>
      <ChartLegend items={[['Income', t.income], ['Expenses', t.expense], ['Savings', t.ink]]} />
      <div className="h-60 sm:h-72 mt-3">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
