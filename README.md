# 云记事本 (CloudNotepad)

一个简单好用的个人笔记管理工具，支持部署至腾讯云 EdgeOne Pages。

## 功能特性

- 📝 **富文本编辑器** - 基于 Tiptap，支持 Markdown 语法实时转换
- 🔄 **自动保存** - 编辑时自动保存到浏览器和云端，支持增量同步
- 📱 **响应式设计** - PC 和移动端自适应布局
- 🌓 **主题切换** - 支持亮色/暗色主题，跟随系统设置
- 🏷️ **标签管理** - 笔记分类、筛选、批量管理
- 🔗 **分享功能** - 生成短链接分享笔记（Base62 编码）
- 📊 **版本控制** - 乐观锁机制，支持冲突检测与解决
- 💾 **离线草稿** - 本地存储草稿，断网不丢失

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式方案 | Tailwind CSS |
| 富文本编辑 | Tiptap (ProseMirror) |
| 状态管理 | Zustand |
| 数据请求 | TanStack Query |
| UI 组件 | Radix UI (无头组件) |
| 后端服务 | EdgeOne Pages Functions |
| 数据存储 | EdgeOne KV |

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 代码检查

```bash
npm run lint      # ESLint 检查
npm run lint:fix  # 自动修复
```

## 部署到 EdgeOne Pages

### 方式一：通过 Git 仓库部署（推荐）

1. **推送代码到 GitHub/GitLab**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/cloudnotepad.git
   git push -u origin main
   ```

2. **登录 EdgeOne Pages 控制台**

   访问 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)

3. **创建新项目**

   - 点击「创建项目」
   - 选择「从 Git 导入」
   - 授权并选择你的仓库

4. **配置构建设置**

   | 配置项 | 值 |
   |--------|-----|
   | 框架预设 | Vite |
   | 构建命令 | `npm run build` |
   | 输出目录 | `dist` |
   | Node.js 版本 | 18 |

5. **配置 KV 命名空间**

   - 在项目设置中找到「KV 存储」
   - 创建一个新的 KV 命名空间，命名为 `NOTES_KV`
   - 绑定到 Functions

6. **部署**

   点击「部署」按钮，等待构建完成即可访问。

### 方式二：CLI 部署

1. **安装 EdgeOne CLI**

   ```bash
   npm install -g @edgeone/cli
   ```

2. **登录**

   ```bash
   edgeone login
   ```

3. **初始化项目**

   ```bash
   edgeone pages init
   ```

4. **部署**

   ```bash
   npm run build
   edgeone pages deploy
   ```

### 环境变量配置

在 EdgeOne Pages 控制台的「环境变量」中配置：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_URL` | API 基础地址 | `https://your-domain.pages.dev` |
| `VITE_APP_NAME` | 应用名称 | `云记事本` |

本地开发时，复制 `.env.example` 为 `.env` 进行配置。

### Functions 配置

项目使用 EdgeOne Pages Functions 作为后端，API 路由位于 `functions/` 目录：

```
functions/
├── api/
│   ├── notes/
│   │   ├── index.ts      # GET /api/notes - 获取笔记列表
│   │   └── [id].ts       # GET/PUT/DELETE /api/notes/:id
│   ├── tags/
│   │   └── index.ts      # GET /api/tags - 获取标签列表
│   └── share/
│       └── [slug].ts     # GET /api/share/:slug - 获取分享笔记
└── shared/
    └── types.ts          # 共享类型定义
```

### KV 数据结构

| Key 格式 | 说明 |
|----------|------|
| `note:{id}` | 笔记数据 |
| `notes:list` | 笔记列表索引 |
| `tags:list` | 标签列表 |
| `share:{slug}` | 分享链接映射 |

## 项目结构

```
cloudnotepad/
├── src/
│   ├── components/       # React 组件
│   │   ├── ui/           # 基础 UI 组件 (Button, Input, Dialog...)
│   │   ├── editor/       # 编辑器相关组件
│   │   └── sidebar/      # 侧边栏组件
│   ├── pages/            # 页面组件
│   ├── hooks/            # 自定义 Hooks
│   │   ├── useNotes.ts   # 笔记 CRUD
│   │   ├── useAutoSave.ts # 自动保存
│   │   └── useTags.ts    # 标签管理
│   ├── stores/           # Zustand 状态管理
│   ├── services/         # API 服务层
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型定义
│   └── constants/        # 常量定义
├── functions/            # EdgeOne Functions (后端)
├── public/               # 静态资源
└── dist/                 # 构建输出
```

## 开发指南

### 添加新的 API 端点

1. 在 `functions/api/` 下创建对应的 `.ts` 文件
2. 导出 `onRequest` 函数处理请求
3. 使用 `functions/shared/types.ts` 中的工具函数

```typescript
import { json, error } from '../../shared/types';

export async function onRequest(context: EventContext<Env, string, unknown>) {
  const { request, env } = context;

  if (request.method === 'GET') {
    const data = await env.NOTES_KV.get('key');
    return json(data);
  }

  return error('Method not allowed', 405);
}
```

### 添加新的 UI 组件

组件放置在 `src/components/ui/` 目录，使用 Radix UI 作为无头组件基础：

```tsx
import * as DialogPrimitive from '@radix-ui/react-dialog';

export function MyDialog({ children }: { children: React.ReactNode }) {
  return (
    <DialogPrimitive.Root>
      {children}
    </DialogPrimitive.Root>
  );
}
```

## 常见问题

### Q: 本地开发时 API 请求失败？

A: 本地开发时 Functions 不会运行，需要使用 mock 数据或部署到 EdgeOne Pages 后测试。

### Q: 构建时提示包体积过大？

A: 可以通过动态导入进行代码分割：

```typescript
const Editor = lazy(() => import('./components/editor/Editor'));
```

### Q: 如何自定义主题颜色？

A: 修改 `tailwind.config.js` 中的 `theme.extend.colors` 配置。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
