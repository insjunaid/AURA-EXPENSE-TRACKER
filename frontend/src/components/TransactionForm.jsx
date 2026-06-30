import { useState, useEffect } from 'react';

export default function TransactionForm({
  type = 'expense', // 'expense', 'income', or 'investment'
  categories = [],
  initialData = null,
  onSubmit,
  onClose,
}) {
  const isEdit = !!initialData;
  const isExpense = type === 'expense';
  const isIncome = type === 'income';
  const isInvestment = type === 'investment';

  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    category_id: '',
    asset_type: '',
    payment_mode: '',
    date_credited: new Date().toISOString().split('T')[0],
    date_spent: new Date().toISOString().split('T')[0],
    date_invested: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount?.toString() || '',
        source: initialData.source || '',
        category_id: initialData.category?.id?.toString() || '',
        asset_type: initialData.asset_type || '',
        payment_mode: initialData.payment_mode || '',
        date_credited: initialData.date_credited || new Date().toISOString().split('T')[0],
        date_spent: initialData.date_spent || new Date().toISOString().split('T')[0],
        date_invested: initialData.date_invested || new Date().toISOString().split('T')[0],
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let payload;
      if (isExpense) {
        payload = {
          amount: parseFloat(formData.amount),
          category_id: parseInt(formData.category_id),
          date_spent: formData.date_spent,
          payment_mode: formData.payment_mode || null,
          notes: formData.notes || null,
        };
      } else if (isIncome) {
        payload = {
          amount: parseFloat(formData.amount),
          source: formData.source,
          date_credited: formData.date_credited,
          notes: formData.notes || null,
        };
      } else if (isInvestment) {
        payload = {
          amount: parseFloat(formData.amount),
          asset_type: formData.asset_type,
          date_invested: formData.date_invested,
          notes: formData.notes || null,
        };
      }
      
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-6 modal-content max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-dark-900 dark:text-white">
            {isEdit ? 'Edit' : 'Add'} {isExpense ? 'Expense' : isIncome ? 'Income' : 'Investment'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          >
            <svg className="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-semibold">₹</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="input-field pl-8"
              />
            </div>
          </div>

          {/* Source / Category / Asset Type */}
          {isExpense && (
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isIncome && (
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Source *
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g., Salary, Freelance, Bonus"
                required
                className="input-field"
              />
            </div>
          )}
          {isInvestment && (
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Asset Type *
              </label>
              <input
                type="text"
                name="asset_type"
                value={formData.asset_type}
                onChange={handleChange}
                placeholder="e.g., Stocks, Crypto, Mutual Funds"
                required
                className="input-field"
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Date *
            </label>
            <input
              type="date"
              name={isExpense ? 'date_spent' : isIncome ? 'date_credited' : 'date_invested'}
              value={isExpense ? formData.date_spent : isIncome ? formData.date_credited : formData.date_invested}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          {/* Payment Mode (expenses only, optional) */}
          {isExpense && (
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                Payment Mode <span className="text-dark-400">(optional)</span>
              </label>
              <select
                name="payment_mode"
                value={formData.payment_mode}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select mode</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Wallet">Wallet</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
              Notes <span className="text-dark-400">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add a note..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                isEdit ? 'Update' : 'Add'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
