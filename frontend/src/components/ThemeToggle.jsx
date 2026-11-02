import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ compact = false }) {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  if (compact) {
    return (
      <button onClick={toggleTheme} className="icon-btn" aria-label={label} title={label}>
        {isDark ? <Sun size={19} strokeWidth={1.8} /> : <Moon size={19} strokeWidth={1.8} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center h-8 w-[60px] rounded-full bg-surface-2 border border-line/70 transition"
      aria-label={label}
      title={label}
    >
      <Sun size={13} className="absolute left-2 text-muted" />
      <Moon size={13} className="absolute right-2 text-muted" />
      <span
        className={`absolute top-[3px] w-6 h-6 rounded-full bg-surface shadow-soft border border-line/70 flex items-center justify-center transition-all duration-300 ${
          isDark ? 'left-[31px]' : 'left-[3px]'
        }`}
      >
        {isDark ? <Moon size={12} className="text-ink" /> : <Sun size={12} className="text-ink" />}
      </span>
    </button>
  );
}
