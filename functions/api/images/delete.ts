import { json, error } from '../../shared/types';
import { authMiddleware } from '../auth/index';

// @ts-ignore - KV 是 EdgeOne Pages 的全局变量
declare const KV: any;

const SETTINGS_KEY = 'settings:imagebed';

// DELETE /api/images/delete?path=xxx - 删除图片
export async function onRequest(context: any): Promise<Response> {
  const { request } = context;

  if (request.method !== 'DELETE') {
    return error(405, 'Method not allowed');
  }

  const authError = await authMiddleware(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const path = url.searchParams.get('path');

  if (!path) {
    return error(400, '缺少 path 参数');
  }

  try {
    const settings = await KV.get(SETTINGS_KEY, 'json');
    if (!settings?.github?.token) {
      return error(400, '图床未配置');
    }

    const { token, repo, branch } = settings.github;

    // 先获取文件 SHA
    const getRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'CloudNotepad/1.0',
        },
      }
    );

    if (!getRes.ok) {
      return error(404, '文件不存在');
    }

    const fileData = await getRes.json();

    // 删除文件
    const delRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'CloudNotepad/1.0',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete: ${path}`,
          sha: fileData.sha,
          branch,
        }),
      }
    );

    if (!delRes.ok) {
      const data = await delRes.json();
      throw new Error(data.message || '删除失败');
    }

    return json({ success: true });
  } catch (err) {
    return error(500, err instanceof Error ? err.message : '删除失败');
  }
}
