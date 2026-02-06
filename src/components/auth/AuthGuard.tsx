import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loading } from '@/components/ui';
import { authApi } from '@/services/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'no-setup'>('loading');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 先检查是否已设置密码
      const setupResult = await authApi.checkSetup();
      if (!setupResult.hasSetup) {
        setStatus('no-setup');
        return;
      }

      // 再验证登录状态
      const verifyResult = await authApi.verify();
      setStatus(verifyResult.valid ? 'authenticated' : 'unauthenticated');
    } catch {
      setStatus('unauthenticated');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (status === 'no-setup') {
    return <Navigate to="/setup" state={{ from: location }} replace />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
