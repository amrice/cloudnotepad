import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notesApi } from '@/services/notes';
import { Button, Input, Loading } from '@/components/ui';
import { Plus, Search, FileText, Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { formatRelativeTime } from '@/utils/date';
import { useTheme } from '@/hooks';

export function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { theme, toggleTheme } = useTheme();

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  const { data, isLoading } = useQuery({
    queryKey: ['notes', { search }],
    queryFn: () => notesApi.list({ search }),
  });

  const handleCreateNote = () => {
    navigate('/note/new');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-20 h-16 px-4 lg:px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="h-full flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            云记事本
          </h1>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <Input
              size="sm"
              placeholder="搜索笔记..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title={theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '跟随系统'}
            >
              <ThemeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <Button onClick={handleCreateNote} icon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">新建笔记</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Input
          size="sm"
          placeholder="搜索笔记..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefixIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Content */}
      <main className="px-4 lg:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        ) : !data?.notes?.length ? (
          <EmptyState onCreateNote={handleCreateNote} />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => navigate(`/note/${note.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// 笔记卡片
interface NoteCardProps {
  note: {
    id: string;
    title: string;
    preview?: string;
    updatedAt: string;
    tags?: string[];
  };
  onClick: () => void;
}

function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-xl shadow-sm',
        'p-4 min-h-[160px] flex flex-col',
        'transition-all duration-200',
        'hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600'
      )}
    >
      <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
        {note.title || '无标题笔记'}
      </h3>

      <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
        {note.preview || '暂无内容'}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatRelativeTime(note.updatedAt)}
        </span>

        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {note.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 空状态
function EmptyState({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        还没有任何笔记
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        点击下方按钮创建第一篇笔记
      </p>
      <Button onClick={onCreateNote} icon={<Plus className="w-4 h-4" />}>
        新建笔记
      </Button>
    </div>
  );
}
