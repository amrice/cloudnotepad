import { api } from './api';
import type {
  CreateShareInput,
  ShareListResponse,
} from '@/types/share';

export const sharesApi = {
  // 获取分享列表
  async list() {
    return api.get<ShareListResponse>('/shares');
  },

  // 创建分享链接
  async create(data: CreateShareInput) {
    return api.post<{ slug: string; url: string; expiresAt?: string }>(
      '/shares',
      data
    );
  },

  // 删除分享
  async delete(slug: string) {
    return api.delete(`/shares/${slug}`);
  },

  // 更新分享（设置过期时间等）
  async update(slug: string, data: { expiresInDays?: number }) {
    return api.put<{ success: boolean }>(`/shares/${slug}`, data);
  },

  // 获取分享统计
  async getStats(slug: string) {
    return api.get<{ visitCount: number; createdAt: string }>(
      `/shares/${slug}/stats`
    );
  },

  // 根据 slug 获取分享内容
  async getBySlug(slug: string) {
    return api.get<{ title: string; content: string; createdAt: string }>(
      `/s/${slug}`
    );
  },
};
