import { useState } from 'react';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthPicker({ month, year, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const currentDate = new Date();
  const isCurrentMonth = month === currentDate.getMonth() + 1 && year === currentDate.getFullYear();

  const goToPrev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const goToNext = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const goToCurrent = () => {
    onChange(currentDate.getMonth() + 1, currentDate.getFullYear());
  };

  const selectMonth = (m) => {
    onChange(m + 1, year);
    setIsOpen(false);
  };

  const changeYear = (delta) => {
    onChange(month, year + delta);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Prev button */}
        <button
          onClick={goToPrev}
          className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-dark-500 dark:text-dark-400"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Month/Year display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700
            hover:border-primary-400 dark:hover:border-primary-500 transition-all
            text-dark-900 dark:text-white font-semibold min-w-[180px] text-center"
        >
          {months[month - 1]} {year}
        </button>

        {/* Next button */}
        <button
          onClick={goToNext}
          className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors text-dark-500 dark:text-dark-400"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Today button */}
        {!isCurrentMonth && (
          <button
            onClick={goToCurrent}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-primary-600 dark:text-primary-400
              bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            Today
          </button>
        )}
      </div>

      {/* Dropdown calendar */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 left-0 z-50 w-72 p-4 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-200 dark:border-dark-700 animate-scale-in">
            {/* Year selector */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => changeYear(-1)}
                className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-bold text-dark-900 dark:text-white">{year}</span>
              <button
                onClick={() => changeYear(1)}
                className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors text-dark-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-3 gap-2">
              {months.map((m, i) => {
                const isSelected = i + 1 === month;
                const isCurrent = i === currentDate.getMonth() && year === currentDate.getFullYear();
                return (
                  <button
                    key={m}
                    onClick={() => selectMonth(i)}
                    className={`px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                      ${isSelected
                        ? 'gradient-bg text-white shadow-lg'
                        : isCurrent
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-700 dark:text-dark-300'
                      }`}
                  >
                    {m.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
