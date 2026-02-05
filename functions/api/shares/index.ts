import { json, error, encodeBase62, Share } from '../../shared/types';

// @ts-ignore - KV 是 EdgeOne Pages 全局变量
declare const KV: any;

// 获取分享列表
export async function handleList(request: Request): Promise<Response> {
  try {
    const result = await KV.list({ prefix: 'share:', limit: 100 });
    const shares: Share[] = [];
    const keys = result?.keys || [];

    for (const key of keys) {
      const keyName = typeof key === 'string' ? key : key.name;
      if (!keyName) continue;

      const data = await KV.get(keyName, { type: 'json' });
      if (data && !(data.expiresAt && new Date(data.expiresAt) < new Date())) {
        shares.push(data);
      }
    }
    shares.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return json({ shares, total: shares.length });
  } catch (err) {
    console.error('List shares error:', err);
    return error(500, '获取分享列表失败: ' + String(err));
  }
}

// 创建分享
export async function handleCreate(request: Request): Promise<Response> {
  try {
    const { noteId, customAlias, expiresInDays } = await request.json();
    const note = await KV.get(`note:${noteId}`, { type: 'json' });
    if (!note) return error(404, '笔记不存在');

    const shareList = await KV.list({ prefix: 'share:', limit: 100 });
    const shareKeys = shareList?.keys || [];
    if (shareKeys.length >= 50) return error(400, '分享数量已达上限');

    const slug = customAlias || encodeBase62(Date.now() + Math.floor(Math.random() * 10000));
    let expiresAt: string | undefined;
    if (expiresInDays && expiresInDays > 0) {
      const expires = new Date();
      expires.setDate(expires.getDate() + expiresInDays);
      expiresAt = expires.toISOString();
    }

    const share = { slug, noteId, customAlias, expiresAt, visitCount: 0, createdAt: new Date().toISOString() };
    await KV.put(`share:${slug}`, JSON.stringify(share));

    const baseUrl = new URL(request.url).origin;
    return json({ slug, url: `${baseUrl}/s/${slug}`, expiresAt });
  } catch (err) {
    console.error('Create share error:', err);
    return error(500, '创建分享失败');
  }
}

// 删除分享
export async function handleDelete(request: Request, slug: string): Promise<Response> {
  try {
    await KV.delete(`share:${slug}`);
    return json({ success: true });
  } catch (err) {
    console.error('Delete share error:', err);
    return error(500, '删除分享失败');
  }
}
