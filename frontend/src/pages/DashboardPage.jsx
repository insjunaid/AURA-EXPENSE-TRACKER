import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { incomeAPI, expenseAPI, analyticsAPI, categoryAPI } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import MonthPicker from '../components/MonthPicker';
import TransactionForm from '../components/TransactionForm';
import ExpensePieChart from '../components/charts/ExpensePieChart';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', SAR: '﷼', AED: 'د.إ' };

export default function DashboardPage() {
  const { user } = useAuth();
  const currency = CURRENCY_SYMBOLS[user?.currency] || '₹';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recentIncome, setRecentIncome] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('expense');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, expenseRes, incomeRes, catRes] = await Promise.all([
        analyticsAPI.monthly(month, year),
        expenseAPI.list(month, year),
        incomeAPI.list(month, year),
        categoryAPI.list(),
      ]);
      setSummary(analyticsRes.data.summary);
      setBreakdown(analyticsRes.data.breakdown);
      setRecentExpenses(expenseRes.data.slice(0, 5));
      setRecentIncome(incomeRes.data.slice(0, 5));
      setCategories(catRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const handleMonthChange = (m, y) => { setMonth(m); setYear(y); };

  const openForm = (type) => { setFormType(type); setShowForm(true); };

  const handleFormSubmit = async (data) => {
    if (formType === 'expense') await expenseAPI.create(data);
    else await incomeAPI.create(data);
    toast.success(`${formType === 'expense' ? 'Expense' : 'Income'} added!`);
    fetchData();
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Your financial overview at a glance</p>
        </div>
        <MonthPicker month={month} year={year} onChange={handleMonthChange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          amount={summary?.total_income || 0}
          icon="💰"
          color="green"
          currency={currency}
          delay={0}
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary?.total_expenses || 0}
          icon="💳"
          color="red"
          currency={currency}
          delay={100}
        />
        <SummaryCard
          title="Savings"
          amount={summary?.savings || 0}
          icon="🏦"
          color="primary"
          currency={currency}
          delay={200}
        />
        <SummaryCard
          title="Savings Rate"
          amount={summary?.savings_rate || 0}
          icon="📈"
          color="purple"
          currency=""
          delay={300}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => openForm('income')}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Add Income
        </button>
        <button
          onClick={() => openForm('expense')}
          className="btn-secondary flex items-center gap-2"
        >
          <span>+</span> Add Expense
        </button>
      </div>

      {/* Charts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Expense Breakdown
          </h3>
          <ExpensePieChart breakdown={breakdown} />
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-[340px] overflow-y-auto">
            {[...recentIncome.map(i => ({ ...i, _type: 'income' })),
              ...recentExpenses.map(e => ({ ...e, _type: 'expense' }))]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 8)
              .map((t, i) => (
                <div key={t.uuid} className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                    style={{
                      backgroundColor: t._type === 'expense'
                        ? `${t.category?.color || '#6366f1'}20`
                        : '#22c55e20',
                    }}
                  >
                    {t._type === 'expense' ? (t.category?.icon || '📦') : '💵'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-800 dark:text-dark-200 truncate">
                      {t._type === 'expense' ? t.category?.name : t.source}
                    </p>
                    <p className="text-xs text-dark-400">
                      {new Date(t._type === 'expense' ? t.date_spent : t.date_credited).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${t._type === 'expense' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {t._type === 'expense' ? '-' : '+'}{currency}{t.amount?.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            {recentIncome.length === 0 && recentExpenses.length === 0 && (
              <div className="text-center py-8 text-dark-400">
                <p className="text-4xl mb-2">📝</p>
                <p className="text-sm">No transactions yet this month</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Summary */}
      {breakdown.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
            Category Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {breakdown.map((b, i) => (
              <div
                key={b.category_name}
                className="flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-700/30 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${b.category_color}20` }}
                >
                  {b.category_icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-dark-800 dark:text-dark-200">{b.category_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-dark-200 dark:bg-dark-600 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${b.percentage}%`, backgroundColor: b.category_color }}
                      />
                    </div>
                    <span className="text-xs text-dark-500 shrink-0">{b.percentage}%</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-dark-700 dark:text-dark-300 shrink-0">
                  {currency}{b.total_amount.toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          type={formType}
          categories={categories}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </motion.div>
  );
}
