# @btc-connect/react - AGENTS.md

## OVERVIEW

React 适配层，提供 Hooks（useWallet, useTheme, useWalletEvent）和 Context Provider。

## STRUCTURE

```
react/
├── src/
│   ├── hooks/         # React Hooks: useWallet, useTheme, useNetwork
│   ├── context/       # BTCWalletProvider
│   ├── components/    # ConnectButton, WalletModal
│   ├── types/         # React 特定类型
│   └── utils/         # React 工具函数
├── vite.config.ts
└── package.json
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 统一 Hook | `src/hooks/useWallet.ts` | 单一访问点 |
| Provider | `src/context/BTCWalletProvider.tsx` | Context 实现 |
| SSR 兼容 | `src/utils/ssr.ts` | 服务端保护 |
| 主题检测 | `src/utils/themeDetection.ts` | 智能主题切换 |

## CONVENTIONS

- **Composition First**: 优先使用 Hooks，非 Class components
- **SSR 安全**: 所有客户端代码使用 `typeof window !== 'undefined'` 检查
- **类型安全**: 100% TypeScript 覆盖，禁止 `as any`
- **Tree-shaking**: 所有导出支持 tree-shaking

## ANTI-PATTERNS

- **NEVER** 在 Provider 外部使用钱包 Hooks
- **NEVER** 在 SSR 环境直接访问 `window` 或 `document`
- **避免** 在 Hook 中引入多余的状态（使用 core 的状态）

## UNIQUE STYLES

- **统一 API**: 与 Vue 包完全一致的接口（v0.5.0+）
- **增强 useWallet**: 包含所有功能：状态、操作、工具函数、事件监听
- **智能主题**: 支持 light/dark/auto 模式，自动检测系统偏好

## COMMANDS

```bash
bun run dev        # Vite watch 模式
bun run build      # Vite 构建 + terser 压缩
bun run typecheck  # TypeScript 检查
bun test           # Bun Test
```

## DEPENDENCIES

```
@btc-connect/react → @btc-connect/core
```

## TESTING

- **测试框架**: Bun Test
- **测试文件**: `src/__tests__/*.test.ts`
- **覆盖范围**: Hooks, Context, Components
