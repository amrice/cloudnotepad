import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/services/notes';
import type { Note, SaveNoteInput } from '@/types/note';

interface UseSaveNoteOptions {
  onSuccess?: (note: Note) => void;
  onError?: (error: Error) => void;
  onConflict?: (serverNote: Note, localData: SaveNoteInput) => void;
}

export function useSaveNote(options: UseSaveNoteOptions = {}) {
  const { onSuccess, onError, onConflict } = options;
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [conflictData, setConflictData] = useState<{
    serverNote: Note;
    localData: SaveNoteInput;
  } | null>(null);

  // 统一保存（创建或更新）
  const save = useCallback(
    async (data: SaveNoteInput): Promise<Note | null> => {
      if (isSaving) return null;
      setIsSaving(true);

      try {
        let result: Note;

        if (data.id) {
          // 更新
          result = await notesApi.update({
            id: data.id,
            title: data.title,
            content: data.content,
            tags: data.tags,
            version: data.version!,
          });
        } else {
          // 创建
          result = await notesApi.create({
            title: data.title,
            content: data.content,
            tags: data.tags,
          });
        }

        // 更新缓存
        queryClient.setQueryData(['note', result.id], result);
        queryClient.invalidateQueries({ queryKey: ['notes'] });

        onSuccess?.(result);
        return result;
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message?.includes('版本') || err.message?.includes('冲突')) {
          // 版本冲突
          const serverNote = await notesApi.get(data.id!);
          setConflictData({ serverNote, localData: data });
          onConflict?.(serverNote, data);
        } else {
          onError?.(err);
        }
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, queryClient, onSuccess, onError, onConflict]
  );

  // 使用服务器版本
  const useServerVersion = useCallback(() => {
    if (conflictData) {
      queryClient.setQueryData(['note', conflictData.serverNote.id], conflictData.serverNote);
      setConflictData(null);
      return conflictData.serverNote;
    }
    return null;
  }, [conflictData, queryClient]);

  // 强制覆盖保存
  const forceSave = useCallback(
    async (data: SaveNoteInput): Promise<Note | null> => {
      if (!conflictData) return null;
      setIsSaving(true);

      try {
        const result = await notesApi.update({
          id: data.id!,
          title: data.title,
          content: data.content,
          tags: data.tags,
          version: conflictData.serverNote.version,
        });

        queryClient.setQueryData(['note', result.id], result);
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        setConflictData(null);
        onSuccess?.(result);
        return result;
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('保存失败'));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [conflictData, queryClient, onSuccess, onError]
  );

  // 合并保存
  const mergeSave = useCallback(async (): Promise<Note | null> => {
    if (!conflictData) return null;

    const mergedContent = `=== 服务器版本 ===\n\n${conflictData.serverNote.content}\n\n=== 本地版本 ===\n\n${conflictData.localData.content}`;

    return forceSave({
      ...conflictData.localData,
      content: mergedContent,
    });
  }, [conflictData, forceSave]);

  // 关闭冲突
  const dismissConflict = useCallback(() => {
    setConflictData(null);
  }, []);

  return {
    save,
    isSaving,
    conflictData,
    useServerVersion,
    forceSave,
    mergeSave,
    dismissConflict,
  };
}
