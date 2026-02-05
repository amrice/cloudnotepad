import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Login } from './pages/Login';
import { Setup } from './pages/Setup';
import { Home } from './pages/Home';
import { Editor } from './pages/Editor';
import { ShareView } from './pages/ShareView';
import { useEffect } from 'react';

// 检查是否首次访问
function useFirstVisit() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const hasVisited = localStorage.getItem('has_visited');
    if (!hasVisited && !isAuthenticated) {
      localStorage.setItem('has_visited', 'true');
    }
  }, [isAuthenticated]);
}

// 保护路由
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 公开路由
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// 检查是否需要首次设置
function SetupRoute({ children }: { children: React.ReactNode }) {
  const hasSetup = localStorage.getItem('has_setup');

  if (hasSetup) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  useFirstVisit();

  return (
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
      <Route
        path="/setup"
        element={
          <SetupRoute>
            <Setup />
          </SetupRoute>
        }
      />

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
  );
}
