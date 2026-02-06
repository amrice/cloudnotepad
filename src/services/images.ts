// 图片上传服务

export const imagesApi = {
  // 上传图片
  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '上传失败');
    }

    return res.json();
  },

  // 删除图片
  async delete(path: string): Promise<void> {
    const res = await fetch(`/api/images/delete?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '删除失败');
    }
  },
};
