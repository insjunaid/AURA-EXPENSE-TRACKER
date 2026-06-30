import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { categoryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const currencies = [
  { code: 'INR', label: '₹ INR — Indian Rupee' },
  { code: 'USD', label: '$ USD — US Dollar' },
  { code: 'SAR', label: '﷼ SAR — Saudi Riyal' },
  { code: 'AED', label: 'د.إ AED — UAE Dirham' },
];

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#6366f1');

  useEffect(() => {
    categoryAPI.list().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = { name, email, currency };
      if (newPassword) {
        updates.current_password = currentPassword;
        updates.new_password = newPassword;
      }
      await updateProfile(updates);
      toast.success('Profile updated!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoryAPI.create({ name: newCatName, icon: newCatIcon, color: newCatColor });
      toast.success('Category added!');
      setNewCatName('');
      setNewCatIcon('📦');
      setNewCatColor('#6366f1');
      const res = await categoryAPI.list();
      setCategories(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Category deleted');
      const res = await categoryAPI.list();
      setCategories(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Cannot delete this category');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-8 pb-20 lg:pb-0"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white">Profile</h1>
        <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-2xl font-bold shadow-glow">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-dark-500 dark:text-dark-400">{user?.email}</p>
            <p className="text-xs text-dark-400 mt-1">
              Member since {new Date(user?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-field">
              {currencies.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>

          <hr className="border-dark-200 dark:border-dark-700" />

          <h3 className="text-sm font-semibold text-dark-700 dark:text-dark-300">Change Password</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" placeholder="Leave blank to keep" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" placeholder="Min 6 characters" minLength={6} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Category Management */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-6">Manage Categories</h3>

        {/* Add category form */}
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={newCatIcon}
            onChange={e => setNewCatIcon(e.target.value)}
            className="input-field w-16 text-center text-xl"
            placeholder="📦"
            maxLength={4}
          />
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            className="input-field flex-1"
            placeholder="Category name"
            required
          />
          <input
            type="color"
            value={newCatColor}
            onChange={e => setNewCatColor(e.target.value)}
            className="w-12 h-12 rounded-xl cursor-pointer border-0 p-1 bg-transparent"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">
            + Add
          </button>
        </form>

        {/* Category list */}
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-50 dark:bg-dark-700/30 animate-fade-in">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                {cat.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-800 dark:text-dark-200">{cat.name}</p>
                <p className="text-xs text-dark-400">{cat.is_default ? 'Default' : 'Custom'}</p>
              </div>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
              {!cat.is_default && (
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-dark-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
