import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Sheet from './ui/Sheet';
import { MONTHS } from '../lib/format';

/**
 * Compact month switcher: ‹ Nov 2026 › — tap the label to jump to any
 * month/year in a sheet.
 */
export default function MonthPicker({ month, year, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  const now = new Date();
  const isCurrent = month === now.getMonth() + 1 && year === now.getFullYear();

  const prev = () => (month === 1 ? onChange(12, year - 1) : onChange(month - 1, year));
  const next = () => (month === 12 ? onChange(1, year + 1) : onChange(month + 1, year));

  return (
    <>
      <div className={`inline-flex items-center h-11 rounded-2xl bg-surface border border-line/70 shadow-soft ${className}`}>
        <button onClick={prev} className="w-10 h-full flex items-center justify-center text-ink-2 hover:text-ink rounded-l-2xl active:bg-surface-2" aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => { setPickerYear(year); setOpen(true); }}
          className="px-2 min-w-[104px] h-full text-[14px] font-semibold tracking-tight text-ink tabular"
          aria-label="Choose month"
        >
          {MONTHS[month - 1].slice(0, 3)} {year}
        </button>
        <button onClick={next} className="w-10 h-full flex items-center justify-center text-ink-2 hover:text-ink rounded-r-2xl active:bg-surface-2 disabled:opacity-30" aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Select month" size="sm">
        <div className="flex items-center justify-between mb-4">
          <button className="icon-btn" onClick={() => setPickerYear(y => y - 1)} aria-label="Previous year"><ChevronLeft size={18} /></button>
          <span className="font-display text-3xl tabular">{pickerYear}</span>
          <button className="icon-btn" onClick={() => setPickerYear(y => y + 1)} aria-label="Next year"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((m, i) => {
            const selected = i + 1 === month && pickerYear === year;
            const current = i === now.getMonth() && pickerYear === now.getFullYear();
            return (
              <button
                key={m}
                onClick={() => { onChange(i + 1, pickerYear); setOpen(false); }}
                className={`h-12 rounded-2xl text-sm font-medium transition active:scale-95 disabled:opacity-30
                  ${selected ? 'bg-ink text-canvas' : current ? 'bg-surface-2 text-ink ring-1 ring-ink/20' : 'text-ink-2 hover:bg-surface-2'}`}
              >
                {m.slice(0, 3)}
              </button>
            );
          })}
        </div>
        {!isCurrent && (
          <button
            className="btn-outline w-full mt-4 mb-[max(0.5rem,env(safe-area-inset-bottom))]"
            onClick={() => { onChange(now.getMonth() + 1, now.getFullYear()); setOpen(false); }}
          >
            Jump to this month
          </button>
        )}
      </Sheet>
    </>
  );
}
