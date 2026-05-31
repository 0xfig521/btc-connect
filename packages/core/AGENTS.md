# @btc-connect/core - AGENTS.md

## OVERVIEW

框架无关的比特币钱包适配层，实现适配器模式、状态管理和事件系统。

## STRUCTURE

```
core/
├── src/
│   ├── adapters/      # 钱包适配器：UniSat, OKX, Xverse
│   ├── managers/      # BTCWalletManager 实现
│   ├── events/        # 事件系统
│   ├── types/         # TypeScript 类型定义
│   ├── utils/         # 工具函数（钱包检测等）
│   ├── cache/         # 缓存系统
│   └── errors/        # 错误类型
└── package.json
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 适配器实现 | `src/adapters/unisat.ts`, `okx.ts`, `xverse.ts` | 具体钱包适配 |
| 管理器核心 | `src/managers/BTCWalletManager.ts` | 状态管理 |
| 类型定义 | `src/types/index.ts` | 统一类型系统 |
| 钱包检测 | `src/utils/detectAvailableWallets.ts` | 20s 轮询检测 |

## CONVENTIONS

- **零依赖**: 无外部运行时依赖，保持框架无关
- **适配器模式**: 所有钱包必须实现 `BTCWalletAdapter` 接口
- **事件驱动**: 使用自定义事件系统，非 EventEmitter
- **缓存策略**: 内置缓存系统，避免重复操作

## ANTI-PATTERNS

- **NEVER** 在 core 中引入 React/Vue 依赖
- **NEVER** 直接访问 `window`（使用全局对象检查）
- **避免** 在适配器中硬编码钱包特定逻辑（使用抽象层）

## UNIQUE STYLES

- **增强检测**: `detectAvailableWallets` 支持 20 秒内每 300ms 轮询
- **统一接口**: 所有适配器暴露相同的 API 表面
- **错误分类**: 自定义错误类型（`WalletNotInstalledError`, `WalletConnectionError`）

## COMMANDS

```bash
bun run dev      # 开发模式（watch）
bun run build    # 构建（tsc + bun build）
bun test         # 运行测试
bun typecheck    # 类型检查
```

## DEPENDENCIES

```
@btc-connect/react → @btc-connect/core
@btc-connect/vue  → @btc-connect/core
```
