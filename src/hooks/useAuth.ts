import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/auth';
import { useAuthStore, hasSetup } from '@/stores/authStore';

export function useLogin() {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => authApi.login(password),
    onSuccess: (data) => {
      if (data.success && data.token) {
        login(data.token, { id: 'user', createdAt: new Date().toISOString() });
        queryClient.clear();
      }
    },
  });
}

export function useSetup() {
  const { setSetupComplete } = useAuthStore();

  return useMutation({
    mutationFn: ({ password, confirmPassword }: { password: string; confirmPassword: string }) =>
      authApi.setup({ password, confirmPassword }),
    onSuccess: () => {
      setSetupComplete();
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useVerifySession() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['session'],
    queryFn: authApi.verify,
    enabled: isAuthenticated,
    retry: false,
  });
}

export function useCheckSetup() {
  return hasSetup();
}
