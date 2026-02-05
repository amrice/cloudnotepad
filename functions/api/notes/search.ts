import { json, error, NoteListItem } from '../../shared/types';

// @ts-ignore - KV 是 EdgeOne Pages 全局变量
declare const KV: any;

// 搜索笔记
export async function handleSearch(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 2) {
      return error(400, '搜索词至少 2 个字符');
    }

    const queryLower = query.toLowerCase();
    const result = await KV.list({ prefix: 'note:', limit: 100 });
    const notes: NoteListItem[] = [];

    for (const key of result.keys) {
      const data = await KV.get(key.name, { type: 'json' });
      if (data && !data.isDeleted) {
        const match = data.title.toLowerCase().includes(queryLower) ||
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
