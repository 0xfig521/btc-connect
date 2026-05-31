# Next.js SSR Example - AGENTS.md

## OVERVIEW

Next.js SSR 完整示例，展示服务器端渲染兼容性和客户端水合方案。

## STRUCTURE

```
nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 主页：多主题展示
│   │   ├── layout.tsx            # 根布局
│   │   └── ssr-test/
│   │       └── page.tsx          # SSR 测试页面
│   ├── components/
│   │   ├── SSRWalletProvider.tsx # SSR 兼容 Provider
│   │   └── WalletConnectDemo.tsx # 钱包演示组件
│   └── types/
├── next.config.js
└── package.json
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| SSR Provider | `src/components/SSRWalletProvider.tsx` | isClient 状态管理 |
| 演示组件 | `src/components/WalletConnectDemo.tsx` | 客户端水合 |
| SSR 测试 | `src/app/ssr-test/page.tsx` | 服务端渲染测试 |
| Next 配置 | `next.config.js` | transpilePackages |

## CONVENTIONS

- **use client**: 所有客户端组件标记 `'use client'`
- **SSR 边界**: `SSRWalletProvider` 管理服务端/客户端边界
- **渐进增强**: 提供非 JS 环境的降级方案
- **类型安全**: 完整 TypeScript 支持

## ANTI-PATTERNS

- **NEVER** 在 Provider 外部使用钱包 Hooks
- **NEVER** 在服务端代码访问 `window` 或 `localStorage`
- **避免** 在 SSR 页面直接渲染钱包组件（使用 Provider 包装）

## UNIQUE STYLES

- **isClient 模式**: 使用 `useState(false)` + `useEffect(() => setIsClient(true))` 确保水合安全
- **动态加载**: Web Components 使用 `useEffect` 动态导入
- **SSR 测试页**: 专门的 `/ssr-test` 路由测试服务端渲染

## COMMANDS

```bash
bun dev           # Next.js 开发服务器
bun build         # 生产构建
bun start         # 启动生产服务器
bun typecheck     # TypeScript 检查
```

## SSR STRATEGY

1. **服务端**: 仅渲染静态内容和布局
2. **客户端**: 水合后加载钱包功能
3. **边界**: `SSRWalletProvider` 控制客户端激活时机

## DEPENDENCIES

```
nextjs → @btc-connect/react → @btc-connect/core
```

## TESTING SSR

1. **View Page Source**: 检查服务端渲染的 HTML
2. **Disable JavaScript**: 验证降级内容
3. **Network Throttling**: 测试慢速加载
4. **Console**: 检查水合错误
