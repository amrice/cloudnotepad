import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants';

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  user: { id: string; createdAt: string } | null;
  login: (token: string, user: { id: string; createdAt: string }) => void;
  logout: () => void;
  setSetupComplete: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      login: (token, user) => {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        set({ isAuthenticated: true, token, user });
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        set({ isAuthenticated: false, token: null, user: null });
      },
      setSetupComplete: () => {
        localStorage.setItem(STORAGE_KEYS.HAS_SETUP, 'true');
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);

// 获取 token 的工具函数
export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

// 检查是否已设置密码
export function hasSetup(): boolean {
  return localStorage.getItem(STORAGE_KEYS.HAS_SETUP) === 'true';
}
