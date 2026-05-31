# btc-connect Skill - AGENTS.md

## OVERVIEW

btc-connect 技能模块，提供比特币钱包连接的完整集成指导。基于 v0.5.1 统一 API。

## STRUCTURE

```
skill/btc-connect/
├── SKILL.md              # 主要技能文档
├── references/           # 详细文档
│   ├── api_reference.md  # 完整API参考 (v0.5.1)
│   ├── framework_setup.md # 框架配置指南
│   ├── ssr_config.md     # SSR环境配置
│   └── network_switching.md # 网络切换详解
├── assets/
│   └── code_examples/    # 代码示例 (React/Vue/Next.js/Nuxt/Vanilla)
└── skill.json            # 技能配置
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 技能主文档 | `SKILL.md` | 核心使用指南 |
| API详情 | `references/api_reference.md` | 完整API参考 |
| 框架配置 | `references/framework_setup.md` | React/Vue/Vanilla配置 |
| SSR配置 | `references/ssr_config.md` | Next.js/Nuxt 3 SSR |
| 网络切换 | `references/network_switching.md` | 网络切换详解 |
| 代码示例 | `assets/code_examples/` | 各框架完整示例 |

## CONVENTIONS

- **统一API优先**: useWallet() 是主要访问点，包含所有功能
- **版本同步**: 技能版本与主项目同步 (v0.5.1+)
- **示例驱动**: 所有功能提供代码示例

## ANTI-PATTERNS

- **NEVER** 使用旧的分离式 hooks 作为主要模式 (useNetwork/useAccount/useBalance 单独使用)
- **NEVER** 硬编码过时的 API 文档
- **NEVER** 忽略版本兼容性检查
- **NEVER** 提及 Nuxt 4 (项目使用 Nuxt 3)

## KEY API PATTERNS

### React (v0.5.1)
```tsx
const { isConnected, address, balance, network, connect, disconnect,
        switchNetwork, signMessage, walletModal } = useWallet()
```

### Vue (v0.5.1)
```vue
const { isConnected, address, balance, network, connect, disconnect,
        switchNetwork, signMessage, walletModal } = useWallet()
// 返回值为 ComputedRef/Ref (Vue 响应式)
```

### Core (v0.5.1)
```typescript
const manager = new BTCWalletManager()
await manager.connect('unisat')
await manager.switchNetwork('testnet')
```
