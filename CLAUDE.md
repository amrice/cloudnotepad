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

## 部署平台兼容性要求

**重要：每次修改代码都必须考虑以下平台的兼容性**

### 目标部署平台
| 平台 | 状态 | 说明 |
|------|------|------|
| 腾讯云 EdgeOne | ✅ 已适配 | 当前主要部署平台 |
| Cloudflare Workers | ⏳ 待适配 | 基于 Service Workers API |
| Vercel Edge Functions | ⏳ 待适配 | 提供 @edge-runtime 包 |
| 阿里云 ESA | ⏳ 待适配 | 边缘函数基于 V8 |

### 兼容性开发原则
1. **使用 Web 标准 API**：优先使用 Fetch API、Headers、Request、Response 等标准接口
2. **避免平台特定 API**：不使用某个平台独有的 API，除非有兼容层
3. **Cookie 操作统一写法**：
   ```javascript
   // 正确：使用标准 Headers API
   response.headers.append('Set-Cookie', 'key=value; HttpOnly; Secure; SameSite=Strict');
   ```
4. **KV 存储抽象**：通过统一接口访问不同平台的 KV 存储
5. **环境变量**：使用各平台支持的环境变量方式获取配置

### 代码修改检查清单
- [ ] 是否使用了平台特定的全局变量？
- [ ] Cookie/Session 操作是否使用标准 API？
- [ ] 是否依赖了某平台独有的运行时特性？
- [ ] 新增的依赖是否在边缘运行时中可用？
