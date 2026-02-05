// 分享类型定义
export interface Share {
  slug: string;
  noteId: string;
  customAlias?: string;
  expiresAt?: string;
  visitCount: number;
  createdAt: string;
}

export interface CreateShareInput {
  noteId: string;
  customAlias?: string;
  expiresInDays?: number; // 不传则默认 7 天
}

export interface ShareResponse {
  slug: string;
  url: string;
  expiresAt?: string;
}

export interface ShareListResponse {
  shares: Share[];
  total: number;
}
