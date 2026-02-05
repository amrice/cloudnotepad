// 分享页面渲染
export async function onRequest(
  context: {
    request: Request;
    env: Env;
    params: { slug: string };
  }
): Promise<Response> {
  const { request, env, params } = context;
  const slug = params.slug;

  try {
    const share = await env.KV.get(`share:${slug}`, { type: 'json' });

    if (!share) {
      return new Response('分享不存在', { status: 404 });
    }

    // 检查是否过期
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return new Response('分享已过期', { status: 404 });
    }

    // 获取笔记
    const note = await env.KV.get(`note:${share.noteId}`, { type: 'json' });

    if (!note) {
      return new Response('笔记不存在', { status: 404 });
    }

    // 更新访问次数
    share.visitCount = (share.visitCount || 0) + 1;
    await env.KV.put(`share:${slug}`, JSON.stringify(share));

    // 渲染分享页面
    const html = generateSharePage(note.title, note.content);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  } catch (err) {
    console.error('Share page error:', err);
    return new Response('加载失败', { status: 500 });
  }
}

function generateSharePage(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || '分享笔记'} - 云记事本</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: '#3B82F6',
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
    .prose { max-width: 65ch; }
    .prose h1, .prose h2, .prose h3 { margin-top: 1.5em; margin-bottom: 0.5em; }
    .prose p { margin-bottom: 1em; line-height: 1.7; }
    .prose code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; font-size: 0.875em; }
    .prose pre { background: #1f2937; color: #f9fafb; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
    .prose blockquote { border-left: 4px solid #3B82F6; padding-left: 1em; margin-left: 0; color: #6b7280; }
    .prose ul, .prose ol { padding-left: 1.5em; margin-bottom: 1em; }
    .prose img { max-width: 100%; border-radius: 0.5em; }
  </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
  <header class="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-800 sticky top-0 z-10">
    <h1 class="font-semibold truncate max-w-[200px] sm:max-w-md">${title || '无标题笔记'}</h1>
    <a href="/" class="flex items-center gap-1 text-sm text-primary hover:underline">
      <span>打开云记事本</span>
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  </header>

  <main class="max-w-3xl mx-auto px-4 py-8">
    <article class="prose dark:prose-invert">
      ${markdownToHtml(content)}
    </article>

    <footer class="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
      <p>来自云记事本</p>
    </footer>
  </main>

  <script>
    // Markdown 转 HTML（简化版）
    function markdownToHtml(md) {
      let html = md || '';

      // 代码块
      html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');

      // 行内代码
      html = html.replace(/\`([^\`]+)\`/g, '<code>$1</code>');

      // 粗体
      html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\_\_([^\_]+)\_\_/g, '<strong>$1</strong>');

      // 斜体
      html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
      html = html.replace(/\_([^\_]+)\_/g, '<em>$1</em>');

      // 删除线
      html = html.replace(/\~\~([^\~]+)\~\~/g, '<del>$1</del>');

      // 标题
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // 引用
      html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

      // 无序列表
      html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
      html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');

      // 有序列表
      html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

      // 链接
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

      // 图片
      html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

      // 段落
      html = html.replace(/\n\n/g, '</p><p>');

      return '<p>' + html + '</p>';
    }
  </script>
</body>
</html>`;
}
