import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '@/services/tags';
import type {
  CreateTagInput,
  UpdateTagInput,
  MoveTagInput,
  MergeTagsInput,
} from '@/types/tag';

// 获取标签列表（扁平）
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.list(),
  });
}

// 获取标签分组（树形）
export function useTagGroups() {
  return useQuery({
    queryKey: ['tag-groups'],
    queryFn: () => tagsApi.groups(),
  });
}

// 创建标签
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagInput) => tagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
    },
  });
}

// 更新标签
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTagInput) => tagsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
    },
  });
}

// 删除标签
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
    },
  });
}

// 移动标签
export function useMoveTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MoveTagInput) => tagsApi.move(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
    },
  });
}

// 合并标签
export function useMergeTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MergeTagsInput) => tagsApi.merge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
    },
  });
}

// 创建分组
export function useCreateTagGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => tagsApi.createGroup(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
    },
  });
}

// 删除分组
export function useDeleteTagGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag-groups'] });
    },
  });
}
