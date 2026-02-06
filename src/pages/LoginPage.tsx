import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { Lock } from 'lucide-react';
import { authApi } from '@/services/auth';
import { toast } from '@/stores/toastStore';
import type { LoginDuration } from '@/types/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [duration, setDuration] = useState<LoginDuration>('7days');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.warning('请输入密码');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.login(password, duration);
      toast.success('登录成功');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error('登录失败', err instanceof Error ? err.message : '请检查密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            云记事本
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            请输入密码登录
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          <div className="space-y-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              保持登录状态
            </label>
            <div className="flex flex-col gap-2">
              {[
                { value: 'session', label: '临时（关闭浏览器后失效）' },
                { value: '7days', label: '7天（推荐）' },
                { value: '30days', label: '30天' },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="duration"
                    value={option.value}
                    checked={duration === option.value}
                    onChange={(e) => setDuration(e.target.value as LoginDuration)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>
      </div>
    </div>
  );
}
