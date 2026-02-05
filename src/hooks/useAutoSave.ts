import { useEffect, useCallback, useRef } from 'react';
import { notesApi } from '@/services/notes';
import {
  saveNoteDraft,
  getNoteDraft,
  getNoteDraftHistory,
  clearNoteDraft,
  clearNoteDraftHistory,
} from '@/utils/storage';
import { NOTE_CONFIG } from '@/constants';
import { useDebounceCallback } from './useDebounce';

interface UseAutoSaveOptions {
  noteId: string;
  title: string;
  content: string;
  version: number;
  onSave: (newVersion: number) => void;
  onError: (error: Error) => void;
}

export function useAutoSave({
  noteId,
  title,
  content,
  version,
  onSave,
  onError,
}: UseAutoSaveOptions) {
  const lastSavedContent = useRef(content);
  const lastSavedTitle = useRef(title);
  const lastSavedVersion = useRef(version);
  const isSaving = useRef(false);

  // 保存到本地草稿
  const saveToLocal = useCallback((currentContent: string) => {
    saveNoteDraft(noteId, currentContent, lastSavedVersion.current);
  }, [noteId]);

  // 保存到云端
  const saveToCloud = useCallback(async (currentTitle: string, currentContent: string) => {
    // 新笔记不自动保存到云端
    if (noteId === 'new' || !noteId) return;
    if (isSaving.current) return;
    isSaving.current = true;

    try {
      // 使用全量更新（包含 title）
      const result = await notesApi.update({
        id: noteId,
        title: currentTitle,
        content: currentContent,
        version: lastSavedVersion.current,
      });

      lastSavedTitle.current = currentTitle;
      lastSavedContent.current = currentContent;
      lastSavedVersion.current = result.version;
      onSave(result.version);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('保存失败'));
    } finally {
      isSaving.current = false;
    }
  }, [noteId, onSave, onError]);

  // 防抖保存：停止编辑 5 秒后自动保存
  const handleChange = useDebounceCallback((data: unknown) => {
    const { title: t, content: c } = data as { title: string; content: string };
    saveToLocal(c);
    saveToCloud(t, c);
  }, NOTE_CONFIG.DRAFT_DEBOUNCE);

  // 监听内容变化
  useEffect(() => {
    if (content !== lastSavedContent.current || title !== lastSavedTitle.current) {
      handleChange({ title, content });
    }
  }, [title, content, handleChange]);

  // 恢复草稿
  const restoreDraft = useCallback(() => {
    return getNoteDraft(noteId);
  }, [noteId]);

  // 获取历史列表
  const getHistory = useCallback(() => {
    return getNoteDraftHistory(noteId);
  }, [noteId]);

  // 恢复历史版本（简化版，返回 null 表示不支持）
  const restoreFromHistory = useCallback((_targetVersion: number) => {
    // 历史恢复功能暂时禁用
    return null;
  }, []);

  // 清除草稿
  const clearDrafts = useCallback(() => {
    clearNoteDraft(noteId);
    clearNoteDraftHistory(noteId);
  }, [noteId]);

  return {
    restoreDraft,
    getHistory,
    restoreFromHistory,
    clearDrafts,
    isSaving: isSaving.current,
    lastSavedVersion: lastSavedVersion.current,
  };
}
