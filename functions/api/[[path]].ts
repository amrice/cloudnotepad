// 路由处理
export async function onRequest(
  context: { request: Request; env: Env; params: Record<string, string> }
): Promise<Response> {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 认证路由
  if (path === '/api/auth/setup') {
    const { handleSetup } = await import('./api/auth/index.js');
    return handleSetup(request, env);
  }

  if (path === '/api/auth/login') {
    const { handleLogin } = await import('./api/auth/index.js');
    return handleLogin(request, env);
  }

  if (path === '/api/auth/verify') {
    const { handleVerify } = await import('./api/auth/index.js');
    return handleVerify(request, env);
  }

  if (path === '/api/auth/logout') {
    const { handleLogout } = await import('./api/auth/index.js');
    return handleLogout();
  }

  // 笔记路由
  if (path === '/api/notes') {
    if (request.method === 'GET') {
      const { handleList } = await import('./api/notes/index.js');
      return handleList(request, env);
    }
    if (request.method === 'POST') {
      const { handleCreate } = await import('./api/notes/index.js');
      return handleCreate(request, env);
    }
  }

  if (path.startsWith('/api/notes/')) {
    const id = path.split('/').pop();
    if (request.method === 'GET') {
      const { handleGet } = await import('./api/notes/index.js');
      return handleGet(request, env, id);
    }
    if (request.method === 'PUT') {
      const { handleUpdate } = await import('./api/notes/index.js');
      return handleUpdate(request, env, id);
    }
    if (request.method === 'DELETE') {
      const { handleDelete } = await import('./api/notes/index.js');
      return handleDelete(request, env, id);
    }
  }

  if (path === '/api/notes/search') {
    const { handleSearch } = await import('./api/notes/search.js');
    return handleSearch(request, env);
  }

  // 标签路由
  if (path === '/api/tags') {
    if (request.method === 'GET') {
      const { handleList } = await import('./api/tags/index.js');
      return handleList(request, env);
    }
    if (request.method === 'POST') {
      const { handleCreate } = await import('./api/tags/index.js');
      return handleCreate(request, env);
    }
  }

  if (path === '/api/tags/groups') {
    const { handleGroups } = await import('./api/tags/index.js');
    return handleGroups(request, env);
  }

  if (path.startsWith('/api/tags/')) {
    const id = path.split('/').pop();
    if (request.method === 'DELETE') {
      const { handleDelete } = await import('./api/tags/index.js');
      return handleDelete(request, env, id);
    }
  }

  // 分享路由
  if (path === '/api/shares') {
    if (request.method === 'GET') {
      const { handleList } = await import('./api/shares/index.js');
      return handleList(request, env);
    }
    if (request.method === 'POST') {
      const { handleCreate } = await import('./api/shares/index.js');
      return handleCreate(request, env);
    }
  }

  if (path.startsWith('/api/shares/')) {
    const slug = path.split('/').pop();
    if (request.method === 'DELETE') {
      const { handleDelete } = await import('./api/shares/index.js');
      return handleDelete(request, env, slug);
    }
  }

  if (path.startsWith('/api/share/')) {
    const slug = path.split('/').pop();
    const { handleGet } = await import('./api/shares/[slug].js');
    return handleGet(request, env, slug);
  }

  return new Response('Not Found', { status: 404 });
}
