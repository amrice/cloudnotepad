import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { cn } from '@/utils/helpers';

interface PreviewPanelProps {
  content: string;
  className?: string;
}

export function PreviewPanel({ content, className }: PreviewPanelProps) {
  const html = (() => {
    try {
      const raw = marked.parse(content || '') as string;
      return DOMPurify.sanitize(raw);
    } catch {
      return '<p>预览失败</p>';
    }
  })();

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'p-4 overflow-auto',
        'bg-white dark:bg-gray-800/50',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
