import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/constants';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    return saved || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // 应用主题
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;

    const isDark =
      newTheme === 'dark' ||
      (newTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
    setResolvedTheme(isDark ? 'dark' : 'light');
  }, []);

  // 初始化和监听
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, applyTheme]);

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setSystemTheme = () => setTheme('system');

  return {
    theme,
    resolvedTheme,
    setTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  };
}
