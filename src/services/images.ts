// 图片上传服务

export const imagesApi = {
  // 上传图片
  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/images/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const response = await res.json();

    if (!res.ok || response.code !== 0) {
      throw new Error(response.message || '上传失败');
    }

    return response.data;
  },

  // 删除图片
  async delete(path: string): Promise<void> {
    const res = await fetch(`/api/images/delete?path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const response = await res.json();

    if (!res.ok || response.code !== 0) {
      throw new Error(response.message || '删除失败');
    }
  },
};
