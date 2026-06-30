import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import MonthPicker from '../components/MonthPicker';
import SummaryCard from '../components/SummaryCard';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import SavingsBarChart from '../components/charts/SavingsBarChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import SuggestionCard from '../components/SuggestionCard';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', SAR: '﷼', AED: 'د.إ' };

export default function AnalyticsPage() {
  const { user } = useAuth();
  const currency = CURRENCY_SYMBOLS[user?.currency] || '₹';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, trendsRes] = await Promise.all([
        analyticsAPI.monthly(month, year),
        analyticsAPI.trends(6),
      ]);
      setAnalytics(analyticsRes.data);
      setTrends(trendsRes.data.trends);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = analytics?.summary;
  const breakdown = analytics?.breakdown || [];
  const suggestions = analytics?.suggestions || [];

  const handleDownloadReport = () => {
    if (!analytics) return;
    const { summary, breakdown } = analytics;
    let csv = `Aura Wealth Manager - Monthly Report (${month}/${year})\n\n`;
    
    // Summary Section
    csv += `Summary\n`;
    csv += `Total Income,${summary.total_income}\n`;
    csv += `Total Expenses,${summary.total_expenses}\n`;
    csv += `Net Savings,${summary.savings}\n`;
    csv += `Savings Rate,${summary.savings_rate}%\n\n`;

    // Category Breakdown Section
    csv += `Expense Breakdown\n`;
    csv += `Category,Amount,Share (%),Transactions\n`;
    breakdown.forEach(b => {
      csv += `"${b.category_name}",${b.total_amount},${b.percentage},${b.transaction_count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aura-report-${year}-${month.toString().padStart(2, '0')}.csv`;
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-20 lg:pb-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">Analytics</h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Deep insights into your spending patterns</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <button 
            onClick={handleDownloadReport}
            className="btn-secondary whitespace-nowrap hidden sm:block"
            title="Download CSV Report"
          >
            📥 Export CSV
          </button>
        </div>
      </div>
      
      {/* Mobile Download Button */}
      <button 
        onClick={handleDownloadReport}
        className="btn-secondary w-full sm:hidden flex justify-center items-center gap-2"
      >
        📥 Export Monthly Report to CSV
      </button>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Income" amount={summary?.total_income || 0} icon="💰" color="green" currency={currency} delay={0} />
        <SummaryCard title="Expenses" amount={summary?.total_expenses || 0} icon="💳" color="red" currency={currency} delay={100} />
        <SummaryCard title="Investments" amount={summary?.total_investments || 0} icon="📈" color="primary" currency={currency} delay={150} />
        <SummaryCard title="Savings (Remaining)" amount={summary?.savings || 0} icon="🏦" color="purple" currency={currency} delay={200} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie */}
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            📊 Expense Breakdown
          </h3>
          <ExpensePieChart breakdown={breakdown} />
        </div>

        {/* Monthly Comparison Bar */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            📉 Monthly Comparison
          </h3>
          <SavingsBarChart trends={trends} />
        </div>
      </div>

      {/* Full-width Trend Line */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
          📈 Income vs Expense Trends (Last 6 Months)
        </h3>
        <TrendLineChart trends={trends} />
      </div>

      {/* Category Details Table */}
      {breakdown.length > 0 && (
        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
              📋 Category Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Category</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Amount</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Share</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-dark-700/50">
                {breakdown.map((b, i) => (
                  <tr key={b.category_name} className="hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{b.category_icon}</span>
                        <span className="text-sm font-medium text-dark-800 dark:text-dark-200">{b.category_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-dark-900 dark:text-white">
                      {currency}{b.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-dark-600 dark:text-dark-300">
                      {b.percentage}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-dark-500 dark:text-dark-400">
                      {b.transaction_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full h-2 rounded-full bg-dark-200 dark:bg-dark-600 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${b.percentage}%`, backgroundColor: b.category_color }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            💡 Smart Suggestions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
