# BTC-Connect 技能 v0.5.1

> 比特币钱包连接工具包技能，提供统一的 useWallet() API，支持 React、Vue、Next.js、Nuxt 3 项目集成 UniSat 和 OKX 钱包。

## 核心特性

- **统一 useWallet() API**: 单一 Hook/Composable 访问所有钱包功能
- **多钱包支持**: UniSat (完整支持)、OKX (基础支持)、Xverse (开发中)
- **网络切换**: 主网/测试网/回归测试网切换
- **SSR 兼容**: Next.js 和 Nuxt 3 完整支持
- **智能主题检测**: 亮色/暗色/自动模式
- **TypeScript**: 完整类型安全

## 快速开始

### React
```tsx
import { BTCWalletProvider, useWallet } from '@btc-connect/react'

function App() {
  return (
    <BTCWalletProvider autoConnect>
      <WalletPanel />
    </BTCWalletProvider>
  )
}

function WalletPanel() {
  const { isConnected, address, balance, connect, disconnect } = useWallet()
  // 所有功能通过 useWallet() 获取
}
```

### Vue
```vue
<script setup>
import { useWallet } from '@btc-connect/vue'
const { isConnected, address, balance, connect, disconnect } = useWallet()
</script>
```

## 技能结构

```
skill/btc-connect/
├── SKILL.md                    # 核心技能文档
├── references/                 # 详细参考文档
│   ├── api_reference.md        # 完整API参考 (v0.5.1)
│   ├── framework_setup.md      # 框架配置指南
│   ├── ssr_config.md           # SSR环境配置
│   └── network_switching.md    # 网络切换详解
└── assets/
    └── code_examples/          # 代码示例
        ├── react-example.tsx
        ├── nextjs-example.tsx
        ├── vue-example.vue
        ├── nuxt-example.vue
        └── vanilla-js.js
```

## 版本要求

- **@btc-connect/core**: v0.5.1+
- **@btc-connect/react**: v0.5.1+
- **@btc-connect/vue**: v0.5.1+
- **Node.js**: >= 18
- **TypeScript**: >= 5.0

## 支持的钱包

| 钱包 | 状态 | 网络切换 | 说明 |
|------|------|----------|------|
| UniSat | Active | 完全支持 | 程序化切换 |
| OKX | Active | 不支持 | 需手动在钱包中切换 |
| Xverse | 开发中 | - | 工厂中已禁用 |
