import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/services/notes';
import type { CreateNoteInput, UpdateNoteInput, PatchNoteInput } from '@/types/note';

// 获取笔记列表
export function useNotes(params?: {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['notes', params],
    queryFn: () => notesApi.list(params),
  });
}

// 获取单篇笔记
export function useNote(id: string) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.get(id),
    enabled: !!id,
  });
}

// 创建笔记
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteInput) => notesApi.create(data),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.setQueryData(['note', newNote.id], newNote);
    },
  });
}

// 更新笔记（全量）
export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNoteInput) => notesApi.update(data),
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.setQueryData(['note', updatedNote.id], updatedNote);
    },
  });
}

// 更新笔记（增量）
export function usePatchNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatchNoteInput) => notesApi.patch(data),
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.setQueryData(['note', updatedNote.id], updatedNote);
    },
  });
}

// 删除笔记
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.removeQueries({ queryKey: ['note', id] });
    },
  });
}

// 搜索笔记
export function useSearchNotes(query: string) {
  return useQuery({
    queryKey: ['notes', 'search', query],
    queryFn: () => notesApi.search(query),
    enabled: query.length > 0,
  });
}
