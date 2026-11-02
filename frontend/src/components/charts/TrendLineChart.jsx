import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler,
} from 'chart.js';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { chartTheme, baseTooltip } from '../../lib/chartTheme';
import { formatMoney, formatCompact } from '../../lib/format';
import ChartLegend from './ChartLegend';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function fade(hex, isDark) {
  // vertical gradient fill under the line
  return (ctx) => {
    const { chart } = ctx;
    const { ctx: c, chartArea } = chart;
    if (!chartArea) return 'transparent';
    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    g.addColorStop(0, `${hex}${isDark ? '33' : '26'}`);
    g.addColorStop(1, `${hex}00`);
    return g;
  };
}

export default function TrendLineChart({ trends = [], currency = 'INR' }) {
  const { isDark } = useTheme();
  const t = chartTheme(isDark);

  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-muted text-sm gap-3">
        <TrendingUp size={22} /> No trend data yet
      </div>
    );
  }

  const line = (color) => ({
    borderColor: color,
    backgroundColor: fade(color, isDark),
    fill: true,
    tension: 0.4,
    borderWidth: 2.25,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: color,
    pointHoverBorderColor: t.surface,
    pointHoverBorderWidth: 2,
  });

  const data = {
    labels: trends.map((x) => String(x.label).split(" ")[0].slice(0, 3)),
    datasets: [
      { label: 'Income', data: trends.map((x) => x.total_income), ...line(t.income) },
      { label: 'Expenses', data: trends.map((x) => x.total_expenses), ...line(t.expense) },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: t.tick, font: { family: 'Geist', size: 11 } } },
      y: {
        grid: { color: t.grid }, border: { display: false }, beginAtZero: true,
        ticks: { color: t.tick, font: { family: 'Geist', size: 11 }, maxTicksLimit: 5, callback: (v) => formatCompact(v, currency) },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { ...baseTooltip(t), callbacks: { label: (c) => ` ${c.dataset.label}: ${formatMoney(c.raw, currency)}` } },
    },
    animation: { duration: 800, easing: 'easeOutQuart' },
  };

  return (
    <div>
      <ChartLegend items={[['Income', t.income], ['Expenses', t.expense]]} />
      <div className="h-60 sm:h-72 mt-3">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
