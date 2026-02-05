import { json, error, Tag } from '../../shared/types';

// @ts-ignore - KV 是 EdgeOne Pages 全局变量
declare const KV: any;

// 获取标签列表
export async function handleList(request: Request): Promise<Response> {
  try {
    const result = await KV.list({ prefix: 'tag:', limit: 100 });
    const tags: Tag[] = [];
    for (const key of result.keys) {
      const data = await KV.get(key.name, { type: 'json' });
      if (data) tags.push(data);
    }
    tags.sort((a, b) => a.name.localeCompare(b.name));
    return json(tags);
  } catch (err) {
    console.error('List tags error:', err);
    return error(500, '获取标签列表失败');
  }
}

// 获取标签分组
export async function handleGroups(request: Request): Promise<Response> {
  try {
    const result = await KV.list({ prefix: 'tag:', limit: 100 });
    const tags: Tag[] = [];
    const groups: Record<string, Tag[]> = {};

    for (const key of result.keys) {
      const data = await KV.get(key.name, { type: 'json' });
      if (data) {
        if (data.groupId) {
          if (!groups[data.groupId]) groups[data.groupId] = [];
          groups[data.groupId].push(data);
        } else {
          tags.push(data);
        }
      }
    }

    const groupList = await KV.list({ prefix: 'tagGroup:', limit: 10 });
    const resultGroups = [];

    for (const key of groupList.keys) {
      const groupData = await KV.get(key.name, { type: 'json' });
      if (groupData) {
        resultGroups.push({
          id: groupData.id,
          name: groupData.name,
          children: groups[groupData.id] || [],
          noteCount: (groups[groupData.id] || []).reduce((sum: number, t: Tag) => sum + t.noteCount, 0),
        });
      }
    }

    return json(resultGroups);
  } catch (err) {
    console.error('Get groups error:', err);
    return error(500, '获取标签分组失败');
  }
}

// 创建标签
export async function handleCreate(request: Request): Promise<Response> {
  try {
    const { name, color, groupId } = await request.json();
    if (!name || name.length > 50) {
      return error(400, '标签名称长度必须在 1-50 之间');
    }
    const id = crypto.randomUUID();
    const tag = {
      id,
      name,
      color: color || '#3B82F6',
      groupId: groupId || null,
      noteCount: 0,
      createdAt: new Date().toISOString(),
    };
    await KV.put(`tag:${id}`, JSON.stringify(tag));
    return json(tag);
  } catch (err) {
    console.error('Create tag error:', err);
    return error(500, '创建标签失败');
  }
}

// 删除标签
export async function handleDelete(request: Request, id: string): Promise<Response> {
  try {
    await KV.delete(`tag:${id}`);
    return json({ success: true });
  } catch (err) {
    console.error('Delete tag error:', err);
    return error(500, '删除标签失败');
  }
}
