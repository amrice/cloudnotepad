import { json, error } from '../../shared/types';

// @ts-ignore - KV 是 EdgeOne Pages 全局变量
declare const KV: any;

// 密码哈希函数
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'share-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 检查分享信息（不返回内容，用于前端判断是否需要密码）
export async function handleCheck(request: Request, slug: string): Promise<Response> {
  try {
    const share = await KV.get(`share:${slug}`, { type: 'json' });
    if (!share) return error(404, '分享不存在或已过期');
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return error(404, '分享已过期');
    }

    return json({
      slug: share.slug,
      isPublic: share.isPublic,
      requiresPassword: !share.isPublic && !!share.password,
    });
  } catch (err) {
    console.error('Check share error:', err);
    return error(500, '检查分享失败');
  }
}

// 获取分享笔记（支持密码验证）
export async function handleGet(request: Request, slug: string): Promise<Response> {
  try {
    const share = await KV.get(`share:${slug}`, { type: 'json' });
    if (!share) return error(404, '分享不存在或已过期');
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return error(404, '分享已过期');
    }

    // 密码验证
    if (!share.isPublic && share.password) {
      const url = new URL(request.url);
      const password = url.searchParams.get('password');

      if (!password) {
        return error(401, '此分享需要密码访问');
      }

      const hashedInput = await hashPassword(password);
      if (hashedInput !== share.password) {
        return error(403, '密码错误');
      }
    }

    const note = await KV.get(`note:${share.noteId}`, { type: 'json' });
    if (!note || note.isDeleted) return error(404, '笔记不存在');

    share.visitCount = (share.visitCount || 0) + 1;
    await KV.put(`share:${slug}`, JSON.stringify(share));

    return json({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (err) {
    console.error('Get share error:', err);
    return error(500, '获取分享失败');
  }
}
