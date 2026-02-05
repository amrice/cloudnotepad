import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/services/tags';
import type {
  CreateTagInput,
  UpdateTagInput,
  MoveTagInput,
  MergeTagsInput,
} from '@/types/tag';

interface UseTagActionsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 统一的标签操作 hook
 * 整合所有标签相关的增删改操作
 */
export function useTagActions(options: UseTagActionsOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  // 刷新标签缓存
  const invalidateTagQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['tags'] });
    queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
  };

  // 创建标签
  const createMutation = useMutation({
    mutationFn: (data: CreateTagInput) => tagsApi.create(data),
    onSuccess: () => {
      invalidateTagQueries();
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  // 更新标签
  const updateMutation = useMutation({
    mutationFn: (data: UpdateTagInput) => tagsApi.update(data),
    onSuccess: () => {
      invalidateTagQueries();
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  // 删除标签
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      invalidateTagQueries();
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  // 移动标签
  const moveMutation = useMutation({
    mutationFn: (data: MoveTagInput) => tagsApi.move(data),
    onSuccess: () => {
      invalidateTagQueries();
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  // 合并标签
  const mergeMutation = useMutation({
    mutationFn: (data: MergeTagsInput) => tagsApi.merge(data),
    onSuccess: () => {
      invalidateTagQueries();
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  // 创建分组
  const createGroupMutation = useMutation({
    mutationFn: (name: string) => tagsApi.createGroup(name),
    onSuccess: () => {
      invalidateTagQueries();
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  // 删除分组
  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => tagsApi.deleteGroup(id),
    onSuccess: () => {
      invalidateTagQueries();
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  return {
    // 操作方法
    createTag: createMutation.mutate,
    updateTag: updateMutation.mutate,
    deleteTag: deleteMutation.mutate,
    moveTag: moveMutation.mutate,
    mergeTags: mergeMutation.mutate,
    createGroup: createGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,

    // 加载状态
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isMoving: moveMutation.isPending,
    isMerging: mergeMutation.isPending,
    isCreatingGroup: createGroupMutation.isPending,
    isDeletingGroup: deleteGroupMutation.isPending,

    // 综合加载状态
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      moveMutation.isPending ||
      mergeMutation.isPending ||
      createGroupMutation.isPending ||
      deleteGroupMutation.isPending,
  };
}
