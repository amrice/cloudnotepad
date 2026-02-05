import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { Setup } from './pages/Setup';
import { Home } from './pages/Home';
import { Editor } from './pages/Editor';
import { ShareView } from './pages/ShareView';
import { useEffect, useState } from 'react';

// 应用初始化检查
function AppInitializer({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 分享页面不需要检查
    if (location.pathname.startsWith('/s/')) {
      setLoading(false);
      return;
    }

    // 检查服务器端是否已设置密码
    fetch('/api/auth/check-setup')
      .then(res => res.json())
      .then(data => {
        if (data.code === 0 && !data.data.hasSetup) {
          if (location.pathname !== '/setup') {
            navigate('/setup', { replace: true });
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return <>{children}</>;
}

// 保护路由
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 公开路由（已登录则跳转首页）
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AppInitializer>
      <Routes>
        {/* 公开路由 */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/setup" element={<Setup />} />

        {/* 分享页面 */}
        <Route path="/s/:slug" element={<ShareView />} />

        {/* 受保护路由 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/note/:id"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/note/new"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppInitializer>
  );
}
