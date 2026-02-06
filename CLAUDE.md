# 云记事本 - 开发规范

## 技术栈版本要求

**重要：必须使用以下最新版本，禁止使用旧版本**

### 核心框架
- React: ^19.x
- React Router: ^7.x
- TypeScript: ^5.9+

### UI 组件
- Radix UI: 最新版本
- Tailwind CSS: ^4.x (CSS-first 配置)
- Lucide React: 最新版本

### 编辑器
- TipTap: ^3.x (需要 @floating-ui/dom)

### 状态管理
- Zustand: ^5.x
- TanStack React Query: ^5.x

### 构建工具
- Vite: ^7.x
- @vitejs/plugin-react: ^5.x

### 工具库
- date-fns: ^4.x
- marked: ^17.x

## 开发规范

### 依赖管理
1. 定期检查依赖更新：`npx npm-check-updates`
2. 升级前备份 package-lock.json
3. 升级后必须验证构建：`npm run build`

### Tailwind CSS v4 注意事项
- 使用 `@import "tailwindcss"` 而非 `@tailwind` 指令
- 自定义主题在 CSS 中使用 `@theme` 定义
- 不再需要 tailwind.config.js

### TipTap v3 注意事项
- BubbleMenu 从 `@tiptap/react/menus` 导入
- 使用 Floating UI 替代 Tippy.js
- 需要安装 `@floating-ui/dom` 依赖
