# 网络切换功能详解

> btc-connect v0.5.1 统一 useWallet() API 网络切换指南

## 网络类型

```typescript
type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet'
```

| 标识符 | 说明 | 用途 |
|--------|------|------|
| `livenet` | 比特币主网 | 真实交易环境 |
| `mainnet` | `livenet` 的别名 | 与 `livenet` 完全等价 |
| `testnet` | 比特币测试网 | 开发和测试 |
| `regtest` | 回归测试网 | 本地开发调试 |

注意：`mainnet` 和 `livenet` 指向同一个网络，内部会自动映射。

## 核心包网络切换

### BTCWalletManager.switchNetwork()

```typescript
import { BTCWalletManager } from '@btc-connect/core'

const manager = new BTCWalletManager()
await manager.connect('unisat')

// 切换到测试网
await manager.switchNetwork('testnet')

// 切换到主网（mainnet 是 livenet 的别名）
await manager.switchNetwork('mainnet')
```

调用 `switchNetwork` 前必须先连接钱包，否则抛出错误。如果当前钱包不支持网络切换，也会抛出错误。

### 网络变化事件

```typescript
// 监听网络变化
manager.on('networkChange', ({ walletId, network }) => {
  console.log(`钱包 ${walletId} 已切换到 ${network}`)
})

// 移除监听
const handler = ({ walletId, network }) => {
  console.log(`${walletId} -> ${network}`)
}
manager.on('networkChange', handler)
manager.off('networkChange', handler)
```

`networkChange` 事件在 `switchNetwork` 成功后触发，携带 `walletId` 和 `network` 两个字段。

## React 网络切换

v0.5.1 的主要访问方式是 `useWallet()`，网络状态和切换功能都从这里获取：

```typescript
const { network, switchNetwork } = useWallet()
```

- `network`: 当前网络类型，值为 `Network`
- `switchNetwork`: 切换网络的函数，签名为 `(network: Network) => Promise<void>`

### 完整组件示例

```tsx
'use client'

import { useWallet } from '@btc-connect/react'
import type { Network } from '@btc-connect/core'

const NETWORKS: { id: Network; label: string; desc: string }[] = [
  { id: 'livenet', label: '主网', desc: '比特币主网络' },
  { id: 'testnet', label: '测试网', desc: '比特币测试网络' },
  { id: 'regtest', label: '回归测试网', desc: '本地开发网络' },
]

export default function NetworkSwitcher() {
  const { isConnected, network, switchNetwork, currentWallet } = useWallet()

  const handleSwitch = async (target: Network) => {
    try {
      await switchNetwork(target)
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message)
      }
    }
  }

  if (!isConnected) {
    return <p>请先连接钱包</p>
  }

  return (
    <div>
      <p>当前钱包: {currentWallet?.name}</p>
      <p>当前网络: {network}</p>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {NETWORKS.map((net) => (
          <button
            key={net.id}
            onClick={() => handleSwitch(net.id)}
            disabled={network === net.id}
          >
            {net.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

## Vue 网络切换

v0.5.1 的主要访问方式同样是 `useWallet()`：

```typescript
const { network, switchNetwork } = useWallet()
```

- `network`: `ComputedRef<Network>`，响应式计算属性
- `switchNetwork`: 切换网络的函数，签名为 `(network: string) => Promise<void>`

### 完整组件示例

```vue
<template>
  <div>
    <p v-if="!isConnected">请先连接钱包</p>
    <template v-else>
      <p>当前钱包: {{ currentWallet?.name }}</p>
      <p>当前网络: {{ network }}</p>

      <div class="network-buttons">
        <button
          v-for="net in networks"
          :key="net.id"
          @click="handleSwitch(net.id)"
          :disabled="network === net.id"
        >
          {{ net.label }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '@btc-connect/vue'
import type { Network } from '@btc-connect/core'

const { isConnected, network, switchNetwork, currentWallet } = useWallet()

const networks: { id: Network; label: string }[] = [
  { id: 'livenet', label: '主网' },
  { id: 'testnet', label: '测试网' },
  { id: 'regtest', label: '回归测试网' },
]

const handleSwitch = async (target: Network) => {
  try {
    await switchNetwork(target)
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message)
    }
  }
}
</script>

<style scoped>
.network-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.network-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

## 钱包特定行为

不同钱包对网络切换的支持程度不同，开发时需要针对性处理。

### UniSat: 完全支持

UniSat 钱包支持程序化网络切换，调用 `switchNetwork` 后立即生效，无需用户手动操作。

```typescript
await switchNetwork('testnet') // 直接生效
```

### OKX: 不支持

OKX 钱包不支持程序化网络切换。调用 `switchNetwork` 会抛出错误，错误信息会提示用户手动在钱包中切换。

```typescript
try {
  await switchNetwork('testnet')
} catch (err) {
  // err.message: "当前钱包 OKX Wallet 不支持网络切换，请手动在钱包中切换网络"
  // 或来自 core 的原始错误:
  // "OKX wallet does not support network switching"
  console.error(err.message)
}
```

建议在 UI 中检测当前钱包，对 OKX 用户显示手动切换提示：

```tsx
// React 示例
const { currentWallet, switchNetwork } = useWallet()

const isOkx = currentWallet?.id === 'okx'

if (isOkx) {
  return <p>OKX 钱包不支持自动切换网络，请在钱包扩展中手动切换</p>
}
```

```vue
<!-- Vue 示例 -->
<template>
  <p v-if="isOkx">
    OKX 钱包不支持自动切换网络，请在钱包扩展中手动切换
  </p>
</template>

<script setup>
const { currentWallet } = useWallet()
const isOkx = computed(() => currentWallet.value?.id === 'okx')
</script>
```

### Xverse: 工厂中已禁用

Xverse 适配器当前在钱包工厂中处于禁用状态，无法通过 `connect('xverse')` 连接，因此不涉及网络切换。

## 错误处理

网络切换可能因多种原因失败，以下是常见场景和处理方式：

```typescript
const handleSwitch = async (target: Network) => {
  try {
    await switchNetwork(target)
  } catch (err) {
    if (!(err instanceof Error)) throw err

    const msg = err.message

    if (msg.includes('No wallet connected') || msg.includes('没有连接的钱包')) {
      // 未连接钱包
      console.error('请先连接钱包')
    } else if (msg.includes('not supported') || msg.includes('不支持网络切换')) {
      // 钱包不支持切换（如 OKX）
      console.error('当前钱包不支持网络切换，请手动操作')
    } else if (msg.includes('destroyed')) {
      // 管理器已销毁
      console.error('钱包管理器已失效，请刷新页面')
    } else {
      console.error('网络切换失败:', msg)
    }
  }
}
```

### React 完整错误处理示例

```tsx
function SafeNetworkSwitcher() {
  const { isConnected, network, switchNetwork } = useWallet()
  const [switchError, setSwitchError] = useState<string | null>(null)

  const handleSwitch = async (target: Network) => {
    setSwitchError(null)
    try {
      await switchNetwork(target)
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : '未知错误')
    }
  }

  return (
    <div>
      <p>当前网络: {network}</p>
      <button onClick={() => handleSwitch('testnet')}>切换到测试网</button>
      {switchError && <p style={{ color: 'red' }}>{switchError}</p>}
    </div>
  )
}
```

### Vue 完整错误处理示例

```vue
<template>
  <div>
    <p>当前网络: {{ network }}</p>
    <button @click="handleSwitch('testnet')">切换到测试网</button>
    <p v-if="switchError" style="color: red">{{ switchError }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWallet } from '@btc-connect/vue'
import type { Network } from '@btc-connect/core'

const { network, switchNetwork } = useWallet()
const switchError = ref<string | null>(null)

const handleSwitch = async (target: Network) => {
  switchError.value = null
  try {
    await switchNetwork(target)
  } catch (err) {
    switchError.value = err instanceof Error ? err.message : '未知错误'
  }
}
</script>
```

## SSR 注意事项

网络切换依赖浏览器钱包扩展，只能在客户端执行。

### Next.js

组件必须标记为客户端组件：

```tsx
'use client'

import { useWallet } from '@btc-connect/react'

export default function NetworkSwitcher() {
  const { network, switchNetwork } = useWallet()
  // ...
}
```

### Nuxt 3

使用 `ClientOnly` 包裹钱包相关 UI：

```vue
<template>
  <ClientOnly>
    <NetworkSwitcher />
  </ClientOnly>
</template>
```

插件文件使用 `.client.ts` 后缀确保仅在客户端注册：

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, { autoConnect: true })
})
```
