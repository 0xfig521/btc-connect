# 框架配置指南 (v0.5.1)

## React 项目配置

### 安装依赖

```bash
bun add @btc-connect/react
```

`@btc-connect/core` 作为依赖自动安装，无需单独添加。

### 配置 Provider

```tsx
// App.tsx
import { BTCWalletProvider } from '@btc-connect/react'
import Dashboard from './Dashboard'

function App() {
  return (
    <BTCWalletProvider
      autoConnect={true}
      connectTimeout={10000}
      modalConfig={{ closeOnEscape: true, closeOnOutsideClick: true }}
    >
      <Dashboard />
    </BTCWalletProvider>
  )
}

export default App
```

Provider 配置项：`autoConnect`（自动恢复连接，默认 false）、`connectTimeout`（超时毫秒，默认 5000）、`connectionPolicy`（自定义连接策略）、`modalConfig`（模态框配置）、`config`（核心管理器配置，含 onStateChange / onError）。

### useWallet 统一 Hook

`useWallet()` 是访问所有钱包功能的唯一入口：

```tsx
import { useWallet } from '@btc-connect/react'

function Dashboard() {
  const {
    status, isConnected, isConnecting,
    address, balance, publicKey,
    accounts, currentAccount, network, error, currentWallet,
    connect, disconnect, switchWallet, availableWallets,
    switchNetwork,
    walletModal,
    signMessage, signPsbt, sendBitcoin,
    useWalletEvent,
    utils,
  } = useWallet()

  useWalletEvent('accountChange', (accounts) => {
    console.log('账户已变更:', accounts)
  })

  const handleConnect = async (walletId: string) => {
    try { await connect(walletId) } catch (err) { console.error('连接失败:', err) }
  }

  return (
    <div>
      {isConnected ? (
        <div>
          <p>地址: {address}</p>
          <p>余额: {balance?.total ?? 0} sat</p>
          <p>网络: {network}</p>
          <button onClick={disconnect}>断开连接</button>
          <button onClick={() => switchNetwork('testnet')}>切换到测试网</button>
        </div>
      ) : (
        <div>
          {availableWallets.map((w) => (
            <button key={w.id} onClick={() => handleConnect(w.id)} disabled={isConnecting}>
              {isConnecting ? '连接中...' : `连接 ${w.name}`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

返回值分类：

- **状态**：`status`（ConnectionStatus）、`isConnected`、`isConnecting`、`address`、`balance`（BalanceDetail | null）、`publicKey`、`accounts`、`currentAccount`、`network`、`error`、`currentWallet`
- **连接**：`connect(walletId)`、`disconnect()`、`switchWallet(walletId)`、`availableWallets`
- **网络**：`switchNetwork(network)`
- **模态框**：`walletModal`（`{ isModalOpen, openModal, closeModal, toggleModal }`）
- **签名**：`signMessage(msg)`、`signPsbt(psbt)`
- **交易**：`sendBitcoin(to, amount)`
- **事件**：`useWalletEvent(event, handler)`（自动清理）
- **工具**：`utils`（`{ formatAddress, formatBalance }`）

### ConnectButton 组件

预构建连接按钮，内置钱包选择模态框：

```tsx
import { ConnectButton } from '@btc-connect/react'

<ConnectButton size="md" variant="select" label="连接钱包" />
```

Props：`size`（sm / md / lg）、`variant`（select / button / compact）、`label`、`disabled`、`className`、`style`。

### WalletModal 组件

ConnectButton 已内置模态框。如需独立使用：

```tsx
import { WalletModal } from '@btc-connect/react'

<WalletModal isOpen={isModalOpen} onClose={closeModal} onConnect={(id) => console.log(id)} />
```

### 辅助 Hooks

只需特定功能时使用独立 Hook：

```tsx
import { useNetwork, useAccount, useBalance } from '@btc-connect/react'

const { network, switchNetwork } = useNetwork()
const { address, publicKey } = useAccount()
const { totalBalance, confirmedBalance } = useBalance()
```

可用：`useNetwork`、`useAccount`、`useBalance`、`useWalletInfo`、`useWalletDetection`、`useWalletManager`、`useWalletModal`、`useAutoConnect`。

### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### 高级用法：自定义连接策略

```tsx
const customPolicy = {
  tasks: [{
    run: async ({ manager }) => {
      const adapter = manager.getCurrentAdapter()
      return { success: !!adapter }
    },
    required: true,
  }],
  emitEventsOnAutoConnect: true,
}

<BTCWalletProvider autoConnect={true} connectionPolicy={customPolicy}>
  <App />
</BTCWalletProvider>
```

---

## Vue 项目配置

### 安装依赖

```bash
bun add @btc-connect/vue
```

### 配置插件

```typescript
// main.ts
import { createApp } from 'vue'
import { BTCWalletPlugin } from '@btc-connect/vue'
import App from './App.vue'

const app = createApp(App)

app.use(BTCWalletPlugin, {
  autoConnect: true,
  connectTimeout: 10000,
  modalConfig: { closeOnEscape: true, closeOnOutsideClick: true },
  config: {
    wallets: { order: ['unisat', 'okx'], featured: ['unisat'] },
  },
})

app.mount('#app')
```

插件配置项：`autoConnect`（默认 true）、`connectTimeout`（默认 5000）、`modalConfig`、`config`（核心管理器配置）。

### useWallet 统一 Composable

`useWallet()` 是 Vue 项目的核心入口，状态属性为 `ComputedRef`/`Ref`，模板中自动解包：

```vue
<script setup lang="ts">
import { useWallet } from '@btc-connect/vue'

const {
  status, isConnected, isConnecting,
  address, balance, publicKey,
  accounts, currentAccount, network, error, currentWallet,
  connect, disconnect, switchWallet, availableWallets,
  switchNetwork,
  walletModal,
  signMessage, signPsbt, sendBitcoin,
  useWalletEvent,
  utils,
} = useWallet()

useWalletEvent('connect', (accounts) => {
  console.log('钱包已连接:', accounts)
})

const handleConnect = async (walletId: string) => {
  try { await connect(walletId) } catch (err) { console.error('连接失败:', err) }
}
</script>

<template>
  <div>
    <div v-if="isConnected">
      <p>地址: {{ address }}</p>
      <p>余额: {{ balance?.total ?? 0 }} sat</p>
      <p>网络: {{ network }}</p>
      <button @click="disconnect">断开连接</button>
      <button @click="switchNetwork('testnet')">切换到测试网</button>
    </div>
    <div v-else>
      <button
        v-for="wallet in availableWallets"
        :key="wallet.id"
        @click="handleConnect(wallet.id)"
        :disabled="isConnecting"
      >
        {{ isConnecting ? '连接中...' : `连接 ${wallet.name}` }}
      </button>
    </div>
  </div>
</template>
```

返回值与 React 版本一致，脚本中通过 `.value` 访问（如 `address.value`、`isConnected.value`）。

### 模态框控制

通过 `useWallet()` 的 `walletModal` 属性访问：

```vue
<script setup>
import { useWallet } from '@btc-connect/vue'
const { walletModal } = useWallet()
// walletModal.isOpen - Ref<boolean>
// walletModal.open() / .close() / .toggle()
</script>

<template>
  <button @click="walletModal.open()">打开钱包选择</button>
</template>
```

单独使用 `useWalletModal` 支持来源追踪：

```vue
<script setup>
import { useWalletModal } from '@btc-connect/vue'
const { isOpen, open, close, forceClose, modalSource } = useWalletModal('Header')
</script>
```

### 组件

```vue
<template>
  <!-- 主组件：内置钱包选择模态框 -->
  <ConnectButton size="md" variant="select" label="连接钱包" :show-balance="true" />

  <!-- 独立显示组件 -->
  <AddressDisplay />
  <BalanceDisplay :precision="8" />
  <WalletStatus />
</template>

<script setup>
import { ConnectButton, AddressDisplay, BalanceDisplay, WalletStatus } from '@btc-connect/vue'
</script>
```

ConnectButton Props：`size`（sm / md / lg）、`variant`（select / button / compact）、`label`、`disabled`、`theme`（light / dark / auto）、`showBalance`、`showAddress`。

### 辅助 Composables

```vue
<script setup>
import { useNetwork, useAccount, useBalance } from '@btc-connect/vue'
const { network, switchNetwork } = useNetwork()
const { accounts, currentAccount } = useAccount()
const { balance, totalBalance } = useBalance()
</script>
```

可用：`useNetwork`、`useAccount`、`useBalance`、`useCore`、`useWalletInfo`、`useWalletDetection`、`useWalletManager`、`useWalletEvent`。

### VueConfig 配置系统

```typescript
import { createConfigManager } from '@btc-connect/vue'

const configManager = createConfigManager({
  theme: { mode: 'dark', followSystem: true },
  wallets: { order: ['unisat', 'okx'], featured: ['unisat'], hidden: [] },
  ui: { size: 'md', variant: 'select', animation: 'scale', connectTimeout: 10000 },
  features: { balance: true, transactions: true, networkSwitch: true, showTestnet: false, autoConnect: true },
  performance: { enableCache: true, cacheExpireTime: 300000, walletDetectionInterval: 300, walletDetectionTimeout: 20000 },
  dev: { debug: false, verboseLogging: false },
})

configManager.updateConfig({ theme: { mode: 'light' } })
const themeConfig = configManager.getThemeConfig()
configManager.resetConfig()
```

全局单例：`initGlobalConfig(config)` 初始化，`useConfig()` 获取。

### 错误处理

```typescript
import { UnifiedError, ErrorFactory, ErrorCode } from '@btc-connect/core'

try {
  await connect('unisat')
} catch (err) {
  if (err instanceof UnifiedError) {
    console.log('错误码:', err.code)
    console.log('可重试:', err.canRetry())
    console.log('完整信息:', err.getFullMessage())
  }
}

// 工厂方法
const notInstalled = ErrorFactory.walletNotInstalled('unisat')
const connFailed = ErrorFactory.walletConnectionFailed('okx', '用户拒绝')
const netError = ErrorFactory.networkError('livenet', '连接超时')
```

### Nuxt 3 SSR 配置

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, { autoConnect: true, connectTimeout: 10000 })
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

---

## 纯 JavaScript / Core 项目配置

### 安装依赖

```bash
bun add @btc-connect/core
```

### BTCWalletManager 直接使用

```typescript
import { BTCWalletManager } from '@btc-connect/core'

const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('状态变更:', state.status),
  onError: (error) => console.error('钱包错误:', error),
})

manager.initializeAdapters()

// 连接
const accounts = await manager.connect('unisat')

// 断开
await manager.disconnect()

// 切换钱包
await manager.switchWallet('okx')

// 切换网络
await manager.switchNetwork('testnet')

// 获取可用钱包
const wallets = manager.getAvailableWallets()

// 获取当前状态
const state = manager.getState()
```

### 工厂函数与钱包检测

```typescript
import {
  createAdapter,
  getAllAdapters,
  detectAvailableWallets,
  createWalletManager,
} from '@btc-connect/core'

// 创建适配器
const unisatAdapter = createAdapter('unisat')

// 获取所有适配器
const adapters = getAllAdapters()

// 增强钱包检测（20秒内每300ms轮询延迟注入的钱包）
const result = await detectAvailableWallets({
  timeout: 20000,
  interval: 300,
  onProgress: (wallets, elapsedTime) => {
    console.log(`已检测到: ${wallets.join(', ')} (${elapsedTime}ms)`)
  },
})
// result.wallets - 检测到的钱包ID列表
// result.adapters - 可用适配器列表
// result.elapsedTime - 检测耗时

// 快捷创建管理器
const manager = createWalletManager({ onStateChange: (s) => console.log(s) })
```

### 事件系统

```typescript
manager.on('connect', (accounts) => console.log('已连接:', accounts))
manager.on('disconnect', () => console.log('已断开'))
manager.on('accountChange', (params) => console.log('账户变更:', params))
manager.on('networkChange', (params) => console.log('网络变更:', params.network))
manager.on('error', (error) => console.error('错误:', error))

// 移除监听
const handler = (accounts) => console.log(accounts)
manager.on('connect', handler)
manager.off('connect', handler)
```

### 工具函数

```typescript
import {
  createWalletManager,
  defaultWalletManager,
  WalletErrorHandler,
  ErrorRecoveryStrategy,
} from '@btc-connect/core'

// 默认管理器单例
const manager = defaultWalletManager

// 错误恢复策略
const errorHandler = new WalletErrorHandler()
errorHandler.registerStrategy(
  new ErrorRecoveryStrategy.RetryStrategy({ maxRetries: 3, delay: 1000 })
)
```

---

## 通用配置要点

### SSR 兼容性

所有包内置 SSR 保护，服务端环境安全降级。Core 手动检查：

```typescript
if (typeof window !== 'undefined') {
  manager.initializeAdapters()
}
```

React 的 `BTCWalletProvider` 和 Vue 的 `BTCWalletPlugin` 均自动处理。

### 浏览器兼容性

ES2020+ 语法，支持 Chrome 80+、Firefox 78+、Safari 14+、Edge 80+。

### TypeScript 类型声明

```typescript
// types/wallet.d.ts
declare global {
  interface Window {
    unisat?: any
    okxwallet?: any
  }
}

export {}
```

### 开发调试

```typescript
if (process.env.NODE_ENV === 'development') {
  const { manager } = useWallet()
  // Vue 中为 manager.value
  manager.on('connect', (...args) => console.log('[connect]', args))
  manager.on('accountChange', (...args) => console.log('[accountChange]', args))
  manager.on('networkChange', (...args) => console.log('[networkChange]', args))
}
```
