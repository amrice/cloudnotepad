// EdgeOne Pages Functions 入口

export async function fetch(
  request: Request,
  env: Env,
  context: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // API 路由
  if (path.startsWith('/api/')) {
    return import('./api/[[path]].js').then(m => m.fetch(request, env, context));
  }

  // 分享页面路由
  if (path.startsWith('/s/')) {
    const slug = path.slice(3);
    return import('./share/[slug].js').then(m =>
      m.onRequest({ request, env, params: { slug } })
    );
  }

  // 其他请求返回 Next.js/SPA
  return new Response(null, {
    status: 302,
    headers: { Location: '/' },
  });
}
