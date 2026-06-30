import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SavingsBarChart({ trends = [] }) {
  const { isDark } = useTheme();

  if (trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-dark-400 dark:text-dark-500">
        <div className="text-center">
          <p className="text-4xl mb-2">📉</p>
          <p className="text-sm">No trend data available</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: trends.map(t => t.label),
    datasets: [
      {
        label: 'Income',
        data: trends.map(t => t.total_income),
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.7)' : 'rgba(34, 197, 94, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: trends.map(t => t.total_expenses),
        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.7)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Savings',
        data: trends.map(t => t.savings),
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.7)' : 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { family: 'Inter', size: 11 },
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#64748b' : '#94a3b8',
          font: { family: 'Inter', size: 11 },
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
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
          label: (context) => ` ${context.dataset.label}: ₹${context.raw.toLocaleString('en-IN')}`,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  );
}
