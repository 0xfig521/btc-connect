# @btc-connect/vue - AGENTS.md

## OVERVIEW

Vue 3 适配层，提供 Composables（useWallet, useTheme）和插件系统（BTCWalletPlugin）。

## STRUCTURE

```
vue/
├── src/
│   ├── composables/   # Vue Composables: useWallet, useTheme, useCore
│   ├── components/    # Vue 组件：ConnectButton, WalletModal
│   ├── plugins/       # BTCWalletPlugin
│   ├── types/         # Vue 特定类型
│   ├── config/        # 配置系统
│   └── styles/        # CSS 样式
├── vite.config.ts
└── package.json
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 统一 Composable | `src/composables/useWallet.ts` | 单一访问点 |
| 插件实现 | `src/plugins/BTCWalletPlugin.ts` | Vue 插件 |
| SSR 兼容 | `src/utils/ssr.ts` | 服务端保护 |
| 响应式工具 | `src/utils/reactive.ts` | Vue 响应式工具 |

## CONVENTIONS

- **Composition API**: 仅使用 `<script setup>` 语法
- **响应式优先**: 所有状态使用 `ref`/`computed`
- **SSR 安全**: 插件使用 `.client.ts` 后缀，组件使用 `ClientOnly`
- **类型安全**: vue-tsc 严格检查，禁止 `as any`

## ANTI-PATTERNS

- **NEVER** 在插件外部使用 Composables
- **NEVER** 在 SSR 环境直接访问 `window`（使用 `process.client`）
- **避免** 在 Composable 中引入多余的状态（使用 core 的状态）
- **NEVER** 使用 Options API（仅支持 Composition API）

## UNIQUE STYLES

- **统一 API**: 与 React 包完全一致的接口（v0.5.0+）
- **插件系统**: BTCWalletPlugin 提供全局注入
- **智能主题**: 支持 light/dark/auto 模式，自动检测系统偏好
- **CSS 模块**: 模块化 CSS，支持主题变量覆盖

## COMMANDS

```bash
bun run dev        # Vite watch 模式
bun run build      # vue-tsc + Vite 构建
bun run typecheck  # vue-tsc 检查
bun test           # Bun Test
```

## DEPENDENCIES

```
@btc-connect/vue → @btc-connect/core
```

## TESTING

- **测试框架**: Bun Test
- **测试文件**: `src/__tests__/*.test.ts`
- **覆盖范围**: Composables, Components, Plugin
