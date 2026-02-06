import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sharesApi } from '@/services/shares';
import { Loading } from '@/components/ui';
import { formatRelativeTime } from '@/utils/date';
import { useTheme } from '@/hooks';
import { Lock, Sun, Moon } from 'lucide-react';
import { marked } from 'marked';

export function SharePage() {
  const { slug } = useParams();
  const [password, setPassword] = useState('');
  const [submittedPassword, setSubmittedPassword] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const { theme, setTheme } = useTheme();

  // 检查分享是否需要密码
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

  // Markdown 转 HTML
  const htmlContent = useMemo(() => {
    if (!data?.content) return '';
    return marked(data.content) as string;
  }, [data?.content]);

  // 密码提交
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('请输入密码');
      return;
    }
    setPasswordError('');
    setSubmittedPassword(password);
  };

  // 切换主题
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // 加载中
  if (isChecking) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading />
      </div>
    );
  }

  // 分享不存在
  if (!checkData) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">页面不存在</h1>
          <p className="text-gray-500">该分享链接无效或已过期</p>
        </div>
      </div>
    );
  }

  // 需要密码
  if (checkData.requiresPassword && !data) {
    const hasError = error && submittedPassword !== null;
    return (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="bg-gray-50 dark:bg-gray-950">
        <div style={{ width: '100%', maxWidth: '24rem', margin: '0 1rem' }}>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">此分享需要密码</h2>
            <p className="text-sm text-gray-500 text-center mb-6">请输入密码以查看内容</p>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: hasError ? '#ef4444' : undefined }}
              />
              {(passwordError || hasError) && (
                <p className="mt-2 text-sm text-red-500">{passwordError || '密码错误，请重试'}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? '验证中...' : '确认'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 加载内容中
  if (isLoading) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading />
      </div>
    );
  }

  // 加载失败
  if (error || !data) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">加载失败</h1>
          <p className="text-gray-500">无法获取分享内容</p>
        </div>
      </div>
    );
  }

  // 正常显示内容
  return (
    <div style={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden' }} className="bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header
        style={{ width: '100%', height: '56px', position: 'sticky', top: 0, zIndex: 20 }}
        className="px-4 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
      >
        <span className="text-sm text-gray-500">云记事本分享</span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </header>

      {/* Content */}
      <main style={{ width: '100%', maxWidth: '48rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <article>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {data.title || '无标题笔记'}
          </h1>
          <div className="text-sm text-gray-500 mb-8">
            分享于 {formatRelativeTime(data.createdAt)}
          </div>
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </article>
      </main>
    </div>
  );
}
