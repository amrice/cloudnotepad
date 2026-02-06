import { json, error } from '../../shared/types';
import { authMiddleware } from '../auth/index';

// @ts-ignore - KV 是 EdgeOne Pages 的全局变量
declare const KV: any;

const SETTINGS_KEY = 'settings:imagebed';

// GET /api/settings/imagebed - 获取图床配置
async function getSettings(request: Request): Promise<Response> {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const settings = await KV.get(SETTINGS_KEY, 'json');
    return json(settings || { provider: 'github' });
  } catch (err) {
    return error(500, '获取配置失败');
  }
}

// PUT /api/settings/imagebed - 保存图床配置
async function saveSettings(request: Request): Promise<Response> {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const settings = await request.json();
    await KV.put(SETTINGS_KEY, JSON.stringify(settings));
    return json({ success: true });
  } catch (err) {
    return error(500, '保存配置失败');
  }
}

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const method = request.method;

  if (method === 'GET') {
    return getSettings(request);
  } else if (method === 'PUT') {
    return saveSettings(request);
  }

  return error(405, 'Method not allowed');
}
