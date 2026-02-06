import { error } from '../../shared/types';

// @ts-ignore - KV 是 EdgeOne Pages 的全局变量
declare const KV: any;

const SETTINGS_KEY = 'settings:imagebed';

// GET /api/images/proxy?path=xxx - 代理图片
export async function onRequest(context: any): Promise<Response> {
  const { request } = context;

  if (request.method !== 'GET') {
    return error(405, 'Method not allowed');
  }

  const url = new URL(request.url);
  const path = url.searchParams.get('path');

  if (!path) {
    return error(400, '缺少 path 参数');
  }

  try {
    // 获取图床配置
    const settings = await KV.get(SETTINGS_KEY, 'json');
    if (!settings?.github) {
      return error(400, '图床未配置');
    }

    const { repo, branch } = settings.github;

    // 构建 GitHub raw URL
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;

    // 代理请求
    const res = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'CloudNotepad/1.0',
      },
    });

    if (!res.ok) {
      return error(404, '图片不存在');
    }

    // 返回图片，添加缓存
    return new Response(res.body, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return error(500, '加载图片失败');
  }
}
