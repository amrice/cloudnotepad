import { json, error, encodeBase62, Share } from '../../shared/types';

// 获取分享列表
export async function handleList(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const result = await env.KV.list({ prefix: 'share:', limit: 100 });
    const shares: Share[] = [];

    for (const key of result.keys) {
      const data = await env.KV.get(key.name, { type: 'json' });
      if (data) {
        // 检查是否过期
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          continue;
        }
        shares.push(data);
      }
    }

    // 按创建时间倒序
    shares.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return json({ shares, total: shares.length });
  } catch (err) {
    console.error('List shares error:', err);
    return error(500, '获取分享列表失败');
  }
}

// 创建分享
export async function handleCreate(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const { noteId, customAlias, expiresInDays } = await request.json();

    // 验证笔记存在
    const note = await env.KV.get(`note:${noteId}`, { type: 'json' });
    if (!note) {
      return error(404, '笔记不存在');
    }

    // 检查分享数量限制
    const shareList = await env.KV.list({ prefix: 'share:', limit: 100 });
    const userShares = shareList.keys.filter(
      k => k.name.startsWith('share:') && !k.name.includes(':stats')
    );
    if (userShares.length >= 50) {
      return error(400, '分享数量已达上限（50个）');
    }

    // 生成 slug
    const slug = customAlias || encodeBase62(Date.now() + Math.floor(Math.random() * 10000));

    // 计算过期时间
    let expiresAt: string | undefined;
    if (expiresInDays && expiresInDays > 0) {
      const expires = new Date();
      expires.setDate(expires.getDate() + expiresInDays);
      expiresAt = expires.toISOString();
    }

    const share = {
      slug,
      noteId,
      customAlias,
      expiresAt,
      visitCount: 0,
      createdAt: new Date().toISOString(),
    };

    await env.KV.put(`share:${slug}`, JSON.stringify(share));

    const baseUrl = new URL(request.url).origin;
    return json({
      slug,
      url: `${baseUrl}/s/${slug}`,
      expiresAt,
    });
  } catch (err) {
    console.error('Create share error:', err);
    return error(500, '创建分享失败');
  }
}

// 删除分享
export async function handleDelete(
  request: Request,
  env: Env,
  slug: string
): Promise<Response> {
  try {
    await env.KV.delete(`share:${slug}`);
    return json({ success: true });
  } catch (err) {
    console.error('Delete share error:', err);
    return error(500, '删除分享失败');
  }
}
