import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { investmentAPI } from '../services/api';
import MonthPicker from '../components/MonthPicker';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', SAR: '﷼', AED: 'د.إ' };

export default function InvestmentsPage() {
  const { user } = useAuth();
  const currency = CURRENCY_SYMBOLS[user?.currency] || '₹';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await investmentAPI.list(month, year);
      setInvestments(res.data);
    } catch { toast.error('Failed to load investment data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const totalInvestment = investments.reduce((sum, i) => sum + i.amount, 0);

  const handleAdd = async (data) => {
    await investmentAPI.create(data);
    toast.success('Investment logged!');
    fetchData();
  };

  const handleEdit = async (data) => {
    await investmentAPI.update(editItem.uuid, data);
    toast.success('Investment updated!');
    setEditItem(null);
    fetchData();
  };

  const handleDelete = async (uuid) => {
    if (!confirm('Delete this investment entry?')) return;
    await investmentAPI.delete(uuid);
    toast.success('Investment deleted');
    fetchData();
  };

  const openEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
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
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">Investments</h1>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Track where your wealth is growing</p>
        </div>
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {/* Total card */}
      <div className="glass-card p-6 gradient-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-500 dark:text-dark-400">Total Invested This Month</p>
            <p className="text-3xl font-bold text-dark-900 dark:text-white mt-1">
              {currency}{totalInvestment.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-dark-400 mt-1">{investments.length} active entries</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-3xl shadow-lg">
            📈
          </div>
        </div>
      </div>

      {/* Add button */}
      <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
        <span>+</span> Log Investment
      </button>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <TransactionList
          transactions={investments}
          type="investment"
          currency={currency}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <TransactionForm
          type="investment"
          initialData={editItem}
          onSubmit={editItem ? handleEdit : handleAdd}
          onClose={() => { setShowForm(false); setEditItem(null); }}
        />
      )}
    </motion.div>
  );
}
