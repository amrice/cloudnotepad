import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loading } from '@/components/ui';
import { AuthGuard } from '@/components/auth';

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const EditorPage = lazy(() => import('@/pages/EditorPage').then(m => ({ default: m.EditorPage })));
const SharePage = lazy(() => import('@/pages/SharePage').then(m => ({ default: m.SharePage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const SetupPage = lazy(() => import('@/pages/SetupPage').then(m => ({ default: m.SetupPage })));

// 加载中组件
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading />
    </div>
  );
}

// 懒加载包装器
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// 需要认证的页面包装器
function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <LazyPage>{children}</LazyPage>
    </AuthGuard>
  );
}

export const router = createBrowserRouter([
  // 公开路由
  {
    path: '/login',
    element: <LazyPage><LoginPage /></LazyPage>,
  },
  {
    path: '/setup',
    element: <LazyPage><SetupPage /></LazyPage>,
  },
  {
    path: '/s/:slug',
    element: <LazyPage><SharePage /></LazyPage>,
  },
  // 需要认证的路由
  {
    path: '/',
    element: <ProtectedPage><HomePage /></ProtectedPage>,
  },
  {
    path: '/note/:id',
    element: <ProtectedPage><EditorPage /></ProtectedPage>,
  },
  {
    path: '/note/new',
    element: <ProtectedPage><EditorPage /></ProtectedPage>,
  },
]);
