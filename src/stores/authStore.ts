import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      logout: () => set({ token: null }),
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
    }
  )
);

// 获取 token 的辅助函数
export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}
