import { useState, useCallback } from 'react';
import { notesApi } from '@/services/notes';
import type { Note } from '@/types/note';

interface ConflictResolutionOptions {
  noteId: string;
  onConflict: (serverNote: Note) => void;
  onSaveSuccess: () => void;
  onError: (error: Error) => void;
}

export function useConflictResolution({
  noteId,
  onConflict,
  onSaveSuccess,
  onError,
}: ConflictResolutionOptions) {
  const [isResolving, setIsResolving] = useState(false);
  const [conflictData, setConflictData] = useState<{
    serverNote: Note;
    localContent: string;
  } | null>(null);

  // 保存并处理冲突
  const saveWithConflictCheck = useCallback(
    async (localContent: string, localVersion: number) => {
      setIsResolving(true);

      try {
        await notesApi.update({
          id: noteId,
          content: localContent,
          version: localVersion,
        });
        onSaveSuccess();
      } catch (error: any) {
        if (error.message?.includes('version') || error.message?.includes('conflict')) {
          // 发生冲突，获取服务器最新版本
          const serverNote = await notesApi.get(noteId);
          setConflictData({ serverNote, localContent });
          onConflict(serverNote);
        } else {
          onError(error);
        }
      } finally {
        setIsResolving(false);
      }
    },
    [noteId, onConflict, onSaveSuccess, onError]
  );

  // 使用服务器版本
  const useServerVersion = useCallback(() => {
    if (conflictData) {
      onConflict(conflictData.serverNote);
    }
  }, [conflictData, onConflict]);

  // 合并更改（保留两者）
  const mergeChanges = useCallback(async () => {
    if (!conflictData) return;

    const mergedContent = `=== 对方最新修改 ===\n\n${conflictData.serverNote.content}\n\n=== 我的修改 ===\n\n${conflictData.localContent}`;

    try {
      await notesApi.update({
        id: noteId,
        content: mergedContent,
        version: conflictData.serverNote.version,
      });
      onSaveSuccess();
      setConflictData(null);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('合并失败'));
    }
  }, [conflictData, noteId, onSaveSuccess, onError]);

  // 关闭冲突弹窗
  const dismissConflict = useCallback(() => {
    setConflictData(null);
  }, []);

  return {
    isResolving,
    conflictData,
    saveWithConflictCheck,
    useServerVersion,
    mergeChanges,
    dismissConflict,
  };
}
