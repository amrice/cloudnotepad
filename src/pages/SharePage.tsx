import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sharesApi } from '@/services/shares';
import { Loading } from '@/components/ui';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/helpers';

export function SharePage() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['share', slug],
    queryFn: () => sharesApi.getBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            页面不存在
          </h1>
          <p className="text-gray-500">该分享链接无效或已过期</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className={cn(
        'sticky top-0 z-20 h-14',
        'px-4 flex items-center justify-center',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md',
        'border-b border-gray-200 dark:border-gray-800'
      )}>
        <span className="text-sm text-gray-500">云记事本分享</span>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {data.title || '无标题笔记'}
          </h1>

          <div className="text-sm text-gray-500 mb-8">
            分享于 {formatRelativeTime(data.createdAt)}
          </div>

          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </article>
      </main>
    </div>
  );
}
