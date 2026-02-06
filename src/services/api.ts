import type { APIResponse } from '@/types/auth';
import { API_CONFIG } from '@/constants';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // 携带 Cookie
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });

    const data: APIResponse<T> = await response.json();

    if (data.code !== 0) {
      // 处理 401 未登录
      if (data.code === 401) {
        // 延迟跳转，让用户看到提示
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
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
