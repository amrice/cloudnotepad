import { cn } from '@/utils/helpers';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ToolbarProps {
  editor: {
    chain: () => {
      focus: () => {
        toggleBold: () => { run: () => void };
        toggleItalic: () => { run: () => void };
        toggleStrike: () => { run: () => void };
        toggleCode: () => { run: () => void };
        toggleBulletList: () => { run: () => void };
        toggleOrderedList: () => { run: () => void };
        toggleBlockquote: () => { run: () => void };
        setNode: (type: string, attrs?: Record<string, unknown>) => { run: () => void };
        unsetLink: () => { run: () => void };
      };
    };
    can: () => { undo: () => boolean; redo: () => boolean };
    undo: () => void;
    redo: () => void;
    isActive: (name: string, attrs?: Record<string, unknown>) => boolean;
  };
  onLinkClick?: () => void;
  onImageClick?: () => void;
  onPreviewToggle?: () => void;
  showPreview?: boolean;
  className?: string;
}

export function Toolbar({
  editor,
  onLinkClick,
  onImageClick,
  onPreviewToggle,
  showPreview = false,
  className,
}: ToolbarProps) {
  if (!editor) {
    return (
      <div
        className={cn(
          'flex items-center gap-1 px-3 py-2',
          'border-t border-gray-200 dark:border-gray-700',
          'bg-gray-50 dark:bg-gray-900/50',
          className
        )}
      >
        <div className="flex-1" />
        {onPreviewToggle && (
          <button
            type="button"
            onClick={onPreviewToggle}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-3 py-2',
        'border-t border-gray-200 dark:border-gray-700',
        'bg-gray-50 dark:bg-gray-900/50',
        'overflow-x-auto',
        className
      )}
    >
      {/* 撤销/重做 */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.undo()}
          disabled={!editor.can().undo()}
          title="撤销"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.redo()}
          disabled={!editor.can().redo()}
          title="重做"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* 标题 */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().setNode('heading', { level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="一级标题"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setNode('heading', { level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="二级标题"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setNode('heading', { level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="三级标题"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* 文本格式 */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="加粗"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="删除线"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="行内代码"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* 列表 */}
      <ToolbarGroup>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <Divider />

      {/* 插入 */}
      <ToolbarGroup>
        <ToolbarButton onClick={onLinkClick} active={editor.isActive('link')} title="插入链接">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={onImageClick} title="插入图片">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
      </ToolbarGroup>

      <div className="flex-1" />

      {/* 预览切换 */}
      {onPreviewToggle && (
        <ToolbarButton
          onClick={onPreviewToggle}
          active={showPreview}
          title={showPreview ? '关闭预览' : '打开预览'}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </ToolbarButton>
      )}
    </div>
  );
}

// 工具栏按钮
interface ToolbarButtonProps {
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      title={title}
      className={cn(
        'p-2 rounded transition-colors',
        disabled && 'opacity-30 cursor-not-allowed',
        active
          ? 'bg-primary/20 text-primary'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      )}
    >
      {children}
    </button>
  );
}

// 按钮分组
function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

// 分隔符
function Divider() {
  return <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;
}
