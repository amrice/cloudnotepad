import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants';

type Theme = 'light' | 'dark' | 'system';

interface UIStore {
  sidebarOpen: boolean;
  theme: Theme;
  editorMode: 'edit' | 'preview';
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  setEditorMode: (mode: 'edit' | 'preview') => void;
  toggleSidebarCollapsed: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      editorMode: 'edit',
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setEditorMode: (mode) => set({ editorMode: mode }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// 初始化主题
export function initTheme(): void {
  const root = window.document.documentElement;
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
  const theme = savedTheme || 'system';

  const updateTheme = (isDark: boolean) => {
    root.classList.toggle('dark', isDark);
  };

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    if (theme === 'system') {
      updateTheme(mediaQuery.matches);
    }
  });

  // 应用主题
  if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
    updateTheme(true);
  }
}
