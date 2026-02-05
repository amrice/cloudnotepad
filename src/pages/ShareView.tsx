import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { formatDateTime } from '@/utils/date';
import { Loading } from '@/components/ui';
import { Calendar, ExternalLink } from 'lucide-react';

interface ShareNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function ShareView() {
  const { slug } = useParams();
  const [note, setNote] = useState<ShareNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const res = await fetch(`/api/share/${slug}`);
        const data = await res.json();

        if (data.code !== 0) {
          setError(data.message || '分享不存在或已过期');
          return;
        }

        setNote(data.data);
      } catch {
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchShare();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            分享不存在
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  const html = (() => {
    try {
      const raw = marked.parse(note.content || '') as string;
      return DOMPurify.sanitize(raw);
    } catch {
      return '<p>加载失败</p>';
    }
  })();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* 顶部导航 */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-800">
        <h1 className="font-semibold text-gray-900 dark:text-white">
          {note.title || '无标题笔记'}
        </h1>
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <span>打开云记事本</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </header>

      {/* 内容区 */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <article
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* 底部信息 */}
        <footer className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>更新于 {formatDateTime(note.updatedAt)}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
