import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_COLORS = { light: '#f7f7f5', dark: '#080809' };

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
    } catch { /* storage unavailable */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch { /* ignore */ }
    // Keep the mobile browser / PWA status bar in sync with the app theme
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute('content', isDark ? THEME_COLORS.dark : THEME_COLORS.light);
    });
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
