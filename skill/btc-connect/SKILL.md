---
name: btc-connect
description: 比特币钱包连接集成技能 (v0.5.1)，支持 btc-connect core/react/vue 包在 React、Vue、Next.js、Nuxt 3 项目中的完整集成，包含 UniSat/OKX 钱包适配、统一 useWallet() API、网络切换、SSR 兼容
---

# BTC-Connect 集成技能 (v0.5.1)

## 概述

btc-connect 是专为比特币 Web3 应用设计的钱包连接工具包。v0.5.1 提供统一的 `useWallet()` API 作为主要访问点，React 和 Vue 接口完全一致。支持 UniSat、OKX 钱包连接、网络切换、消息签名、PSBT 签名和比特币发送。

## 使用场景

- 在 React/Vue 项目中集成比特币钱包连接
- 在 Next.js/Nuxt 3 SSR 项目中配置 btc-connect
- 实现比特币网络切换（主网/测试网/回归测试网）
- 集成 UniSat 或 OKX 钱包
- 排查钱包连接失败或 SSR 兼容性问题

## 依赖安装

```bash
# React 项目
bun add @btc-connect/react

# Vue 项目
bun add @btc-connect/vue

# 核心包（框架无关场景）
bun add @btc-connect/core
```

react/vue 包已内置 core 依赖，无需单独安装。版本要求 v0.5.1+。

## 统一 useWallet() API

`useWallet()` 是 v0.5.1 的核心 API，单一访问点提供所有钱包功能。React 和 Vue 返回值结构完全一致。

### 返回值

```typescript
const {
  // 基础状态
  status,           // ConnectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  isConnected,      // boolean
  isConnecting,     // boolean
  address,          // string | null - 当前账户地址
  balance,          // BalanceDetail | null - 当前账户余额
  publicKey,        // string | null - 当前账户公钥
  accounts,         // AccountInfo[] - 所有账户
  currentAccount,   // AccountInfo | null - 当前账户
  network,          // Network - 当前网络
  error,            // Error | null
  currentWallet,    // WalletInfo | null - 当前钱包信息

  // 连接操作
  connect,          // (walletId: string) => Promise<AccountInfo[]>
  disconnect,       // () => Promise<void>
  switchWallet,     // (walletId: string) => Promise<AccountInfo[]>
  availableWallets, // WalletInfo[] - 已安装的钱包列表

  // 网络管理
  switchNetwork,    // (network: Network) => Promise<void>

  // 事件监听
  useWalletEvent,   // <T>(event: T, handler: EventHandler<T>) => void

  // 模态框控制
  walletModal,      // { isOpen, open, close, toggle }

  // 钱包管理器
  currentAdapter,   // BTCWalletAdapter | null
  allAdapters,      // BTCWalletAdapter[]
  manager,          // BTCWalletManager

  // 签名功能
  signMessage,      // (message: string) => Promise<string>
  signPsbt,         // (psbt: string) => Promise<string>

  // 交易功能
  sendBitcoin,      // (toAddress: string, amount: number) => Promise<string>

  // 工具函数
  utils,            // { formatAddress, formatBalance }
} = useWallet()
```

### React 示例

```tsx
'use client'
import { BTCWalletProvider, useWallet, ConnectButton, WalletModal } from '@btc-connect/react'

function App() {
  return (
    <BTCWalletProvider autoConnect>
      <WalletPage />
      <WalletModal />
    </BTCWalletProvider>
  )
}

function WalletPage() {
  const { isConnected, address, balance, connect, disconnect, switchNetwork } = useWallet()

  return (
    <div>
      {isConnected ? (
        <>
          <p>地址: {address}</p>
          <p>余额: {balance?.total} sat</p>
          <button onClick={() => switchNetwork('testnet')}>切换测试网</button>
          <button onClick={disconnect}>断开</button>
        </>
      ) : (
        <ConnectButton />
      )}
    </div>
  )
}
```

### Vue 示例

```vue
<template>
  <div>
    <ConnectButton v-if="!isConnected" />
    <div v-else>
      <p>地址: {{ address }}</p>
      <p>余额: {{ balance?.total }} sat</p>
      <button @click="switchNetwork('testnet')">切换测试网</button>
      <button @click="disconnect">断开</button>
    </div>
  </div>
</template>

<script setup>
import { useWallet, ConnectButton } from '@btc-connect/vue'

const { isConnected, address, balance, disconnect, switchNetwork } = useWallet()
</script>
```

## Provider/Plugin 配置

### BTCWalletProvider (React)

```tsx
<BTCWalletProvider
  config={config}              // WalletManagerConfig - 核心管理器配置
  autoConnect={true}           // boolean - 自动重连（默认 false）
  connectTimeout={10000}       // number - 连接超时毫秒（默认 5000）
  connectionPolicy={policy}    // ConnectionPolicy - 自定义连接策略
  modalConfig={modalConfig}    // ModalConfig - 模态框配置
>
  <App />
</BTCWalletProvider>
```

### BTCWalletPlugin (Vue)

```typescript
// main.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

app.use(BTCWalletPlugin, {
  autoConnect: true,           // 自动重连
  connectTimeout: 10000,       // 连接超时
  modalConfig: { /* ... */ },  // 模态框配置
  config: { /* ... */ },       // 核心管理器配置
})
```

## 组件

### ConnectButton (React + Vue)

钱包连接按钮，未连接时显示连接按钮，已连接时显示余额和地址。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| variant | `'select' \| 'button' \| 'compact'` | `'select'` | 显示样式 |
| label | `string` | `'Connect'` | 自定义按钮文字 |
| disabled | `boolean` | `false` | 禁用按钮 |
| className | `string` | - | 自定义 CSS 类 |
| style | `CSSProperties` | - | 自定义行内样式 |

### WalletModal (React)

钱包选择模态框，显示可用钱包列表。

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | `'Select Wallet'` | 模态框标题 |
| className | `string` | - | 自定义 CSS 类 |
| style | `CSSProperties` | - | 自定义行内样式 |

Vue 中 WalletModal 已集成到 ConnectButton 内部，通过 `useWallet().walletModal` 控制开关。

### Vue 专用组件

| 组件 | 说明 |
|------|------|
| `AddressDisplay` | 地址显示，支持缩略格式和复制 |
| `BalanceDisplay` | 余额显示，支持 BTC 单位格式化 |
| `WalletStatus` | 钱包连接状态指示器 |

## 事件监听

通过 `useWallet()` 返回的 `useWalletEvent` 监听钱包事件，自动清理。

```typescript
const { useWalletEvent } = useWallet()

// React: 在组件内调用
useWalletEvent('accountChange', (account) => {
  console.log('账户变化:', account)
})

// Vue: 在 setup 中调用
useWalletEvent('networkChange', ({ network }) => {
  console.log('网络切换:', network)
})
```

支持的事件: `connect`, `disconnect`, `accountChange`, `networkChange`, `error`

## 网络切换

```typescript
const { network, switchNetwork } = useWallet()

// 切换到测试网
await switchNetwork('testnet')

// 切换到主网
await switchNetwork('livenet') // 或 'mainnet'
```

支持的网络: `livenet`/`mainnet`（主网）、`testnet`（测试网）、`regtest`（回归测试网）

## 钱包特定行为

### UniSat（完全支持）

- 程序化网络切换: 支持
- 消息签名 / PSBT 签名: 支持
- 发送比特币: 支持
- 事件监听: 完整（账户变化、网络变化）
- 增强检测: 20 秒内每 300ms 轮询延迟注入

### OKX（部分支持）

- 程序化网络切换: 不支持，需用户在钱包中手动切换
- 消息签名 / PSBT 签名: 支持
- 发送比特币: 支持
- 事件监听: 基础支持

```typescript
// OKX 网络切换需处理异常
try {
  await switchNetwork('testnet')
} catch {
  // 提示用户在 OKX 钱包中手动切换
}
```

### Xverse

状态: 暂时禁用，等待重新激活。

## 核心包 (@btc-connect/core)

框架无关的核心适配层，react/vue 包基于此构建。

### BTCWalletManager

```typescript
import { BTCWalletManager } from '@btc-connect/core'

const manager = new BTCWalletManager()
manager.initializeAdapters()
await manager.connect('unisat')
await manager.disconnect()
await manager.switchNetwork('testnet')
manager.on('networkChange', ({ walletId, network }) => { /* ... */ })
```

### 适配器

| 适配器 | 类 | 状态 | 说明 |
|--------|-----|------|------|
| UniSat | `UniSatAdapter` | 活跃 | 完整功能支持 |
| OKX | `OKXAdapter` | 活跃 | 不支持 switchNetwork |
| Xverse | `XverseAdapter` | 禁用 | 等待重新激活 |

### 工厂函数

```typescript
import { createAdapter, getAllAdapters, getAvailableAdapters } from '@btc-connect/core'

const adapter = createAdapter('unisat')
const all = getAllAdapters()           // 所有已注册适配器
const available = getAvailableAdapters() // 已安装的适配器
```

### 钱包检测

```typescript
import { detectAvailableWallets, getAvailableWalletsWithRetry } from '@btc-connect/core'

// 增强检测: 20 秒内每 300ms 轮询，捕获延迟注入的钱包
const result = await detectAvailableWallets({ timeout: 20000, interval: 300 })
```

### 缓存系统

```typescript
import { MemoryCache, CacheManager, CacheKeyBuilder, EnhancedMemoryCache } from '@btc-connect/core'

const cache = new MemoryCache<string>({ ttl: 60000, maxSize: 100 })
cache.set('key', 'value')
const val = cache.get('key')

const key = CacheKeyBuilder.balance('unisat', 'tb1q...')
```

### 错误处理

```typescript
import { UnifiedError, ErrorFactory, ErrorCode, WalletErrorHandler, ErrorRecoveryStrategy } from '@btc-connect/core'

try {
  await manager.connect('unisat')
} catch (error) {
  if (error instanceof UnifiedError) {
    console.log('错误码:', error.code)       // ErrorCode 枚举
    console.log('严重度:', error.severity)   // ErrorSeverity 枚举
    console.log('可重试:', error.canRetry())
  }
}

// 使用 ErrorFactory 创建标准错误
const err = ErrorFactory.walletNotInstalled('unisat')
```

### 工具函数

```typescript
import {
  formatAddress, formatBalance, copyToClipboard,
  validateAddress, validateAmount, getWalletIcon,
  formatTimestamp, formatTxid, calculateFeeRate, formatFeeRate
} from '@btc-connect/core'
```

## SSR 配置

### Next.js

钱包组件必须作为客户端组件，使用动态导入避免服务端错误。

```tsx
// components/WalletConnect.tsx
'use client'
import { useWallet, ConnectButton, WalletModal } from '@btc-connect/react'

export default function WalletConnect() {
  const { isConnected, address } = useWallet()
  return (
    <>
      <ConnectButton />
      <WalletModal />
    </>
  )
}

// pages/index.tsx
import dynamic from 'next/dynamic'
const WalletConnect = dynamic(() => import('./WalletConnect'), { ssr: false })
```

### Nuxt 3

创建客户端插件，使用 `ClientOnly` 包装钱包组件。

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, { autoConnect: true })
})
```

```vue
<!-- pages/index.vue -->
<template>
  <ClientOnly>
    <ConnectButton />
  </ClientOnly>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue'
</script>
```

## 次要 Hooks/Composables

除 `useWallet()` 外，以下独立 Hook 可按需使用：

| Hook | 说明 |
|------|------|
| `useConnectWallet` | 连接/断开/切换钱包 |
| `useNetwork` | 网络状态和切换 |
| `useAccount` | 账户信息 |
| `useBalance` | 余额查询和刷新 |
| `useSignature` | 消息/PSBT 签名 |
| `useTransactions` | 发送比特币 |
| `useWalletModal` | 模态框控制 |
| `useWalletDetection` | 钱包检测状态 |
| `useWalletManager` | 管理器和适配器访问 |
| `useAutoConnect` | 自动重连（React） |
| `useCore` | 核心功能（Vue） |
| `useWalletManagerAdvanced` | 批量操作和健康检查（Vue） |
| `useWalletInfo` | 钱包信息查询（Vue） |
| `useWalletSafe` | 安全访问（Vue） |
| `useWalletProvider` | Provider 访问（Vue） |

## 常见问题

**钱包检测失败**: 检查钱包扩展是否安装并启用。使用 `detectAvailableWallets` 增强检测处理延迟注入。

**SSR 报错**: Next.js 使用 `'use client'` + `dynamic(() => import(...), { ssr: false })`。Nuxt 3 使用 `.client.ts` 插件后缀 + `ClientOnly` 组件。

**OKX 网络切换失败**: OKX 不支持程序化网络切换，需引导用户在钱包中手动操作。

**版本不匹配**: 确保 core、react、vue 包版本一致，均为 v0.5.1+。

## 参考文档

详细文档位于 `references/` 目录:

- `api_reference.md` - 完整 API 参考
- `framework_setup.md` - 框架配置指南
- `ssr_config.md` - SSR 环境配置
- `network_switching.md` - 网络切换详解
