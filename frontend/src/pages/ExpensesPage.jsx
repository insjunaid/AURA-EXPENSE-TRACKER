import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { expenseAPI, categoryAPI } from '../services/api';
import MonthPicker from '../components/MonthPicker';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', SAR: '﷼', AED: 'د.إ' };

export default function ExpensesPage() {
  const { user } = useAuth();
  const currency = CURRENCY_SYMBOLS[user?.currency] || '₹';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        expenseAPI.list(month, year),
        categoryAPI.list(),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category?.id?.toString() === filterCategory);

  const handleAdd = async (data) => {
    await expenseAPI.create(data);
    toast.success('Expense added!');
    fetchData();
  };

  const handleEdit = async (data) => {
    await expenseAPI.update(editItem.uuid, data);
    toast.success('Expense updated!');
    setEditItem(null);
    fetchData();
  };

  const handleDelete = async (uuid) => {
    if (!confirm('Delete this expense?')) return;
    await expenseAPI.delete(uuid);
    toast.success('Expense deleted');
    fetchData();
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
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">Expenses</h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Track and categorize all your spending</p>
        </div>
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Total card */}
      <div className="glass-card p-6 gradient-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Total Expenses This Month</p>
            <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">
              {currency}{totalExpenses.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-dark-400 mt-1">{expenses.length} transactions</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-3xl shadow-lg">
            💳
          </div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => { setEditItem(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Add Expense
        </button>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterCategory === 'all'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id.toString())}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterCategory === cat.id.toString()
                  ? 'text-white'
                  : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400'
              }`}
              style={filterCategory === cat.id.toString() ? { backgroundColor: cat.color } : {}}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <TransactionList
          transactions={filteredExpenses}
          type="expense"
          currency={currency}
          onEdit={(item) => { setEditItem(item); setShowForm(true); }}
          onDelete={handleDelete}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <TransactionForm
          type="expense"
          categories={categories}
          initialData={editItem}
          onSubmit={editItem ? handleEdit : handleAdd}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}
    </motion.div>
  );
}
