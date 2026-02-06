import { useState, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const colorMode = theme === 'dark' ? 'dark' : 'light';

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (readOnly) {
    return (
      <div data-color-mode={colorMode} className={className}>
        <MDEditor.Markdown source={content} />
      </div>
    );
  }

  // 自定义标题命令（只显示图标）
  const titleIconStyle = {
    fontSize: '11px',
    fontWeight: 700,
    width: '16px',
    height: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as const;

  const title1: typeof commands.title1 = {
    ...commands.title1,
    icon: <span style={titleIconStyle}>H1</span>,
  };
  const title2: typeof commands.title2 = {
    ...commands.title2,
    icon: <span style={titleIconStyle}>H2</span>,
  };
  const title3: typeof commands.title3 = {
    ...commands.title3,
    icon: <span style={titleIconStyle}>H3</span>,
  };

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
    title1,
    title2,
    title3,
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

  // 展开/收起按钮（仅移动端使用）
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

  // 根据设备类型决定工具栏配置
  const toolbarCommands = isMobile
    ? (toolbarExpanded ? expandedCommands : basicCommands)
    : expandedCommands;

  const extraToolbarCommands = isMobile
    ? [commands.codeEdit, commands.codeLive, commands.codePreview, commands.divider, toggleCommand]
    : [commands.codeEdit, commands.codeLive, commands.codePreview];

  return (
    <div data-color-mode={colorMode} className={cn('md-editor-wrapper', className)}>
      <MDEditor
        value={content}
        onChange={(val) => onChange(val || '')}
        preview="live"
        height="100%"
        visibleDragbar={false}
        commands={toolbarCommands}
        extraCommands={extraToolbarCommands}
        textareaProps={{
          placeholder,
        }}
      />
    </div>
  );
}
