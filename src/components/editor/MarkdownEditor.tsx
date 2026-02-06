import MDEditor from '@uiw/react-md-editor';
import { useTheme } from '@/hooks';
import { cn } from '@/utils/helpers';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export function MarkdownEditor({
  content,
  onChange,
  placeholder = '开始写作...',
  readOnly = false,
  className,
}: MarkdownEditorProps) {
  const { theme } = useTheme();
  const colorMode = theme === 'dark' ? 'dark' : 'light';

  if (readOnly) {
    return (
      <div data-color-mode={colorMode} className={className}>
        <MDEditor.Markdown source={content} />
      </div>
    );
  }

  return (
    <div data-color-mode={colorMode} className={cn('md-editor-wrapper', className)}>
      <MDEditor
        value={content}
        onChange={(val) => onChange(val || '')}
        preview="live"
        height="100%"
        visibleDragbar={false}
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  );
}
