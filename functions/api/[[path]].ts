// 路由处理
export async function onRequest(
  context: { request: Request; env: Env; params: Record<string, string> }
): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // CORS 预检请求
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }

  // 认证路由（无需登录）
  if (path === '/api/auth/setup' && method === 'POST') {
    const { handleSetup } = await import('./auth/index.js');
    return handleSetup(request);
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const { handleLogin } = await import('./auth/index.js');
    return handleLogin(request);
  }

  if (path === '/api/auth/verify' && method === 'POST') {
    const { handleVerify } = await import('./auth/index.js');
    return handleVerify(request);
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    const { handleLogout } = await import('./auth/index.js');
    return handleLogout();
  }

  if (path === '/api/auth/check-setup' && method === 'GET') {
    const { handleCheckSetup } = await import('./auth/index.js');
    return handleCheckSetup();
  }

  if (path === '/api/auth/change-password' && method === 'POST') {
    const { handleChangePassword } = await import('./auth/index.js');
    return handleChangePassword(request);
  }

  if (path === '/api/auth/reset' && method === 'POST') {
    const { handleReset } = await import('./auth/index.js');
    return handleReset(request);
  }

  // 公开分享访问（无需登录）
  if (path.match(/^\/api\/share\/[^/]+\/check$/) && method === 'GET') {
    const parts = path.split('/');
    const slug = parts[3];
    const { handleCheck } = await import('./shares/[slug].js');
    return handleCheck(request, slug);
  }

  if (path.startsWith('/api/share/') && method === 'GET' && !path.endsWith('/check')) {
    const slug = path.split('/').pop();
    const { handleGet } = await import('./shares/[slug].js');
    return handleGet(request, slug);
  }

  // 以下路由需要认证
  const { authMiddleware } = await import('./auth/index.js');
  const authResult = await authMiddleware(request);
  if (authResult) {
    return authResult;
  }
  if (path === '/api/notes') {
    if (method === 'GET') {
      const { handleList } = await import('./notes/index.js');
      return handleList(request);
    }
    if (method === 'POST') {
      const { handleCreate } = await import('./notes/index.js');
      return handleCreate(request);
    }
  }

  if (path === '/api/notes/search' && method === 'GET') {
    const { handleSearch } = await import('./notes/search.js');
    return handleSearch(request);
  }

  // 笔记增量更新
  if (path.match(/^\/api\/notes\/[^/]+\/patch$/) && method === 'POST') {
    const parts = path.split('/');
    const id = parts[3];
    const { handlePatch } = await import('./notes/index.js');
    return handlePatch(request, id);
  }

  if (path.startsWith('/api/notes/') && path !== '/api/notes/search' && !path.endsWith('/patch')) {
    const id = path.split('/').pop();
    if (method === 'GET') {
      const { handleGet } = await import('./notes/index.js');
      return handleGet(request, id);
    }
    if (method === 'PUT') {
      const { handleUpdate } = await import('./notes/index.js');
      return handleUpdate(request, id);
    }
    if (method === 'DELETE') {
      const { handleDelete } = await import('./notes/index.js');
      return handleDelete(request, id);
    }
  }

  // 标签路由
  if (path === '/api/tags') {
    if (method === 'GET') {
      const { handleList } = await import('./tags/index.js');
      return handleList(request);
    }
    if (method === 'POST') {
      const { handleCreate } = await import('./tags/index.js');
      return handleCreate(request);
    }
  }

  if (path === '/api/tags/groups') {
    if (method === 'GET') {
      const { handleGroups } = await import('./tags/index.js');
      return handleGroups(request);
    }
    if (method === 'POST') {
      const { handleCreateGroup } = await import('./tags/index.js');
      return handleCreateGroup(request);
    }
  }

  if (path === '/api/tags/move' && method === 'POST') {
    const { handleMove } = await import('./tags/index.js');
    return handleMove(request);
  }

  if (path === '/api/tags/merge' && method === 'POST') {
    const { handleMerge } = await import('./tags/index.js');
    return handleMerge(request);
  }

  // 标签分组操作
  if (path.match(/^\/api\/tags\/groups\/[^/]+$/) && path !== '/api/tags/groups') {
    const id = path.split('/').pop();
    if (method === 'PUT') {
      const { handleUpdateGroup } = await import('./tags/index.js');
      return handleUpdateGroup(request, id);
    }
    if (method === 'DELETE') {
      const { handleDeleteGroup } = await import('./tags/index.js');
      return handleDeleteGroup(request, id);
    }
  }

  // 单个标签操作
  if (path.match(/^\/api\/tags\/[^/]+$/) && !path.includes('/groups') && path !== '/api/tags/move' && path !== '/api/tags/merge') {
    const id = path.split('/').pop();
    if (method === 'PUT') {
      const { handleUpdate } = await import('./tags/index.js');
      return handleUpdate(request, id);
    }
    if (method === 'DELETE') {
      const { handleDelete } = await import('./tags/index.js');
      return handleDelete(request, id);
    }
  }

  // 分享路由
  if (path === '/api/shares') {
    if (method === 'GET') {
      const { handleList } = await import('./shares/index.js');
      return handleList(request);
    }
    if (method === 'POST') {
      const { handleCreate } = await import('./shares/index.js');
      return handleCreate(request);
    }
  }

  // 分享统计
  if (path.match(/^\/api\/shares\/[^/]+\/stats$/) && method === 'GET') {
    const parts = path.split('/');
    const slug = parts[3];
    const { handleStats } = await import('./shares/index.js');
    return handleStats(request, slug);
  }

  // 单个分享操作
  if (path.match(/^\/api\/shares\/[^/]+$/) && !path.endsWith('/stats')) {
    const slug = path.split('/').pop();
    if (method === 'PUT') {
      const { handleUpdate } = await import('./shares/index.js');
      return handleUpdate(request, slug);
    }
    if (method === 'DELETE') {
      const { handleDelete } = await import('./shares/index.js');
      return handleDelete(request, slug);
    }
  }

  return new Response(JSON.stringify({ code: 404, message: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
