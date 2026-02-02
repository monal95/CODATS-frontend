import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference or localStorage
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (dark) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    applyTheme(newValue);
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-primary-100 dark:bg-secondary-700 hover:bg-primary-200 dark:hover:bg-secondary-600 transition-colors duration-200"
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun size={20} className="text-primary-600" />
      ) : (
        <Moon size={20} className="text-primary-600" />
      )}
    </button>
  );
}
