import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useNote, useCreateNote } from '@/hooks/useNotes';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useConflictResolution } from '@/hooks/useConflict';
import { useUIStore } from '@/stores/uiStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { TiptapEditor, Toolbar, PreviewPanel } from '@/components/editor';
import { Button, Dialog, Input, Loading } from '@/components/ui';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/helpers';
import {
  ChevronLeft,
  Save,
  Share2,
  History,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';

export function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const isMobile = useIsMobile();
  const { sidebarOpen, toggleSidebar, editorMode, setEditorMode } = useUIStore();

  // 状态
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // 获取笔记数据
  const { data: note, isLoading } = useNote(isNew ? '' : id || '');

  // 自动保存
  const {
    restoreDraft,
    getHistory,
    restoreFromHistory,
  } = useAutoSave({
    noteId: id || 'new',
    content,
    version: note?.version || 0,
    onSave: (newVersion) => {
      console.log('Saved, new version:', newVersion);
    },
    onError: (error) => {
      console.error('Save error:', error);
    },
  });

  // 冲突处理
  const {
    isResolving,
    conflictData,
    saveWithConflictCheck,
    useServerVersion,
    mergeChanges,
    dismissConflict,
  } = useConflictResolution({
    noteId: id || '',
    onConflict: () => {
      // 冲突由 dialog 处理
    },
    onSaveSuccess: () => {
      // 保存成功
    },
    onError: (error) => {
      console.error('Conflict resolution error:', error);
    },
  });

  // 创建新笔记
  const createMutation = useCreateNote();

  const handleCreate = useCallback(() => {
    if (!title && !content) {
      navigate('/');
      return;
    }

    createMutation.mutate(
      { title, content, tags: [] },
      {
        onSuccess: (newNote) => {
          navigate(`/note/${newNote.id}`, { replace: true });
        },
      }
    );
  }, [title, content, navigate, createMutation]);

  // 保存笔记
  const handleSave = useCallback(() => {
    if (isNew) {
      handleCreate();
    } else if (note) {
      saveWithConflictCheck(content, note.version);
    }
  }, [isNew, content, note, handleCreate, saveWithConflictCheck]);

  // 恢复草稿
  useEffect(() => {
    if (note) {
      // 有笔记数据时，恢复草稿（如果存在）
      const draft = restoreDraft();
      if (draft && draft.content) {
        if (window.confirm('发现未保存的草稿，是否恢复？')) {
          setContent(draft.content);
        }
      }
    }
  }, [note, restoreDraft]);

  // 初始化内容
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  // 加载中
  if (isLoading && !isNew) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* 侧边栏 */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <EditorHeader
          title={title}
          onTitleChange={setTitle}
          onBack={() => navigate('/')}
          onSave={handleSave}
          onShare={() => setShowShare(true)}
          onHistory={() => setShowHistory(true)}
          isSaving={isResolving}
        />

        {/* 编辑器区域 */}
        <div className="flex-1 flex overflow-hidden">
          {isMobile ? (
            // 移动端：单栏布局
            <div className="flex-1 flex flex-col">
              <TiptapEditor
                content={content}
                onChange={(markdown) => {
                  setContent(markdown);
                }}
                className="flex-1"
              />
              <Toolbar
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                editor={null as any}
                showPreview={editorMode === 'preview'}
                onPreviewToggle={() =>
                  setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')
                }
              />
            </div>
          ) : (
            // PC端：双栏布局
            <>
              {/* 编辑区 */}
              <div
                className={cn(
                  'flex-1 flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700',
                  editorMode === 'preview' && 'hidden lg:flex'
                )}
              >
                <TiptapEditor
                  content={content}
                  onChange={(markdown) => {
                    setContent(markdown);
                  }}
                  className="flex-1"
                />
                <Toolbar
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  editor={null as any}
                  showPreview={editorMode === 'preview'}
                  onPreviewToggle={() =>
                    setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')
                  }
                />
              </div>

              {/* 预览区 */}
              <div
                className={cn(
                  'flex-1 flex flex-col overflow-hidden',
                  editorMode === 'edit' && 'hidden lg:flex'
                )}
              >
                <PreviewPanel content={content} className="flex-1" />
              </div>
            </>
          )}
        </div>
      </main>

      {/* 历史记录弹窗 */}
      {showHistory && (
        <HistoryDialog
          history={getHistory()}
          onRestore={(version) => {
            const content = restoreFromHistory(version);
            if (content) {
              setContent(content);
              setShowHistory(false);
            }
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* 分享弹窗 */}
      {showShare && (
        <ShareDialog
          noteId={id || ''}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* 冲突解决弹窗 */}
      {conflictData && (
        <ConflictDialog
          onUseServer={useServerVersion}
          onMerge={mergeChanges}
          onDismiss={dismissConflict}
        />
      )}
    </div>
  );
}

// 编辑器头部
interface EditorHeaderProps {
  title: string;
  onTitleChange: (value: string) => void;
  onBack: () => void;
  onSave: () => void;
  onShare: () => void;
  onHistory: () => void;
  isSaving: boolean;
}

function EditorHeader({
  title,
  onTitleChange,
  onBack,
  onSave,
  onShare,
  onHistory,
  isSaving,
}: EditorHeaderProps) {
  return (
    <header
      className={cn(
        'h-14 border-b border-gray-200 dark:border-gray-700',
        'flex items-center px-4 gap-2',
        'bg-white dark:bg-gray-800'
      )}
    >
      <button
        onClick={onBack}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="无标题笔记"
        className={cn(
          'flex-1 bg-transparent',
          'text-lg font-medium',
          'placeholder:text-gray-400',
          'focus:outline-none'
        )}
      />

      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 hidden sm:block">
          {isSaving ? '保存中...' : '已保存'}
        </span>

        <Button variant="ghost" size="sm" onClick={onHistory}>
          <History className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={onSave}>
          <Save className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={onShare}>
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

// 历史记录弹窗
interface HistoryDialogProps {
  history: unknown[];
  onRestore: (version: number) => void;
  onClose: () => void;
}

function HistoryDialog({ history, onRestore, onClose }: HistoryDialogProps) {
  return (
    <Dialog isOpen onClose={onClose} title="历史记录">
      <div className="max-h-[60vh] overflow-auto space-y-2">
        {history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">暂无历史记录</p>
        ) : (
          history.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div>
                  <p className="text-sm font-medium">
                    版本 {entry.fromVersion + 1}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatRelativeTime(entry.timestamp)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRestore(entry.fromVersion)}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            )
          )
        )}
      </div>
    </Dialog>
  );
}

// 分享弹窗
interface ShareDialogProps {
  noteId: string;
  onClose: () => void;
}

function ShareDialog({ noteId, onClose }: ShareDialogProps) {
  const [customAlias, setCustomAlias] = useState('');
  const [expiresDays, setExpiresDays] = useState(7);
  const [result, setResult] = useState<{ url: string } | null>(null);

  const { mutate: createShare, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId,
          customAlias: customAlias || undefined,
          expiresInDays: expiresDays,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data.data);
    },
  });

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.url);
    }
  };

  return (
    <Dialog isOpen onClose={onClose} title="分享笔记">
      <div className="space-y-4">
        {!result ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                自定义链接（可选）
              </label>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 text-sm">
                  /s/
                </span>
                <Input
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="自定义别名"
                  className="rounded-l-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                过期时间
              </label>
              <select
                value={expiresDays}
                onChange={(e) => setExpiresDays(Number(e.target.value))}
                className="input"
              >
                <option value={1}>1 天</option>
                <option value={7}>7 天</option>
                <option value={30}>30 天</option>
                <option value={0}>永不过期</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="secondary" onClick={onClose} className="flex-1">
                取消
              </Button>
              <Button
                onClick={() => createShare()}
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? '生成中...' : '生成分享链接'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                分享链接：
              </p>
              <div className="flex gap-2">
                <Input value={result.url} readOnly className="flex-1" />
                <Button onClick={handleCopy}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button onClick={onClose} className="w-full">
              完成
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}

// 冲突解决弹窗
interface ConflictDialogProps {
  onUseServer: () => void;
  onMerge: () => void;
  onDismiss: () => void;
}

function ConflictDialog({
  onUseServer,
  onMerge,
  onDismiss,
}: ConflictDialogProps) {
  return (
    <Dialog isOpen onClose={onDismiss} title="检测到冲突">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          这篇笔记在其他地方被修改过，请选择：
        </p>

        <div className="space-y-2">
          <Button
            variant="secondary"
            onClick={onUseServer}
            className="w-full justify-start"
          >
            <X className="w-4 h-4" />
            <span>使用服务器版本（放弃我的修改）</span>
          </Button>

          <Button
            variant="secondary"
            onClick={onMerge}
            className="w-full justify-start"
          >
            <Check className="w-4 h-4" />
            <span>合并两者内容</span>
          </Button>
        </div>

        <Button variant="ghost" onClick={onDismiss} className="w-full">
          取消
        </Button>
      </div>
    </Dialog>
  );
}
