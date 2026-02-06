# 云记事本图片上传功能 - 规划文档

## 需求概述

为云记事本增加图片上传功能，使用 GitHub 作为图床存储方案。

## 方案可行性分析

### GitHub 图床方案

**技术可行性：✅ 可行**

| 项目 | 说明 | 状态 |
|------|------|------|
| GitHub Contents API | 支持 PUT 上传文件 | ✅ |
| 认证方式 | Personal Access Token | ✅ |
| 文件大小限制 | 100MB（实际约75MB） | ✅ |
| API 速率限制 | 5000请求/小时 | ✅ |
| EdgeOne 兼容性 | 完全支持 Fetch API | ✅ |

**主要问题：**

1. **国内访问问题** - raw.githubusercontent.com 在国内访问不稳定
2. **存储限制** - 单仓库建议不超过 1-2GB
3. **隐私问题** - 公开仓库图片任何人可访问

**解决方案：**

1. 使用 jsDelivr CDN 加速：`https://cdn.jsdelivr.net/gh/user/repo@main/path`
2. 或自建代理通过 EdgeOne Functions 转发请求
3. 添加缓存策略提升访问速度

### 替代方案对比

| 方案 | 成本 | 国内速度 | 存储限制 | 推荐度 |
|------|------|---------|---------|--------|
| GitHub + jsDelivr | 免费 | 中 | 1-2GB | ⭐⭐⭐ |
| Cloudflare R2 | 低 | 中 | 无限 | ⭐⭐⭐⭐⭐ |
| 腾讯云 COS | 低 | 优 | 无限 | ⭐⭐⭐⭐⭐ |

## 实施方案

### 采用方案：GitHub + jsDelivr CDN（MVP阶段）

**理由：**
- 零成本快速上线
- 验证功能可行性
- 后续可平滑迁移到其他存储

### 架构设计

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   前端      │────▶│  EdgeOne API     │────▶│   GitHub    │
│  (React)    │     │  /api/images/*   │     │   仓库      │
└─────────────┘     └──────────────────┘     └─────────────┘
       │                                            │
       │                                            ▼
       │                                     ┌─────────────┐
       └────────────────────────────────────▶│  jsDelivr   │
                    加载图片                  │    CDN      │
                                             └─────────────┘
```

### 功能模块

#### 1. 后端 API

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/images/upload` | POST | 上传图片到 GitHub |
| `/api/images/delete` | DELETE | 删除 GitHub 图片 |
| `/api/images/list` | GET | 列出已上传图片 |

#### 2. 前端组件

| 组件 | 功能 |
|------|------|
| ImageUploader | 图片上传组件（拖拽/粘贴/选择） |
| ImageGallery | 图片管理弹窗 |
| 编辑器集成 | 工具栏添加图片按钮 |

#### 3. 配置管理

需要在环境变量中配置：
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GITHUB_REPO` - 图片仓库（格式：owner/repo）
- `GITHUB_BRANCH` - 分支名（默认 main）

## 实施步骤

### 阶段一：后端 API 开发

- [ ] 1.1 创建 GitHub 图片仓库配置
- [ ] 1.2 实现图片上传 API (`/api/images/upload`)
- [ ] 1.3 实现图片删除 API (`/api/images/delete`)
- [ ] 1.4 实现图片列表 API (`/api/images/list`)
- [ ] 1.5 添加错误处理和速率限制保护

### 阶段二：前端组件开发

- [ ] 2.1 创建 ImageUploader 组件（支持拖拽/粘贴/选择）
- [ ] 2.2 创建图片上传服务 (`services/images.ts`)
- [ ] 2.3 集成到 Markdown 编辑器工具栏
- [ ] 2.4 支持粘贴图片自动上传
- [ ] 2.5 添加上传进度显示

### 阶段三：优化与测试

- [ ] 3.1 添加图片压缩（前端压缩后上传）
- [ ] 3.2 添加图片格式验证
- [ ] 3.3 添加文件大小限制提示
- [ ] 3.4 测试各种场景
- [ ] 3.5 优化用户体验

## 技术细节

### GitHub API 上传示例

```typescript
// 上传图片到 GitHub
async function uploadToGithub(
  imageBuffer: ArrayBuffer,
  filename: string
): Promise<string> {
  const base64 = btoa(
    String.fromCharCode(...new Uint8Array(imageBuffer))
  );

  const path = `img/uploads/${Date.now()}-${filename}`;

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload: ${filename}`,
        content: base64,
        branch: GITHUB_BRANCH,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  // 返回 jsDelivr CDN 链接
  return `https://cdn.jsdelivr.net/gh/${GITHUB_REPO}@${GITHUB_BRANCH}/${path}`;
}
```

### 前端上传组件示例

```typescript
// 图片上传 Hook
function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      // 压缩图片
      const compressed = await compressImage(file);

      // 上传到后端
      const formData = new FormData();
      formData.append('image', compressed);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const { url } = await response.json();
      return url;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
```

## 验收标准

1. ✅ 可以通过工具栏按钮选择图片上传
2. ✅ 可以拖拽图片到编辑器上传
3. ✅ 可以粘贴剪贴板图片上传
4. ✅ 上传过程显示进度
5. ✅ 上传成功后自动插入 Markdown 图片语法
6. ✅ 图片可以正常显示（通过 CDN）
7. ✅ 支持常见图片格式（JPG/PNG/GIF/WebP）
8. ✅ 文件大小限制提示（建议 10MB 以内）

## 风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| GitHub API 速率限制 | 上传失败 | 实现请求队列和重试机制 |
| jsDelivr 缓存延迟 | 图片不更新 | 使用唯一文件名 |
| 仓库存储满 | 无法上传 | 监控仓库大小，及时清理 |
| Token 泄露 | 安全风险 | Token 仅存后端，定期轮换 |

## 后续优化方向

1. **迁移到专业存储** - 用户量增长后迁移到 R2/COS
2. **图片管理** - 添加图片库管理功能
3. **图片处理** - 支持裁剪、压缩、格式转换
4. **CDN 优化** - 根据用户地区选择最优 CDN
