import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sharesApi } from '@/services/shares';
import type { CreateShareInput } from '@/types/share';

interface UseShareActionsOptions {
  onSuccess?: (data?: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * 统一的分享操作 hook
 * 整合所有分享相关的增删操作
 */
export function useShareActions(options: UseShareActionsOptions = {}) {
  const queryClient = useQueryClient();
  const { onSuccess, onError } = options;

  // 刷新分享缓存
  const invalidateShareQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['shares'] });
  };

  // 创建分享
  const createMutation = useMutation({
    mutationFn: (data: CreateShareInput) => sharesApi.create(data),
    onSuccess: (data) => {
      invalidateShareQueries();
      onSuccess?.(data);
    },
    onError: (error: Error) => onError?.(error),
  });

  // 删除分享
  const deleteMutation = useMutation({
    mutationFn: (slug: string) => sharesApi.delete(slug),
    onSuccess: () => {
      invalidateShareQueries();
      onSuccess?.();
    },
    onError: (error: Error) => onError?.(error),
  });

  return {
    // 操作方法
    createShare: createMutation.mutate,
    createShareAsync: createMutation.mutateAsync,
    deleteShare: deleteMutation.mutate,

    // 加载状态
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isLoading: createMutation.isPending || deleteMutation.isPending,

    // 结果数据
    createdShare: createMutation.data,
  };
}
