import { useCallback, useEffect, useState } from 'react';
import { getTheme, toggleTheme } from '../utils/theme';

export default function ThemeToggle() {
  const [theme, setThemeState] = useState(getTheme);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setThemeState(root.getAttribute('data-theme') || 'dark');
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback(() => {
    const next = toggleTheme();
    setThemeState(next);
  }, []);

  return (
    <button
      type="button"
      className="theme-toggle"
      id="themeToggle"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={handleClick}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          <svg className="icon-sun" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <circle cx="5" cy="5" r="2" fill="currentColor" />
            <line x1="5" y1="0.5" x2="5" y2="2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="8" x2="5" y2="9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="0.5" y1="5" x2="2" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="8" y1="5" x2="9.5" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="1.9" y1="1.9" x2="2.9" y2="2.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="7.1" y1="7.1" x2="8.1" y2="8.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="8.1" y1="1.9" x2="7.1" y2="2.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="2.9" y1="7.1" x2="1.9" y2="8.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <svg className="icon-moon" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M8.5 6.5 A4 4 0 1 1 3.5 1.5 A3 3 0 0 0 8.5 6.5 Z" fill="currentColor" />
          </svg>
        </span>
      </span>
    </button>
  );
}
