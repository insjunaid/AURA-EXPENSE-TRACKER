import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Plus, LogOut, Lock, ChevronDown, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useTheme } from '../context/ThemeContext';
import { categoryAPI, errorMessage } from '../services/api';
import { CURRENCIES } from '../lib/format';
import PageHeader from '../components/ui/PageHeader';
import CategoryIcon from '../components/CategoryIcon';

const CATEGORY_COLORS = ['#0f766e', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#16a34a', '#475569'];

function Section({ title, description, children, className = '' }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      {title && (
        <div className="mb-5">
          <h2 className="section-title">{title}</h2>
          {description && <p className="text-[13px] text-muted mt-1">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { categories, loadCategories, confirm } = useUI();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [saving, setSaving] = useState(false);

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const [newCat, setNewCat] = useState({ name: '', icon: '📦', color: CATEGORY_COLORS[0] });
  const [addingCat, setAddingCat] = useState(false);

  const dirty = name !== user?.name || email !== user?.email || currency !== user?.currency;

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim(), currency });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update profile'));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await updateProfile({ current_password: currentPassword, new_password: newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setPwOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change password'));
    } finally {
      setSavingPw(false);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    setAddingCat(true);
    try {
      await categoryAPI.create({ ...newCat, name: newCat.name.trim(), icon: newCat.icon || '📦' });
      toast.success('Category added');
      setNewCat({ name: '', icon: '📦', color: CATEGORY_COLORS[0] });
      loadCategories();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add category'));
    } finally {
      setAddingCat(false);
    }
  };

  const deleteCategory = async (cat) => {
    const ok = await confirm({
      title: `Delete “${cat.name}”?`,
      message: 'Categories that are used by existing expenses cannot be deleted.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await categoryAPI.delete(cat.id);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) {
      toast.error(errorMessage(err, 'This category cannot be deleted'));
    }
  };

  const signOut = async () => {
    const ok = await confirm({ title: 'Sign out of Aura?', message: 'Your data stays safe — you can sign back in any time.', confirmLabel: 'Sign out' });
    if (!ok) return;
    logout();
    navigate('/login');
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader eyebrow="Account" title="Profile" />

      {/* Identity */}
      <section className="card p-5 sm:p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-ink text-canvas flex items-center justify-center font-display text-3xl shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight truncate">{user?.name}</p>
          <p className="text-[13.5px] text-muted truncate">{user?.email}</p>
          {memberSince && <p className="text-[12px] text-muted mt-1">Member since {memberSince}</p>}
        </div>
      </section>

      {/* Details */}
      <Section title="Personal details">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-name" className="field-label">Name</label>
              <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className="field" required minLength={2} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="p-email" className="field-label">Email</label>
              <input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" required autoComplete="email" />
            </div>
          </div>
          <div>
            <span className="field-label">Currency</span>
            <div className="grid grid-cols-4 gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  aria-pressed={currency === c.code}
                  className={`h-14 rounded-2xl border flex flex-col items-center justify-center transition active:scale-95
                    ${currency === c.code ? 'border-ink bg-surface-2' : 'border-line/70 hover:border-ink/30'}`}
                >
                  <span className="text-[15px] font-semibold leading-none">{c.symbol}</span>
                  <span className="text-[11px] text-muted mt-1">{c.code}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving || !dirty} className="btn-primary w-full sm:w-auto">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </Section>

      {/* Security */}
      <section className="card">
        <button onClick={() => setPwOpen((o) => !o)} className="w-full flex items-center gap-3 p-5 sm:p-6 text-left" aria-expanded={pwOpen}>
          <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center"><Lock size={18} strokeWidth={1.8} /></div>
          <div className="flex-1">
            <p className="section-title">Password</p>
            <p className="text-[13px] text-muted">Change your sign-in password</p>
          </div>
          <ChevronDown size={18} className={`text-muted transition-transform ${pwOpen ? 'rotate-180' : ''}`} />
        </button>
        {pwOpen && (
          <form onSubmit={savePassword} className="px-5 sm:px-6 pb-6 space-y-4 animate-fade-in">
            <div>
              <label htmlFor="p-cur" className="field-label">Current password</label>
              <input id="p-cur" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="field" required autoComplete="current-password" />
            </div>
            <div>
              <label htmlFor="p-new" className="field-label">New password</label>
              <input id="p-new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="field" required minLength={6} placeholder="At least 6 characters" autoComplete="new-password" />
            </div>
            <button type="submit" disabled={savingPw} className="btn-primary w-full sm:w-auto">{savingPw ? 'Updating…' : 'Update password'}</button>
          </form>
        )}
      </section>

      {/* Categories */}
      <Section title="Expense categories" description="Add your own categories. Defaults can't be removed.">
        <form onSubmit={addCategory} className="p-3 rounded-2xl bg-surface-2/60 space-y-3 mb-4">
          <div className="flex gap-2">
            <input
              value={newCat.icon}
              onChange={(e) => setNewCat((c) => ({ ...c, icon: e.target.value }))}
              className="field !w-14 !px-0 text-center !bg-surface"
              maxLength={4}
              aria-label="Emoji"
            />
            <input
              value={newCat.name}
              onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
              className="field flex-1 !bg-surface"
              placeholder="New category name"
              maxLength={100}
              required
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
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
            <button type="submit" disabled={addingCat} className="btn-primary !h-10 !px-4 shrink-0"><Plus size={16} /> Add</button>
          </div>
        </form>

        <div className="divide-y divide-line/60 -mx-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 px-2 py-2.5">
              <CategoryIcon type="expense" name={cat.name} emoji={cat.icon} color={cat.color} size="sm" />
              <p className="flex-1 text-[14.5px] font-medium truncate">{cat.name}</p>
              {cat.is_default ? (
                <span className="text-[11.5px] text-muted px-2">Default</span>
              ) : (
                <button onClick={() => deleteCategory(cat)} className="icon-btn !w-9 !h-9 hover:!text-expense" aria-label={`Delete ${cat.name}`}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Appearance + sign out */}
      <section className="card divide-y divide-line/60">
        <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-5 text-left">
          <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
            {isDark ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
          </div>
          <div className="flex-1">
            <p className="section-title">Appearance</p>
            <p className="text-[13px] text-muted">{isDark ? 'Dark' : 'Light'} — tap to switch</p>
          </div>
        </button>
        <button onClick={signOut} className="w-full flex items-center gap-3 p-5 text-left text-expense">
          <div className="w-10 h-10 rounded-xl bg-expense/10 flex items-center justify-center"><LogOut size={18} strokeWidth={1.8} /></div>
          <span className="font-semibold">Sign out</span>
        </button>
      </section>

      <p className="text-center text-[12px] text-muted pt-2">Aura Wealth Manager</p>
    </div>
  );
}
