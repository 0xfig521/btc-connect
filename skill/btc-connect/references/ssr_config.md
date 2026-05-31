# SSR 环境配置指南

btc-connect 依赖浏览器钱包扩展，所有钱包操作必须在客户端执行。SSR 环境下需要特殊处理，避免服务端访问 `window` 对象导致报错或水合不匹配。

## Next.js SSR 配置

### 项目安装

```bash
npx create-next-app@latest my-btc-app --typescript --tailwind --app
cd my-btc-app
bun add @btc-connect/core @btc-connect/react
```

### Provider 配置

在根布局中包裹 `BTCWalletProvider`，开启 `autoConnect` 可在页面刷新后自动恢复上次连接的钱包。

```tsx
// app/providers.tsx
'use client'

import { BTCWalletProvider } from '@btc-connect/react'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BTCWalletProvider autoConnect connectTimeout={10000}>
      {children}
    </BTCWalletProvider>
  )
}
```

```tsx
// app/layout.tsx
import Providers from './providers'

export const metadata = {
  title: 'BTC-Connect Next.js App',
  description: 'Bitcoin wallet connection with Next.js',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 客户端钱包组件

钱包组件必须标记 `'use client'`，并使用 mounted 状态防止水合不匹配。所有功能通过 `useWallet()` 统一获取。

```tsx
// components/WalletPanel.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@btc-connect/react'

export default function WalletPanel() {
  const [mounted, setMounted] = useState(false)
  const {
    isConnected, isConnecting, address, balance, network,
    connect, disconnect, switchNetwork, availableWallets,
  } = useWallet()

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <div className="p-4 border rounded">加载钱包组件...</div>
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">钱包连接</h2>
      {!isConnected ? (
        <div className="space-x-2">
          {availableWallets.map((w) => (
            <button key={w.id} onClick={() => connect(w.id)} disabled={isConnecting}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
              {isConnecting ? '连接中...' : `连接 ${w.name}`}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-mono text-sm">{address}</p>
          <p>{balance?.total ?? '-'} sat | 网络: {network}</p>
          <div className="space-x-2">
            <button onClick={() => switchNetwork('mainnet')} className="px-3 py-1 bg-gray-500 text-white rounded">主网</button>
            <button onClick={() => switchNetwork('testnet')} className="px-3 py-1 bg-gray-500 text-white rounded">测试网</button>
            <button onClick={disconnect} className="px-4 py-2 bg-red-500 text-white rounded">断开连接</button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 动态导入与页面集成

使用 `next/dynamic` 配合 `ssr: false` 禁用钱包组件的服务端渲染。内置 `ConnectButton` 同样需要动态导入。

```tsx
// app/page.tsx
import dynamic from 'next/dynamic'

const WalletPanel = dynamic(() => import('@/components/WalletPanel'), {
  ssr: false,
  loading: () => <div className="p-4 border rounded">加载钱包组件...</div>,
})

// ConnectButton 快捷用法
const WalletConnectButton = dynamic(
  () => import('@/components/WalletConnectButton'),
  { ssr: false },
)

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <WalletPanel />
    </main>
  )
}
```

```tsx
// components/WalletConnectButton.tsx
'use client'
import { ConnectButton } from '@btc-connect/react'
export default function WalletConnectButton() {
  return <ConnectButton variant="select" size="md" />
}
```

### 错误边界

为钱包操作添加错误边界，捕获连接失败等异常。

```tsx
// app/error.tsx
'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('钱包操作出错:', error) }, [error])
  return (
    <div className="p-4 border border-red-300 rounded-lg bg-red-50">
      <h2 className="text-red-800 font-bold">钱包连接出错</h2>
      <p className="text-red-600">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">重试</button>
    </div>
  )
}
```

### Pages Router 模式

Provider 放在 `_app.tsx` 中，钱包组件同样需要动态导入。

```tsx
// pages/_app.tsx
import { BTCWalletProvider } from '@btc-connect/react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <BTCWalletProvider autoConnect>
      <Component {...pageProps} />
    </BTCWalletProvider>
  )
}
```

```tsx
// pages/index.tsx
import dynamic from 'next/dynamic'
const WalletPanel = dynamic(() => import('../components/WalletPanel'), { ssr: false })
export default function Home() {
  return <main className="p-8"><WalletPanel /></main>
}
```

### 环境变量

```env
# .env.local
NEXT_PUBLIC_DEFAULT_NETWORK=livenet
NEXT_PUBLIC_SUPPORTED_WALLETS=unisat,okx
```

## Nuxt 3 SSR 配置

### 项目安装

```bash
npx nuxi@latest init my-btc-nuxt-app
cd my-btc-nuxt-app
bun add @btc-connect/core @btc-connect/vue
```

### 客户端插件

Nuxt 3 的 `.client.ts` 后缀确保插件仅在客户端运行。在插件中安装 `BTCWalletPlugin`，开启 `autoConnect` 自动恢复连接。

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, {
    autoConnect: true,
    connectTimeout: 10000,
  })
})
```

### 钱包组件

使用 `ClientOnly` 包裹钱包组件，避免服务端渲染。所有功能通过 `useWallet()` 统一获取。

```vue
<!-- components/WalletPanel.vue -->
<template>
  <div class="p-4 border rounded-lg">
    <h2 class="text-xl font-bold mb-4">钱包连接</h2>
    <div v-if="!mounted"><p>加载钱包组件...</p></div>
    <div v-else-if="!isConnected">
      <button v-for="w in availableWallets" :key="w.id"
        @click="handleConnect(w.id)" :disabled="isConnecting"
        class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 mr-2">
        {{ isConnecting ? '连接中...' : `连接 ${w.name}` }}
      </button>
    </div>
    <div v-else class="space-y-4">
      <p class="font-mono text-sm">{{ address }}</p>
      <p>{{ balance?.total ?? '-' }} sat | 网络: {{ network }}</p>
      <div class="space-x-2">
        <button @click="switchNetwork('mainnet')" class="px-3 py-1 bg-gray-500 text-white rounded">主网</button>
        <button @click="switchNetwork('testnet')" class="px-3 py-1 bg-gray-500 text-white rounded">测试网</button>
        <button @click="disconnect" class="px-4 py-2 bg-red-500 text-white rounded">断开连接</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWallet } from '@btc-connect/vue'

const {
  isConnected, isConnecting, address, balance, network,
  connect, disconnect, switchNetwork, availableWallets,
} = useWallet()

const mounted = ref(false)
onMounted(() => { mounted.value = true })

const handleConnect = async (walletId: string) => {
  try { await connect(walletId) } catch (error) { console.error('连接失败:', error) }
}
</script>
```

### 页面中使用

用 `ClientOnly` 包裹钱包相关组件，服务端不会渲染这部分内容。

```vue
<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8">BTC-Connect Nuxt 3 示例</h1>
      <ClientOnly>
        <WalletPanel />
        <template #fallback>
          <div class="p-4 border rounded">加载钱包组件...</div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
```

### 内置组件

Vue 包提供 `ConnectButton`、`AddressDisplay`、`BalanceDisplay`、`WalletStatus` 等组件，均需在 `ClientOnly` 内使用。

```vue
<!-- pages/wallet.vue -->
<template>
  <div class="p-8">
    <ClientOnly>
      <ConnectButton variant="select" size="md" />
    </ClientOnly>
    <ClientOnly>
      <div v-if="isConnected" class="mt-4 space-y-2">
        <AddressDisplay />
        <BalanceDisplay />
        <WalletStatus />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ConnectButton, AddressDisplay, BalanceDisplay, WalletStatus } from '@btc-connect/vue'
import { useWallet } from '@btc-connect/vue'
const { isConnected } = useWallet()
</script>
```

### onMounted 中的客户端逻辑

需要访问浏览器 API 的操作应放在 `onMounted` 中执行。

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useWallet } from '@btc-connect/vue'
const { isConnected } = useWallet()

onMounted(() => {
  if (isConnected.value) {
    console.log('钱包已连接，执行客户端初始化逻辑')
  }
})
</script>
```

### nuxt.config.ts 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      defaultNetwork: process.env.NUXT_PUBLIC_DEFAULT_NETWORK || 'livenet',
      supportedWallets: process.env.NUXT_PUBLIC_SUPPORTED_WALLETS || 'unisat,okx',
    },
  },
  vite: {
    optimizeDeps: { include: ['@btc-connect/core'] },
  },
})
```

### 环境变量

```env
# .env
NUXT_PUBLIC_DEFAULT_NETWORK=livenet
NUXT_PUBLIC_SUPPORTED_WALLETS=unisat,okx
```

## 通用 SSR 模式

### typeof window 检查

在框架无关的代码中，使用 `typeof window` 判断运行环境。

```typescript
if (typeof window !== 'undefined') {
  // 客户端逻辑：访问 localStorage、钱包扩展等
  const lastWallet = localStorage.getItem('btc-connect:last-wallet-id')
}
```

### mounted 状态模式

服务端渲染的 HTML 与客户端初始状态不同时，框架会报水合不匹配错误。mounted 状态确保客户端完成首次渲染后再显示钱包相关 UI。

```tsx
// React
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
if (!mounted) return <LoadingPlaceholder />
```

```vue
<!-- Vue -->
<script setup>
const mounted = ref(false)
onMounted(() => { mounted.value = true })
</script>
<template>
  <div v-if="!mounted">加载中...</div>
  <div v-else><!-- 钱包 UI --></div>
</template>
```

### 动态导入与代码分割

将钱包相关代码从主包中分离，减小首屏加载体积。

```tsx
// Next.js
const WalletPanel = dynamic(() => import('./WalletPanel'), { ssr: false })
```

```vue
<!-- Nuxt 3 -->
<ClientOnly><WalletPanel /></ClientOnly>
```

```typescript
// 通用动态导入
const { BTCWalletManager } = await import('@btc-connect/core')
const manager = new BTCWalletManager()
```

### SSR 环境错误处理

钱包操作在 SSR 环境下会抛出异常，需要妥善处理。

```typescript
async function safeWalletOperation<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (typeof window === 'undefined') return fallback
  try { return await fn() } catch (error) { console.error('钱包操作失败:', error); return fallback }
}

// 使用示例
const accounts = await safeWalletOperation(() => manager.connect('unisat'), [])
```

### 安全的存储访问

`localStorage` 和 `sessionStorage` 在服务端不可用，需要先检查环境。

```typescript
function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  return window.localStorage.getItem(key)
}
```
