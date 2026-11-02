import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Check, CalendarDays, X } from 'lucide-react';
import Sheet from './ui/Sheet';
import CategoryIcon from './CategoryIcon';
import { categoryAPI, errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { currencySymbol, todayISO } from '../lib/format';
import { TYPES, PAYMENT_MODES, INCOME_SOURCES, ASSET_TYPES } from '../lib/transactionTypes';

const CATEGORY_COLORS = ['#0f766e', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#16a34a', '#475569'];

export default function TransactionForm({
  type = 'expense',
  categories = [],
  initialData = null,
  onSubmit,
  onDelete,
  onClose,
  onCategoryCreated,
}) {
  const { user } = useAuth();
  const cfg = TYPES[type];
  const isEdit = !!initialData;
  const isExpense = type === 'expense';
  const isIncome = type === 'income';
  const amountRef = useRef(null);

  const [open, setOpen] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => ({
    amount: initialData?.amount != null ? String(initialData.amount) : '',
    category_id: initialData?.category?.id ?? null,
    source: initialData?.source || '',
    asset_type: initialData?.asset_type || '',
    payment_mode: initialData?.payment_mode || '',
    date: initialData?.[cfg.dateField] || todayISO(),
    notes: initialData?.notes || '',
  }));

  // New-category mini form
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: '📦', color: CATEGORY_COLORS[0] });
  const [savingCat, setSavingCat] = useState(false);

  useEffect(() => {
    // Focus amount on open for new entries (desktop only — avoids the mobile
    // keyboard covering the sheet before it finishes animating)
    if (!isEdit && window.matchMedia('(min-width: 640px)').matches) {
      setTimeout(() => amountRef.current?.focus(), 200);
    }
  }, [isEdit]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const close = () => {
    setOpen(false);
    setTimeout(onClose, 220); // let the exit animation play
  };

  const handleAmount = (e) => {
    // digits + one decimal point, max 2 decimals
    let v = e.target.value.replace(/[^\d.]/g, '');
    const [int, ...rest] = v.split('.');
    v = rest.length ? `${int}.${rest.join('').slice(0, 2)}` : int;
    set('amount', v.slice(0, 12));
  };

  const saveCategory = async () => {
    if (!newCat.name.trim()) return toast.error('Give the category a name');
    setSavingCat(true);
    try {
      const res = await categoryAPI.create({ name: newCat.name.trim(), icon: newCat.icon || '📦', color: newCat.color });
      onCategoryCreated?.(res.data);
      set('category_id', res.data.id);
      setAddingCat(false);
      setNewCat({ name: '', icon: '📦', color: CATEGORY_COLORS[0] });
      toast.success('Category created');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create category'));
    } finally {
      setSavingCat(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { amountRef.current?.focus(); return toast.error('Enter an amount'); }
    if (isExpense && !form.category_id) return toast.error('Pick a category');
    if (isIncome && !form.source.trim()) return toast.error('Add an income source');
    if (type === 'investment' && !form.asset_type.trim()) return toast.error('Add an asset type');

    const base = { amount, notes: form.notes.trim() || null, [cfg.dateField]: form.date };
    const payload = isExpense
      ? { ...base, category_id: Number(form.category_id), payment_mode: form.payment_mode || null }
      : isIncome
        ? { ...base, source: form.source.trim() }
        : { ...base, asset_type: form.asset_type.trim() };

    setSubmitting(true);
    try {
      await onSubmit(payload);
      close();
    } catch {
      /* error toast shown by caller; keep the sheet open */
    } finally {
      setSubmitting(false);
    }
  };

  const textPresets = isIncome ? INCOME_SOURCES : ASSET_TYPES;
  const textKey = isIncome ? 'source' : 'asset_type';

  return (
    <Sheet
      open={open}
      onClose={close}
      title={`${isEdit ? 'Edit' : 'New'} ${cfg.label.toLowerCase()}`}
      footer={
        <div className="flex gap-3">
          {isEdit && onDelete && (
            <button type="button" onClick={onDelete} className="btn-secondary !px-4 text-expense" aria-label="Delete">
              <Trash2 size={18} />
            </button>
          )}
          <button type="submit" form="txn-form" disabled={submitting} className="btn-primary flex-1">
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-canvas/40 border-t-canvas rounded-full animate-spin" /> Saving…</>
            ) : (
              <><Check size={18} /> {isEdit ? 'Save changes' : `Add ${cfg.label.toLowerCase()}`}</>
            )}
          </button>
        </div>
      }
    >
      <form id="txn-form" onSubmit={handleSubmit} className="space-y-6 pb-2">
        {/* Amount */}
        <div className="pt-2 pb-1 text-center">
          <label htmlFor="txn-amount" className="eyebrow">Amount</label>
          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span className={`font-display text-4xl ${form.amount ? 'text-ink' : 'text-muted'}`}>{currencySymbol(user?.currency)}</span>
            <input
              ref={amountRef}
              id="txn-amount"
              inputMode="decimal"
              autoComplete="off"
              value={form.amount}
              onChange={handleAmount}
              placeholder="0"
              className="bg-transparent font-display text-6xl leading-none tracking-tight text-ink placeholder:text-muted/60 outline-none tabular text-left max-w-[75vw]"
              style={{ width: `${Math.max(1, form.amount.length) * 0.92 + 0.2}ch` }}
              aria-label="Amount"
            />
          </div>
        </div>

        {/* Category (expenses) */}
        {isExpense && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="field-label !mb-0">Category</span>
              {!addingCat && (
                <button type="button" onClick={() => setAddingCat(true)} className="text-[13px] font-medium text-ink-2 hover:text-ink inline-flex items-center gap-1">
                  <Plus size={14} /> New
                </button>
              )}
            </div>

            {addingCat && (
              <div className="mb-3 p-3 rounded-2xl bg-surface-2/70 space-y-3 animate-fade-in">
                <div className="flex gap-2">
                  <input
                    value={newCat.icon}
                    onChange={(e) => setNewCat((c) => ({ ...c, icon: e.target.value }))}
                    className="field !w-14 text-center !px-0 !bg-surface"
                    maxLength={4}
                    aria-label="Emoji"
                  />
                  <input
                    value={newCat.name}
                    onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
                    className="field flex-1 !bg-surface"
                    placeholder="Category name"
                    maxLength={100}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  {CATEGORY_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCat((n) => ({ ...n, color: c }))}
                      className={`w-7 h-7 rounded-full transition ${newCat.color === c ? 'ring-2 ring-offset-2 ring-ink ring-offset-surface-2 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Colour ${c}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAddingCat(false)} className="btn-ghost !h-10 flex-1"><X size={16} /> Cancel</button>
                  <button type="button" onClick={saveCategory} disabled={savingCat} className="btn-primary !h-10 flex-1">
                    {savingCat ? 'Saving…' : 'Create'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const active = String(form.category_id) === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => set('category_id', cat.id)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border transition active:scale-95
                      ${active ? 'border-ink bg-surface-2 shadow-soft' : 'border-line/70 hover:border-ink/30'}`}
                  >
                    <CategoryIcon type="expense" name={cat.name} emoji={cat.icon} color={cat.color} size="sm" />
                    <span className={`text-[11.5px] leading-tight text-center line-clamp-2 ${active ? 'text-ink font-semibold' : 'text-ink-2'}`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Source / asset type */}
        {!isExpense && (
          <div>
            <label htmlFor="txn-text" className="field-label">{isIncome ? 'Source' : 'Asset type'}</label>
            <input
              id="txn-text"
              value={form[textKey]}
              onChange={(e) => set(textKey, e.target.value)}
              placeholder={isIncome ? 'e.g. Salary' : 'e.g. Mutual Funds'}
              maxLength={100}
              className="field"
            />
            <div className="rail mt-3">
              {textPresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set(textKey, p)}
                  className={`chip ${form[textKey] === p ? 'chip-active' : ''}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment mode */}
        {isExpense && (
          <div>
            <span className="field-label">Paid with <span className="text-muted font-normal">· optional</span></span>
            <div className="rail">
              {PAYMENT_MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('payment_mode', form.payment_mode === m ? '' : m)}
                  className={`chip ${form.payment_mode === m ? 'chip-active' : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date */}
        <div>
          <label htmlFor="txn-date" className="field-label">Date</label>
          <div className="relative">
            <CalendarDays size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              id="txn-date"
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
              className="field pl-11"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="txn-notes" className="field-label">Note <span className="text-muted font-normal">· optional</span></label>
          <textarea
            id="txn-notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Add a short note"
            rows={2}
            className="field"
          />
        </div>
      </form>
    </Sheet>
  );
}
