import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpensePieChart({ breakdown = [] }) {
  const { isDark } = useTheme();

  if (breakdown.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-dark-400 dark:text-dark-500">
        <div className="text-center">
          <p className="text-4xl mb-2">📊</p>
          <p className="text-sm">No expense data for this month</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: breakdown.map(b => `${b.category_icon} ${b.category_name}`),
    datasets: [{
      data: breakdown.map(b => b.total_amount),
      backgroundColor: breakdown.map(b => b.category_color),
      borderColor: isDark ? '#1e293b' : '#ffffff',
      borderWidth: 3,
      hoverBorderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: 'Inter', size: 12, weight: '500' },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#334155' : '#1e293b',
        titleFont: { family: 'Inter', weight: '600' },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((value / total) * 100).toFixed(1);
            return ` ₹${value.toLocaleString('en-IN')} (${pct}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="h-80">
      <Doughnut data={data} options={options} />
    </div>
  );
}
