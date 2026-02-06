import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useEffect, useRef } from 'react';
import { cn } from '@/utils/helpers';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = '开始写作...',
  readOnly = false,
  className,
}: TiptapEditorProps) {
  // 标记是否是用户输入导致的变化
  const isUserInput = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      isUserInput.current = true;
      onChange(editor.getHTML());
    },
  });

  // 只同步外部内容变化（非用户输入）
  useEffect(() => {
    if (editor && !isUserInput.current && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
    isUserInput.current = false;
  }, [content, editor]);

  return (
    <div className={cn('tiptap-editor', className)}>
      <EditorContent editor={editor} />
    </div>
  );
}
