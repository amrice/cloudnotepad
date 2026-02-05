import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetup } from '@/hooks/useAuth';
import { Button, Input, Dialog } from '@/components/ui';
import { Lock, ArrowRight } from 'lucide-react';

export function Setup() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { mutate: setup, isPending } = useSetup();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('请设置密码');
      return;
    }

    if (password.length < 4) {
      setError('密码长度至少 4 位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setup(
      { password, confirmPassword },
      {
        onSuccess: () => {
          setShowSuccess(true);
        },
        onError: (error) => {
          setError(error.message || '设置失败');
        },
      }
    );
  };

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                欢迎使用云记事本
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                设置您的访问密码，保护笔记安全
              </p>
            </div>

            {/* 设置表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="设置密码"
                disabled={isPending}
                autoFocus
              />

              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="确认密码"
                disabled={isPending}
                error={password && confirmPassword && password !== confirmPassword ? '密码不一致' : undefined}
              />

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? '设置中...' : '开始使用'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* 成功弹窗 */}
      <Dialog
        isOpen={showSuccess}
        onClose={handleContinue}
        title="设置成功"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            密码设置成功！现在可以使用该密码登录访问您的笔记。
          </p>
          <Button onClick={handleContinue} className="w-full">
            <span>前往登录</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Dialog>
    </>
  );
}
