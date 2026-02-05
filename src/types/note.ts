// 笔记类型定义
export interface Note {
  id: string;
  title: string;
  content: string; // Markdown 内容
  html?: string; // 渲染后的 HTML（可选缓存）
  tags: string[]; // 标签 ID 数组
  version: number; // 乐观锁版本号
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteDraft {
  id: string;
  content: string;
  savedAt: string;
  version: number;
}

export interface NoteListItem {
  id: string;
  title: string;
  preview: string;
  tags: string[];
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  version: number; // 乐观锁
}

export interface NoteListResponse {
  notes: NoteListItem[];
  total: number;
  page: number;
  limit: number;
}

// 增量更新输入（用于 Diff）
export interface PatchNoteInput {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: any[];
  version: number;
}

// JSON Patch 操作类型
export type PatchOperation =
  | { op: 'add' | 'replace' | 'remove'; path: string; value?: string }
  | { op: 'test'; path: string; value: string };
