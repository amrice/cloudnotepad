import { create } from 'zustand';
import { authApi } from '@/services/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSetup: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  hasSetup: false,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const setupResult = await authApi.checkSetup();
      if (!setupResult.hasSetup) {
        set({ isAuthenticated: false, hasSetup: false, isLoading: false });
        return;
      }

      const verifyResult = await authApi.verify();
      set({
        isAuthenticated: verifyResult.valid,
        hasSetup: true,
        isLoading: false,
      });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ isAuthenticated: false });
      window.location.href = '/login';
    }
  },
}));
