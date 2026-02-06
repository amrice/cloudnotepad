import { api } from './api';
import type {
  CreateShareInput,
  UpdateShareInput,
  ShareListResponse,
  ShareCheckResponse,
} from '@/types/share';

export const sharesApi = {
  // 获取分享列表
  async list() {
    return api.get<ShareListResponse>('/shares');
  },

  // 创建分享链接
  async create(data: CreateShareInput) {
    return api.post<{ slug: string; url: string; expiresAt?: string; isPublic: boolean }>(
      '/shares',
      data
    );
  },

  // 删除分享
  async delete(slug: string) {
    return api.delete(`/shares/${slug}`);
  },

  // 更新分享
  async update(slug: string, data: UpdateShareInput) {
    return api.put<{ success: boolean }>(`/shares/${slug}`, data);
  },

  // 获取分享统计
  async getStats(slug: string) {
    return api.get<{ visitCount: number; createdAt: string }>(
      `/shares/${slug}/stats`
    );
  },

  // 检查分享是否需要密码（公开访问）
  async checkShare(slug: string) {
    const response = await fetch(`/api/share/${slug}/check`);
    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(data.message);
    }
    return data.data as ShareCheckResponse;
  },

  // 根据 slug 获取分享内容（支持密码）
  async getBySlug(slug: string, password?: string) {
    const url = password ? `/api/share/${slug}?password=${encodeURIComponent(password)}` : `/api/share/${slug}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.code !== 0) {
      throw new Error(data.message);
    }
    return data.data as { title: string; content: string; createdAt: string };
  },
};
