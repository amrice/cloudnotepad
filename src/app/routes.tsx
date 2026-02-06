import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Loading } from '@/components/ui';

// 懒加载页面组件
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const EditorPage = lazy(() => import('@/pages/EditorPage').then(m => ({ default: m.EditorPage })));
const SharePage = lazy(() => import('@/pages/SharePage').then(m => ({ default: m.SharePage })));

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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LazyPage><HomePage /></LazyPage>,
  },
  {
    path: '/note/:id',
    element: <LazyPage><EditorPage /></LazyPage>,
  },
  {
    path: '/note/new',
    element: <LazyPage><EditorPage /></LazyPage>,
  },
  {
    path: '/s/:slug',
    element: <LazyPage><SharePage /></LazyPage>,
  },
]);
