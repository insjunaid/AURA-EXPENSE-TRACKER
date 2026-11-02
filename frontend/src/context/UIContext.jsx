import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiFor, categoryAPI, errorMessage } from '../services/api';
import { TYPES } from '../lib/transactionTypes';
import TransactionForm from '../components/TransactionForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuth } from './AuthContext';

/**
 * App-wide UI services:
 *  - openTransaction(type, item?) → add/edit sheet usable from anywhere
 *    (the mobile "+" button, dashboard quick actions, list rows…)
 *  - dataVersion → bumps after any create/update/delete so pages refetch
 *  - confirm({...}) → promise-based, styled replacement for window.confirm
 *  - categories → cached expense categories
 */
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [dataVersion, setDataVersion] = useState(0);
  const [form, setForm] = useState(null); // { type, item }
  const [confirmState, setConfirmState] = useState(null);
  const [categories, setCategories] = useState([]);
  const confirmResolver = useRef(null);

  const refresh = useCallback(() => setDataVersion((v) => v + 1), []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.list();
      setCategories(res.data);
    } catch { /* surfaced elsewhere */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadCategories();
    else setCategories([]);
  }, [isAuthenticated, loadCategories]);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    confirmResolver.current = resolve;
    setConfirmState(opts);
  }), []);

  const closeConfirm = (result) => {
    confirmResolver.current?.(result);
    confirmResolver.current = null;
    setConfirmState(null);
  };

  const openTransaction = useCallback((type, item = null) => setForm({ type, item }), []);
  const closeTransaction = useCallback(() => setForm(null), []);

  const submitTransaction = async (payload) => {
    const { type, item } = form;
    const cfg = TYPES[type];
    try {
      if (item) await apiFor[type].update(item.uuid, payload);
      else await apiFor[type].create(payload);
      toast.success(`${cfg.label} ${item ? 'updated' : 'added'}`);
      refresh();
    } catch (err) {
      toast.error(errorMessage(err, `Could not save ${cfg.label.toLowerCase()}`));
      throw err; // keep the sheet open so nothing typed is lost
    }
  };

  const deleteTransaction = useCallback(async (type, item) => {
    const cfg = TYPES[type];
    const ok = await confirm({
      title: `Delete this ${cfg.label.toLowerCase()}?`,
      message: 'This entry will be permanently removed. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return false;
    try {
      await apiFor[type].delete(item.uuid);
      toast.success(`${cfg.label} deleted`);
      refresh();
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete'));
      return false;
    }
  }, [confirm, refresh]);

  return (
    <UIContext.Provider value={{
      dataVersion, refresh,
      openTransaction, closeTransaction, deleteTransaction,
      confirm, categories, setCategories, loadCategories,
    }}>
      {children}

      {form && (
        <TransactionForm
          type={form.type}
          initialData={form.item}
          categories={categories}
          onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
          onSubmit={submitTransaction}
          onDelete={form.item ? async () => {
            const deleted = await deleteTransaction(form.type, form.item);
            if (deleted) closeTransaction();
          } : undefined}
          onClose={closeTransaction}
        />
      )}

      <ConfirmDialog
        open={!!confirmState}
        {...(confirmState || {})}
        onCancel={() => closeConfirm(false)}
        onConfirm={() => closeConfirm(true)}
      />
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};
