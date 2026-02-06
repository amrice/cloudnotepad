import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  data: { title: string; content: string };
  onSave: () => void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  const save = useCallback(() => {
    const current = JSON.stringify(data);
    if (current !== lastSavedRef.current) {
      onSave();
      lastSavedRef.current = current;
    }
  }, [data, onSave]);

  useEffect(() => {
    if (!enabled) return;

    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 设置新的定时器
    timerRef.current = setTimeout(save, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  // 立即保存
  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    save();
  }, [save]);

  return { saveNow };
}
