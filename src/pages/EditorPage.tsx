import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/services/notes';
import { TiptapEditor } from '@/components/editor';
import { Button, Loading } from '@/components/ui';
import { ChevronLeft, Save, Share2, Check } from 'lucide-react';
import { cn } from '@/utils/helpers';

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // 获取笔记
  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.get(id!),
    enabled: !isNew && !!id,
  });

  // 保存笔记
  const saveMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => {
      if (isNew) {
        return notesApi.create({ ...data, tags: [] });
      }
      return notesApi.update({ id: id!, ...data, version });
    },
    onSuccess: (savedNote) => {
      setSaveStatus('saved');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (isNew && savedNote?.id) {
        navigate(`/note/${savedNote.id}`, { replace: true });
      }
    },
  });

  // 初始化内容
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setVersion(note.version || 0);
    }
  }, [note]);

  // 保存处理
  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    saveMutation.mutate({ title, content });
  }, [title, content, saveMutation]);

  // 自动保存
  useEffect(() => {
    if (isNew && !title && !content) return;

    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content]);

  if (isLoading && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Toolbar */}
      <header className={cn(
        'sticky top-0 z-20 h-14',
        'px-4 flex items-center gap-2',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md',
        'border-b border-gray-200 dark:border-gray-800'
      )}>
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="无标题笔记"
          className={cn(
            'flex-1 bg-transparent',
            'text-lg font-medium',
            'placeholder:text-gray-400',
            'focus:outline-none'
          )}
        />

        <SaveStatus status={saveStatus} />

        <Button variant="ghost" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4" />
        </Button>
      </header>

      {/* Editor */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="开始写作..."
            className="min-h-[calc(100vh-200px)] prose dark:prose-invert max-w-none"
          />
        </div>
      </main>
    </div>
  );
}

// 保存状态指示器
function SaveStatus({ status }: { status: 'saved' | 'saving' | 'unsaved' }) {
  return (
    <span className="text-xs text-gray-400 flex items-center gap-1">
      {status === 'saving' && '保存中...'}
      {status === 'saved' && (
        <>
          <Check className="w-3 h-3" />
          已保存
        </>
      )}
      {status === 'unsaved' && '未保存'}
    </span>
  );
}
