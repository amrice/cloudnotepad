import { useEffect, useCallback, useRef } from 'react';
import { notesApi } from '@/services/notes';
import {
  saveNoteDraft,
  saveNoteDraftHistory,
  getNoteDraft,
  getNoteDraftHistory,
  clearNoteDraft,
  clearNoteDraftHistory,
} from '@/utils/storage';
import { NOTE_CONFIG } from '@/constants';
import * as jsonpatch from 'fast-json-patch';
import { useDebounceCallback } from './useDebounce';

interface UseAutoSaveOptions {
  noteId: string;
  content: string;
  version: number;
  onSave: (newVersion: number) => void;
  onError: (error: Error) => void;
}

export function useAutoSave({
  noteId,
  content,
  version,
  onSave,
  onError,
}: UseAutoSaveOptions) {
  const lastSavedContent = useRef(content);
  const lastSavedVersion = useRef(version);
  const isSaving = useRef(false);

  // 保存到本地草稿
  const saveToLocal = useCallback((currentContent: string) => {
    saveNoteDraft(noteId, currentContent, lastSavedVersion.current);
  }, [noteId]);

  // 保存到云端
  const saveToCloud = useCallback(async (currentContent: string) => {
    if (isSaving.current) return;
    isSaving.current = true;

    try {
      // 计算增量
      const oldDoc = { content: lastSavedContent.current };
      const newDoc = { content: currentContent };
      const patch = jsonpatch.compare(oldDoc, newDoc);

      // 判断使用全量还是增量
      let result;
      if (patch.length > 0 && patch.length < 10) {
        // 变更较小时使用增量
        result = await notesApi.patch({
          id: noteId,
          patch: patch as { op: string; path: string; value?: unknown }[],
          version: lastSavedVersion.current,
        });
      } else {
        // 变更较大时使用全量
        result = await notesApi.update({
          id: noteId,
          content: currentContent,
          version: lastSavedVersion.current,
        });
      }

      lastSavedContent.current = currentContent;
      lastSavedVersion.current = result.version;
      onSave(result.version);

      // 保存增量到历史
      if (patch.length > 0) {
        saveNoteDraftHistory(noteId, patch, lastSavedVersion.current - 1);
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error('保存失败'));
    } finally {
      isSaving.current = false;
    }
  }, [noteId, onSave, onError]);

  // 防抖保存：停止编辑 5 秒后自动保存
  const handleContentChange = useDebounceCallback((newContent: unknown) => {
    const content = newContent as string;
    saveToLocal(content);
    saveToCloud(content);
  }, NOTE_CONFIG.DRAFT_DEBOUNCE);

  // 监听内容变化
  useEffect(() => {
    if (content !== lastSavedContent.current) {
      handleContentChange(content);
    }
  }, [content, handleContentChange]);

  // 恢复草稿
  const restoreDraft = useCallback(() => {
    return getNoteDraft(noteId);
  }, [noteId]);

  // 获取历史列表
  const getHistory = useCallback(() => {
    return getNoteDraftHistory(noteId);
  }, [noteId]);

  // 恢复历史版本
  const restoreFromHistory = useCallback((targetVersion: number) => {
    const history = getNoteDraftHistory(noteId);
    const targetEntry = history.find(
      (entry: { fromVersion: number }) => entry.fromVersion === targetVersion
    );

    if (!targetEntry) {
      return null;
    }

    try {
      const baseDoc = { content: lastSavedContent.current };
      const newDoc = jsonpatch.applyPatch(
        baseDoc,
        targetEntry.patch as jsonpatch.Operation[]
      ).newDocument;
      return newDoc.content;
    } catch {
      return null;
    }
  }, [noteId]);

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
