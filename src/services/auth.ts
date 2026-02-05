import { api } from './api';
import type { LoginResponse, SetupInput } from '@/types/auth';

export const authApi = {
  // 首次设置密码
  async setup(data: SetupInput) {
    return api.post<{ success: boolean }>('/auth/setup', data);
  },

  // 登录
  async login(password: string) {
    return api.post<LoginResponse>('/auth/login', { password });
  },

  // 登出
  async logout() {
    return api.post<void>('/auth/logout', {});
  },

  // 验证会话
  async verify() {
    return api.post<{ valid: boolean }>('/auth/verify', {});
  },
};
