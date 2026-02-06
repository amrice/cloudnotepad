import { json, error } from '../../shared/types';
import { authMiddleware } from '../auth/index';

// @ts-ignore - KV 是 EdgeOne Pages 的全局变量
declare const KV: any;

const SETTINGS_KEY = 'settings:imagebed';

// POST /api/images/upload - 上传图片
export async function onRequest(context: any): Promise<Response> {
  const { request } = context;

  if (request.method !== 'POST') {
    return error(405, 'Method not allowed');
  }

  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    // 获取图床配置
    const settings = await KV.get(SETTINGS_KEY, 'json');
    if (!settings?.github?.token) {
      return error(400, '请先配置图床');
    }

    // 解析上传的图片
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return error(400, '请选择图片');
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return error(400, '不支持的图片格式');
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return error(400, '图片大小不能超过 10MB');
    }

    // 上传到 GitHub
    const url = await uploadToGithub(settings.github, file);

    return json({ success: true, url });
  } catch (err) {
    console.error('上传失败:', err);
    return error(500, err instanceof Error ? err.message : '上传失败');
  }
}

// 上传到 GitHub
async function uploadToGithub(
  config: { token: string; repo: string; branch: string; path: string },
  file: File
): Promise<string> {
  const { token, repo, branch, path } = config;

  // 生成文件名
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `${path}/${filename}`.replace(/\/+/g, '/');

  // 读取文件内容并转为 Base64
  const buffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  // 调用 GitHub API
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'CloudNotepad/1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload: ${filename}`,
        content: base64,
        branch,
      }),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'GitHub 上传失败');
  }

  // 返回代理 URL
  return `/api/images/proxy?path=${encodeURIComponent(filePath)}`;
}
