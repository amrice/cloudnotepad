import { useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useTheme } from '@/hooks';
import { cn } from '@/utils/helpers';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const colorMode = theme === 'dark' ? 'dark' : 'light';

  if (readOnly) {
    return (
      <div data-color-mode={colorMode} className={className}>
        <MDEditor.Markdown source={content} />
      </div>
    );
  }

  // 基础工具栏（单行）
  const basicCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.divider,
    commands.link,
    commands.image,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
  ];

  // 扩展工具栏
  const expandedCommands = [
    commands.bold,
    commands.italic,
    commands.strikethrough,
    commands.divider,
    commands.title1,
    commands.title2,
    commands.title3,
    commands.divider,
    commands.link,
    commands.image,
    commands.quote,
    commands.code,
    commands.codeBlock,
    commands.divider,
    commands.unorderedListCommand,
    commands.orderedListCommand,
    commands.checkedListCommand,
    commands.divider,
    commands.hr,
    commands.table,
  ];

  // 展开/收起按钮
  const toggleCommand = {
    name: 'toggle-toolbar',
    keyCommand: 'toggle-toolbar',
    buttonProps: { 'aria-label': toolbarExpanded ? '收起工具栏' : '展开工具栏' },
    icon: toolbarExpanded ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    ),
    execute: () => setToolbarExpanded(!toolbarExpanded),
  };

  return (
    <div data-color-mode={colorMode} className={cn('md-editor-wrapper', className)}>
      <MDEditor
        value={content}
        onChange={(val) => onChange(val || '')}
        preview="live"
        height="100%"
        visibleDragbar={false}
        commands={toolbarExpanded ? expandedCommands : basicCommands}
        extraCommands={[
          commands.codeEdit,
          commands.codeLive,
          commands.codePreview,
          commands.divider,
          toggleCommand,
        ]}
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  );
}
