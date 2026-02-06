import { json, error } from '../../shared/types';
import { authMiddleware } from '../auth/index';

// POST /api/settings/imagebed/test - 测试图床连接
export async function onRequest(context: any): Promise<Response> {
  const { request } = context;

  if (request.method !== 'POST') {
    return error(405, 'Method not allowed');
  }

  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const { provider, github } = await request.json();

    if (provider === 'github') {
      // 测试 GitHub API 连接
      const res = await fetch(
        `https://api.github.com/repos/${github.repo}`,
        {
          headers: {
            'Authorization': `Bearer ${github.token}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'CloudNotepad/1.0',
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        return error(400, data.message || '连接失败');
      }

      return json({ success: true, message: '连接成功' });
    }

    return error(400, '不支持的提供商');
  } catch (err) {
    return error(500, '测试失败');
  }
}
