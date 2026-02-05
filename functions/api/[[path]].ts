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
      },
    });
  }

  // 认证路由
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

  // 笔记路由
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

  if (path.startsWith('/api/notes/') && path !== '/api/notes/search') {
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

  if (path === '/api/tags/groups' && method === 'GET') {
    const { handleGroups } = await import('./tags/index.js');
    return handleGroups(request);
  }

  if (path.startsWith('/api/tags/') && path !== '/api/tags/groups') {
    const id = path.split('/').pop();
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

  if (path.startsWith('/api/shares/')) {
    const slug = path.split('/').pop();
    if (method === 'DELETE') {
      const { handleDelete } = await import('./shares/index.js');
      return handleDelete(request, slug);
    }
  }

  if (path.startsWith('/api/share/') && method === 'GET') {
    const slug = path.split('/').pop();
    const { handleGet } = await import('./shares/[slug].js');
    return handleGet(request, slug);
  }

  return new Response(JSON.stringify({ code: 404, message: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
