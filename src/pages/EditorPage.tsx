import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notesApi } from '@/services/notes';
import { MarkdownEditor } from '@/components/editor';
import { Button, Loading, ShareDialog } from '@/components/ui';
import { ChevronLeft, Save, Share2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { toast } from '@/stores/toastStore';

type SaveStatusType = 'idle' | 'saved' | 'saving' | 'unsaved' | 'error';

export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatusType>('idle');
  const [noteId, setNoteId] = useState<string | null>(id || null);

  // 追踪内容变化
  const prevContentRef = useRef({ title: '', content: '' });
  const serverContentRef = useRef({ title: '', content: '', version: 0 });
  const isInitialMount = useRef(true);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const isNew = !noteId;

  // 获取笔记
  const { data: note, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => notesApi.get(noteId!),
    enabled: !!noteId,
  });

  // 冲突处理：合并并重试
  const mergeAndRetry = useCallback(async (
    localChanges: { title?: string; content?: string },
    isFullSave: boolean
  ) => {
    const serverData = await notesApi.get(noteId!);
    const serverTitle = serverData.title || '';
    const serverContent = serverData.content || '';
    const serverVersion = serverData.version || 0;

    // 字段级合并
    let mergedTitle = title;
    let mergedContent = content;
    let hasConflict = false;

    // 检查 title 冲突
    if (localChanges.title !== undefined) {
      const serverTitleChanged = serverTitle !== serverContentRef.current.title;
      if (serverTitleChanged) {
        hasConflict = true;
      }
    } else {
      mergedTitle = serverTitle;
    }

    // 检查 content 冲突
    if (localChanges.content !== undefined) {
      const serverContentChanged = serverContent !== serverContentRef.current.content;
      if (serverContentChanged) {
        hasConflict = true;
      }
    } else {
      mergedContent = serverContent;
    }

    // 更新服务端基准
    serverContentRef.current = { title: serverTitle, content: serverContent, version: serverVersion };

    if (hasConflict) {
      toast.info('检测到冲突，已保留本地修改');
    }

    // 重试保存
    const retryData = isFullSave
      ? { id: noteId!, title: mergedTitle, content: mergedContent, version: serverVersion }
      : { id: noteId!, ...localChanges, version: serverVersion };

    const savedNote = await notesApi.partialUpdate(retryData);
    return savedNote;
  }, [noteId, title, content]);

  // 执行保存
  const doSave = useCallback(async (isFullSave: boolean) => {
    const prev = prevContentRef.current;
    const titleChanged = title !== prev.title;
    const contentChanged = content !== prev.content;

    if (!titleChanged && !contentChanged) {
      return;
    }

    setSaveStatus('saving');

    try {
      let savedNote;

      if (isNew) {
        // 新笔记：创建
        savedNote = await notesApi.create({ title, content, tags: [] });
        setNoteId(savedNote.id);
        navigate(`/note/${savedNote.id}`, { replace: true });
      } else if (isFullSave) {
        // 手动保存：全量
        savedNote = await notesApi.update({ id: noteId!, title, content, version });
      } else {
        // 自动保存：增量（仅发送变化的字段）
        const changes: { id: string; title?: string; content?: string; version: number } = {
          id: noteId!,
          version,
        };
        if (titleChanged) changes.title = title;
        if (contentChanged) changes.content = content;
        savedNote = await notesApi.partialUpdate(changes);
      }

      // 更新状态
      setSaveStatus('saved');
      prevContentRef.current = { title, content };
      if (savedNote?.version) {
        setVersion(savedNote.version);
        serverContentRef.current = { title, content, version: savedNote.version };
      }
    } catch (err: any) {
      // 409 冲突：自动重试
      if (err?.message?.includes('409') || err?.message?.includes('版本冲突')) {
        try {
          const changes: { title?: string; content?: string } = {};
          if (titleChanged) changes.title = title;
          if (contentChanged) changes.content = content;

          const savedNote = await mergeAndRetry(changes, isFullSave);
          setSaveStatus('saved');
          prevContentRef.current = { title, content };
          if (savedNote?.version) {
            setVersion(savedNote.version);
          }
          return;
        } catch (retryErr) {
          setSaveStatus('error');
          toast.error('保存失败', '冲突解决失败，请刷新页面');
          return;
        }
      }

      setSaveStatus('error');
      toast.error('保存失败', err instanceof Error ? err.message : '请稍后重试');
    }
  }, [isNew, noteId, title, content, version, navigate, mergeAndRetry]);

  // 手动保存（全量）
  const handleManualSave = useCallback(() => {
    doSave(true);
  }, [doSave]);

  // 自动保存（增量）
  const handleAutoSave = useCallback(() => {
    doSave(false);
  }, [doSave]);

  // 初始化内容
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setVersion(note.version || 0);
      prevContentRef.current = { title: note.title || '', content: note.content || '' };
      serverContentRef.current = { title: note.title || '', content: note.content || '', version: note.version || 0 };
      setSaveStatus('saved');
    }
  }, [note]);

  // 自动保存
  useEffect(() => {
    // 跳过初始渲染
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 新笔记且无内容时不触发
    if (isNew && !title.trim() && !content.trim()) {
      return;
    }

    // 检查内容是否真的变化
    if (title === prevContentRef.current.title &&
        content === prevContentRef.current.content) {
      return;
    }

    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content, isNew, handleAutoSave]);

  if (isLoading && !isNew) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex flex-col overflow-hidden">
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

        <Button variant="ghost" size="sm" onClick={handleManualSave}>
          <Save className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={() => noteId && setShowShareDialog(true)} disabled={!noteId}>
          <Share2 className="w-4 h-4" />
        </Button>
      </header>

      {/* Editor */}
      <main className="flex-1 overflow-hidden">
        <MarkdownEditor
          content={content}
          onChange={setContent}
          placeholder="开始写作..."
          className="h-[calc(100vh-56px)]"
        />
      </main>

      {/* 分享弹窗 */}
      {noteId && (
        <ShareDialog
          noteId={noteId}
          noteTitle={title}
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
        />
      )}
    </div>
  );
}

// 保存状态指示器
function SaveStatus({ status }: { status: SaveStatusType }) {
  if (status === 'idle') return null;

  return (
    <span className="text-xs text-gray-400 flex items-center gap-1">
      {status === 'saving' && '保存中...'}
      {status === 'saved' && (
        <>
          <Check className="w-3 h-3 text-green-500" />
          已保存
        </>
      )}
      {status === 'unsaved' && '未保存'}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-500" />
          保存失败
        </>
      )}
    </span>
  );
}
