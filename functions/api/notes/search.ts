import { json, error, encodeBase62 } from '../../shared/types';

// 搜索笔记
export async function handleSearch(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return error(400, '搜索词至少 2 个字符');
    }

    const queryLower = query.toLowerCase();
    const result = await env.KV.list({ prefix: 'note:', limit: 100 });
    const notes: Note[] = [];

    for (const key of result.keys) {
      const data = await env.KV.get(key.name, { type: 'json' });

      if (data && !data.isDeleted) {
        const match =
          data.title.toLowerCase().includes(queryLower) ||
          data.content.toLowerCase().includes(queryLower);

        if (match) {
          notes.push({
            id: data.id,
            title: data.title,
            preview: data.content.slice(0, 100),
            tags: data.tags,
            updatedAt: data.updatedAt,
          });
        }
      }
    }

    // 按相关性排序
    notes.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(queryLower) ? 1 : 0;
      const bTitle = b.title.toLowerCase().includes(queryLower) ? 1 : 0;
      return bTitle - aTitle || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return json(notes.slice(0, 20));
  } catch (err) {
    console.error('Search error:', err);
    return error(500, '搜索失败');
  }
}
