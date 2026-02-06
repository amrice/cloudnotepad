import { useState, memo, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sharesApi } from '@/services/shares';
import { Loading } from '@/components/ui';
import { formatRelativeTime } from '@/utils/date';
import { cn } from '@/utils/helpers';
import { useTheme } from '@/hooks';
import { Lock, Sun, Moon, Monitor } from 'lucide-react';
import { marked } from 'marked';

// 内容区域组件 - 使用 memo 避免主题切换时重新渲染
const ArticleContent = memo(function ArticleContent({ content }: { content: string }) {
  // 将 Markdown 转换为 HTML
  const htmlContent = useMemo(() => {
    return marked(content || '') as string;
  }, [content]);

  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
});

export function SharePage() {
  const { slug } = useParams();
  const [password, setPassword] = useState('');
  const [submittedPassword, setSubmittedPassword] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const { theme, setTheme } = useTheme();

  // 先检查分享是否需要密码
  const { data: checkData, isLoading: isChecking } = useQuery({
    queryKey: ['share-check', slug],
    queryFn: () => sharesApi.checkShare(slug!),
    enabled: !!slug,
    retry: false,
  });

  // 获取分享内容
  const { data, isLoading, error } = useQuery({
    queryKey: ['share', slug, submittedPassword],
    queryFn: () => sharesApi.getBySlug(slug!, submittedPassword || undefined),
    enabled: !!slug && (checkData?.isPublic || submittedPassword !== null),
    retry: false,
  });

  // 处理密码提交
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('请输入密码');
      return;
    }
    setPasswordError('');
    setSubmittedPassword(password);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // 分享不存在
  if (!checkData) {
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

  // 需要密码但还未输入或密码错误
  if (checkData.requiresPassword && !data) {
    const hasError = error && submittedPassword !== null;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-full max-w-sm mx-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-500" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
              此分享需要密码
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              请输入密码以查看内容
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className={cn(
                  'w-full px-4 py-2 rounded-lg border',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                )}
              />
              {(passwordError || hasError) && (
                <p className="mt-2 text-sm text-red-500">
                  {passwordError || '密码错误，请重试'}
                </p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full mt-4 px-4 py-2 rounded-lg',
                  'bg-blue-600 hover:bg-blue-700 text-white',
                  'font-medium transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? '验证中...' : '确认'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // 内容加载失败
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            加载失败
          </h1>
          <p className="text-gray-500">无法获取分享内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className={cn(
        'sticky top-0 z-20 h-14 w-full',
        'px-4 flex items-center justify-between',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md',
        'border-b border-gray-200 dark:border-gray-800'
      )}>
        <span className="text-sm text-gray-500">云记事本分享</span>

        {/* 主题切换 */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : theme === 'system' ? (
              <Monitor className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {showSettings && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowSettings(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">主题</div>
                {/* 跟随系统开关 */}
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Monitor className="w-4 h-4" />
                    <span>跟随系统</span>
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'system' ? 'light' : 'system')}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors duration-300",
                      theme === 'system' ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300",
                        theme === 'system' ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
                {/* 深色模式开关 */}
                {theme !== 'system' && (
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      <span>深色模式</span>
                    </div>
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors duration-300",
                        theme === 'dark' ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300",
                          theme === 'dark' ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
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

          <ArticleContent content={data.content} />
        </article>
      </main>
    </div>
  );
}
