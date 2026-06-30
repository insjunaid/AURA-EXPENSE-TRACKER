import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-dark-200 dark:bg-dark-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-900"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs">☀️</span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs">🌙</span>

      {/* Sliding dot */}
      <span
        className={`absolute top-0.5 w-6 h-6 rounded-full bg-white dark:bg-dark-300 shadow-md transition-all duration-300 ${
          isDark ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'
        }`}
      />
    </button>
  );
}
