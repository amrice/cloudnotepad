// 笔记类型定义
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  version: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// 笔记列表项（不含完整内容）
export interface NoteListItem {
  id: string;
  title: string;
  preview: string;
  tags: string[];
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  groupId: string | null;
  noteCount: number;
  createdAt: string;
}

export interface Share {
  slug: string;
  noteId: string;
  customAlias?: string;
  expiresAt?: string;
  visitCount: number;
  createdAt: string;
}

// 响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

// 工具函数 - 返回 Response 对象
export function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ code: 0, message: 'success', data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function error(code: number, message: string): Response {
  return new Response(JSON.stringify({ code, message }), {
    status: code,
    headers: { 'Content-Type': 'application/json' },
  });
}

// JWT 验证（简化版）
export async function verifyToken(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: Record<string, unknown> }> {
  // 简化实现，实际应使用完整的 JWT 验证
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    // payload 在第一部分（简化 JWT 格式）
    const payload = JSON.parse(atob(parts[0]));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// 短链接编码
function encodeBase62(num: number): string {
  const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (num === 0) return '0';

  let result = '';
  while (num > 0) {
    result = charset[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

export { encodeBase62 };
