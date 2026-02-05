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
  const { isAuthenticated, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 分享页面不需要检查
    if (location.pathname.startsWith('/s/')) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        // 检查服务器端是否已设置密码
        const setupRes = await fetch('/api/auth/check-setup');
        const setupData = await setupRes.json();

        if (setupData.code === 0 && !setupData.data.hasSetup) {
          if (location.pathname !== '/setup') {
            navigate('/setup', { replace: true });
          }
          setLoading(false);
          return;
        }

        // 如果有 token，验证其有效性
        if (token && isAuthenticated) {
          const verifyRes = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const verifyData = await verifyRes.json();

          if (verifyData.code !== 0 || !verifyData.data?.valid) {
            logout();
            if (location.pathname !== '/login' && location.pathname !== '/setup') {
              navigate('/login', { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate, location.pathname, token, isAuthenticated, logout]);

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
