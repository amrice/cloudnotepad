import { json, error, NoteListItem } from '../../shared/types';

// 获取笔记列表
export async function handleList(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');

    // 获取所有笔记
    const result = await env.KV.list({ prefix: 'note:', limit: 100 });
    const notes: NoteListItem[] = [];

    for (const key of result.keys) {
      const data = await env.KV.get(key.name, { type: 'json' });
      if (data && !data.isDeleted) {
        // 标签过滤
        if (tag && !data.tags.includes(tag)) continue;

        // 搜索过滤
        if (search) {
          const searchLower = search.toLowerCase();
          const match = data.title.toLowerCase().includes(searchLower) ||
            data.content.toLowerCase().includes(searchLower);
          if (!match) continue;
        }

        notes.push({
          id: data.id,
          title: data.title,
          preview: data.content.slice(0, 100),
          tags: data.tags,
          updatedAt: data.updatedAt,
        });
      }
    }

    // 排序（按更新时间倒序）
    notes.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // 分页
    const start = (page - 1) * limit;
    const paginatedNotes = notes.slice(start, start + limit);

    return json({
      notes: paginatedNotes,
      total: notes.length,
      page,
      limit,
    });
  } catch (err) {
    console.error('List notes error:', err);
    return error(500, '获取笔记列表失败');
  }
}

// 获取单篇笔记
export async function handleGet(
  request: Request,
  env: Env,
  id: string
): Promise<Response> {
  try {
    const data = await env.KV.get(`note:${id}`, { type: 'json' });

    if (!data || data.isDeleted) {
      return error(404, '笔记不存在');
    }

    return json(data);
  } catch (err) {
    console.error('Get note error:', err);
    return error(500, '获取笔记失败');
  }
}

// 创建笔记
export async function handleCreate(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body = await request.json();
    const { title, content, tags = [] } = body;

    // 生成 ID
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const note = {
      id,
      title: title || '',
      content: content || '',
      tags,
      version: 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    await env.KV.put(`note:${id}`, JSON.stringify(note));

    return json(note);
  } catch (err) {
    console.error('Create note error:', err);
    return error(500, '创建笔记失败');
  }
}

// 更新笔记（全量）
export async function handleUpdate(
  request: Request,
  env: Env,
  id: string
): Promise<Response> {
  try {
    const body = await request.json();
    const { title, content, tags, version } = body;

    // 获取现有笔记
    const existing = await env.KV.get(`note:${id}`, { type: 'json' });

    if (!existing || existing.isDeleted) {
      return error(404, '笔记不存在');
    }

    // 乐观锁检查
    if (existing.version !== version) {
      return error(409, '版本冲突，请刷新后重试');
    }

    const updated = {
      ...existing,
      title: title ?? existing.title,
      content: content ?? existing.content,
      tags: tags ?? existing.tags,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    await env.KV.put(`note:${id}`, JSON.stringify(updated));

    return json(updated);
  } catch (err) {
    console.error('Update note error:', err);
    return error(500, '更新笔记失败');
  }
}

// 删除笔记（软删除）
export async function handleDelete(
  request: Request,
  env: Env,
  id: string
): Promise<Response> {
  try {
    const existing = await env.KV.get(`note:${id}`, { type: 'json' });

    if (!existing) {
      return error(404, '笔记不存在');
    }

    const updated = {
      ...existing,
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    };

    await env.KV.put(`note:${id}`, JSON.stringify(updated));

    return json({ success: true });
  } catch (err) {
    console.error('Delete note error:', err);
    return error(500, '删除笔记失败');
  }
}
