import { json, error } from '../../shared/types';

// @ts-ignore - KV 是 EdgeOne Pages 全局变量
declare const KV: any;

// 获取分享笔记（公开访问）
export async function handleGet(request: Request, slug: string): Promise<Response> {
  try {
    const share = await KV.get(`share:${slug}`, { type: 'json' });
    if (!share) return error(404, '分享不存在或已过期');
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return error(404, '分享已过期');
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
