// 分享类型定义
export interface Share {
  slug: string;
  noteId: string;
  customAlias?: string;
  isPublic: boolean;
  password?: string;
  expiresAt?: string;
  visitCount: number;
  createdAt: string;
}

export interface CreateShareInput {
  noteId: string;
  customAlias?: string;
  expiresInDays?: number;
  isPublic?: boolean;
  password?: string;
}

export interface UpdateShareInput {
  expiresInDays?: number;
  isPublic?: boolean;
  password?: string;
}

export interface ShareCheckResponse {
  slug: string;
  isPublic: boolean;
  requiresPassword: boolean;
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
