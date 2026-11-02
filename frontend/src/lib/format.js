// Shared formatting helpers — currency, numbers and (timezone-safe) dates.

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export const CURRENCY_SYMBOLS = Object.fromEntries(CURRENCIES.map(c => [c.code, c.symbol]));

export const currencySymbol = (code) => CURRENCY_SYMBOLS[code] || '₹';

/** 12345.5 → "12,345.5" (Indian grouping for INR, western for others). */
export function formatNumber(value, currencyCode = 'INR', { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString(currencyCode === 'INR' ? 'en-IN' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/** Full money string: "₹12,345". Negative values get a leading minus. */
export function formatMoney(value, currencyCode = 'INR', opts) {
  const n = Number(value) || 0;
  const sign = n < 0 ? '−' : '';
  return `${sign}${currencySymbol(currencyCode)}${formatNumber(Math.abs(n), currencyCode, opts)}`;
}

/** Compact money for chart axes: ₹1.2L, ₹45k, $1.2M. */
export function formatCompact(value, currencyCode = 'INR') {
  const n = Math.abs(Number(value) || 0);
  const s = currencySymbol(currencyCode);
  const sign = value < 0 ? '−' : '';
  if (currencyCode === 'INR') {
    if (n >= 1e7) return `${sign}${s}${+(n / 1e7).toFixed(1)}Cr`;
    if (n >= 1e5) return `${sign}${s}${+(n / 1e5).toFixed(1)}L`;
  } else if (n >= 1e6) {
    return `${sign}${s}${+(n / 1e6).toFixed(1)}M`;
  }
  if (n >= 1e3) return `${sign}${s}${+(n / 1e3).toFixed(1)}k`;
  return `${sign}${s}${Math.round(n)}`;
}

// ─── Dates ──────────────────────────────────────────────────────────────────
// The API uses plain "YYYY-MM-DD" strings. `new Date("2026-11-02")` parses as
// UTC midnight and can render as the previous day in some timezones, and
// `toISOString()` returns *yesterday* before 05:30 in India. These helpers
// keep everything in the user's local calendar.

/** Today's date as "YYYY-MM-DD" in the user's local timezone. */
export function todayISO() {
  const d = new Date();
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" → local Date (no timezone shift). */
export function parseISODate(str) {
  if (!str) return new Date(NaN);
  const [y, m, d] = String(str).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDate(str, opts = { day: 'numeric', month: 'short' }) {
  return parseISODate(str).toLocaleDateString('en-IN', opts);
}

/** "Today", "Yesterday", or "Mon, 3 Nov" for transaction group headers. */
export function relativeDayLabel(str) {
  const d = parseISODate(str);
  const today = parseISODate(todayISO());
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  });
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
