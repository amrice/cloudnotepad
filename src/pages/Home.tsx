import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes, useCreateNote, useDeleteNote } from '@/hooks/useNotes';
import { useUIStore } from '@/stores/uiStore';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Button, Loading } from '@/components/ui';
import { formatRelativeTime } from '@/utils/date';
import { FileText, Plus, Trash2, Search } from 'lucide-react';
import { cn } from '@/utils/helpers';
import type { NoteListItem } from '@/types/note';

export function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { data, isLoading } = useNotes({ search });
  const createMutation = useCreateNote();
  const deleteMutation = useDeleteNote();

  const handleCreateNote = () => {
    createMutation.mutate(
      { title: '', content: '' },
      {
        onSuccess: (newNote) => {
          navigate(`/note/${newNote.id}`);
        },
      }
    );
  };

  const handleDeleteNote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这篇笔记吗？')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNoteClick = (note: NoteListItem) => {
    navigate(`/note/${note.id}`);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* 侧边栏 */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header
          className={cn(
            'h-14 border-b border-gray-200 dark:border-gray-700',
            'flex items-center px-4 gap-4',
            'bg-white dark:bg-gray-800'
          )}
        >
          <h1 className="text-lg font-semibold">我的笔记</h1>

          <div className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索笔记..."
                className={cn(
                  'w-full pl-9 pr-4 py-2',
                  'bg-gray-100 dark:bg-gray-700',
                  'border-none rounded-lg',
                  'text-sm',
                  'placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
              />
            </div>
          </div>

          <Button onClick={handleCreateNote} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">新建笔记</span>
          </Button>
        </header>

        {/* 笔记列表 */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loading size="lg" />
            </div>
          ) : data?.notes.length === 0 ? (
            <EmptyState onCreate={handleCreateNote} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data?.notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={() => handleNoteClick(note)}
                  onDelete={(e) => handleDeleteNote(e, note.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// 笔记卡片组件
interface NoteCardProps {
  note: NoteListItem;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card p-4 cursor-pointer',
        'transition-all duration-200',
        'hover:shadow-md hover:border-primary/50',
        'group'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
          {note.title || '无标题笔记'}
        </h3>
        <button
          onClick={onDelete}
          className={cn(
            'p-1 rounded opacity-0 group-hover:opacity-100',
            'hover:bg-red-100 dark:hover:bg-red-900/30',
            'text-gray-400 hover:text-red-500',
            'transition-all'
          )}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {note.preview || '暂无内容'}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{formatRelativeTime(note.updatedAt)}</span>
        {note.tags.length > 0 && (
          <div className="flex gap-1">
            {note.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-primary/10 text-primary rounded"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-gray-400">+{note.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 空状态组件
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        还没有笔记
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        创建第一篇笔记，开始记录您的想法
      </p>
      <Button onClick={onCreate}>
        <Plus className="w-4 h-4" />
        创建笔记
      </Button>
    </div>
  );
}
