import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

  // 初始化时应用主题
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return { theme, resolvedTheme, setTheme, toggleTheme };
}
