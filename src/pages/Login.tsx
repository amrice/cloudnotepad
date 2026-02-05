import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { Lock } from 'lucide-react';

export function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    login(password, {
      onSuccess: (data) => {
        if (data.success) {
          navigate('/');
        } else {
          setError(data.message || '密码错误');
        }
      },
      onError: () => {
        setError('网络错误，请重试');
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              云记事本
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              请输入密码访问您的笔记
            </p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              disabled={isPending}
              error={error}
              autoFocus
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '验证中...' : '进入'}
            </Button>
          </form>

          {/* 首次使用提示 */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            首次使用？{' '}
            <button
              onClick={() => navigate('/setup')}
              className="text-primary hover:underline"
            >
              设置密码
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
