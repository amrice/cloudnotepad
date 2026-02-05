// 认证类型定义
export interface User {
  id: string;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

export interface LoginInput {
  password: string;
}

export interface SetupInput {
  password: string;
  confirmPassword: string;
}

export interface APIResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}
