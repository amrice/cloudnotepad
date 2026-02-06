import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/components/ui';
import { KeyRound } from 'lucide-react';
import { authApi } from '@/services/auth';
import { toast } from '@/stores/toastStore';

export function SetupPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 4) {
      toast.warning('密码长度至少 4 位');
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.setup({ password, confirmPassword });
      toast.success('密码设置成功', '请使用新密码登录');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('设置失败', err instanceof Error ? err.message : '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            欢迎使用云记事本
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            首次使用，请设置访问密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="设置密码（至少4位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          <Input
            type="password"
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '设置中...' : '设置密码'}
          </Button>
        </form>
      </div>
    </div>
  );
}
