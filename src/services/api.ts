import type { APIResponse } from '@/types/auth';
import { getAuthToken } from '@/stores/authStore';
import { API_CONFIG, STORAGE_KEYS } from '@/constants';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });

    const data: APIResponse<T> = await response.json();

    if (data.code !== 0) {
      // 处理特殊错误码
      if (data.code === 401) {
        // 未登录，清除 token 并刷新页面
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        window.location.href = '/login';
      }
      throw new Error(data.message || '请求失败');
    }

    return data.data as T;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_CONFIG.BASE_URL);
