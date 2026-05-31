# @btc-connect/vue

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <strong>Vue 3 adapter with Composables and Components</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/vue">
    <img src="https://img.shields.io/npm/v/@btc-connect/vue.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/vue">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/vue.svg" alt="Bundle Size">
  </a>
</p>

## Overview

`@btc-connect/vue` provides Vue 3 specific bindings for BTC Connect, offering a reactive way to integrate Bitcoin wallet functionality into Vue applications. It includes composables, components, and a plugin system for seamless wallet integration with Vue's Composition API.

## Features

- 🎯 **Vue 3 Composables**: Individual composables for each function with unified access point
- 📦 **Plugin System**: Vue plugin for easy application integration
- 🎨 **Pre-built Components**: Ready-to-use wallet connection UI components
- ⚡ **Reactivity**: Built for Vue 3's reactivity system
- 🔄 **Auto Reconnection**: Automatic wallet reconnection on app reload
- 🛡️ **Type Safe**: Full TypeScript support with proper type definitions
- 📱 **SSR Compatible**: Server-side rendering support with Nuxt 3
- 🎯 **Framework Optimized**: Designed specifically for Vue patterns
- 🛠️ **Utility Functions**: Built-in formatting and validation tools

## Installation

```bash
npm install @btc-connect/vue
```

**Peer Dependencies**: Ensure you have Vue 3.2+ installed:

```bash
npm install vue
```

## Quick Start

### Plugin Installation

```typescript
// main.ts
import { createApp } from 'vue'
import { BTCWalletPlugin } from '@btc-connect/vue'
import App from './App.vue'

const app = createApp(App)

// Install the plugin
app.use(BTCWalletPlugin, {
  autoConnect: true,
  connectTimeout: 10000,
  theme: 'light'
})

app.mount('#app')
```

### Component Usage

```vue
<template>
  <div>
    <h1>My Bitcoin App</h1>
    <ConnectButton theme="light" />
  </div>
</template>

<script setup lang="ts">
import { ConnectButton } from '@btc-connect/vue'
</script>
```

## Core Components

### ConnectButton

Pre-built button component for wallet connection with customizable styling.

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `variant?: 'select' | 'button' | 'compact'` - Display style (default: 'select')
- `label?: string` - Custom button label
- `disabled?: boolean` - Disable button (default: false)
- `theme?: 'light' | 'dark' | 'auto'` - Button theme (default: 'auto')

### WalletModal

Modal component for wallet selection and connection management.

**Props:**
- `theme?: 'light' | 'dark' | 'auto'` - Modal theme (default: 'auto')
- `isOpen?: boolean` - Modal open state (controlled mode)
- `onClose?: () => void` - Close callback
- `onConnect?: (walletId: string) => void` - Connection callback

## Composables API

### Composables Overview

| Composable | Description | Main Returns |
|------------|-------------|--------------|
| `useWallet()` | Primary composable - unified access point | All wallet functionality |
| `useWalletEvent()` | Event listening with auto-cleanup | `on`, `once`, `off`, `clear` |
| `useWalletManager()` | Manager access | `currentAdapter`, `availableAdapters`, `adapterStates` |
| `useWalletManagerAdvanced()` | Advanced manager operations | `connectMultiple`, `disconnectAll`, `healthCheck` |
| `useCore()` | Core functionality | `manager`, `state`, `isConnected` |
| `useNetwork()` | Network management | `network`, `switchNetwork` |
| `useWalletModal()` | Modal control | `isOpen`, `open`, `close` |
| `useAccount()` | Account information | `accounts`, `currentAccount`, `balance` |
| `useBalance()` | Balance management | `balance`, `refreshBalance` |
| `useSignature()` | Signing operations | `signMessage`, `signPsbt` |
| `useTransactions()` | Transaction operations | `sendBitcoin`, `sendBitcoinAdvanced` |
| `useWalletDetection()` | Wallet detection | `isDetecting`, `detectionStats` |
| `useWalletInfo()` | Wallet information | `currentWallet`, `availableWallets` |
| `useConnectWallet()` | Connection operations | `connect`, `disconnect`, `switchWallet` |

## Vue Composables

### useWallet - Unified Composable

Primary composable providing access to all wallet functionality.

**Returns:**
```typescript
interface UseWalletReturn {
  // State (Reactive)
  status: Ref<ConnectionStatus>;
  isConnected: Ref<boolean>;
  isConnecting: Ref<boolean>;
  address: Ref<string | undefined>;
  balance: Ref<number | undefined>;
  network: Ref<Network>;
  error: Ref<Error | undefined>;

  // Operations
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  availableWallets: Ref<WalletInfo[]>;

  // Advanced
  useWalletEvent: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => UseWalletEventReturn<T>;
  walletModal: UseWalletModalReturn;
  manager: Ref<BTCWalletManager>;
}
```

### useWalletEvent

Composable for listening to wallet events with automatic cleanup.

**Parameters:**
- `event: WalletEvent` - Event type ('connect', 'disconnect', 'accountChange', 'networkChange', 'error')
- `handler: EventHandler` - Event handler function

**Returns:**
```typescript
interface UseWalletEventReturn<T> {
  on: (handler: EventHandler<T>) => void;
  off: (handler: EventHandler<T>) => void;
  once: (handler: EventHandler<T>) => void;
  clear: () => void;
  eventHistory: Ref<EventHistoryItem[]>;
}
```

### useNetwork

Composable for network management and switching.

**Returns:**
```typescript
interface UseNetworkReturn {
  network: Ref<Network>;
  switchNetwork: (network: Network) => Promise<void>;
  isSwitching: Ref<boolean>;
}
```

### useTheme

Composable for theme management and switching.

**Returns:**
```typescript
interface UseThemeReturn {
  theme: Ref<ThemeMode>;
  systemTheme: Ref<ThemeMode>;
  effectiveTheme: ComputedRef<ThemeMode>;
  setTheme: (theme: ThemeMode) => void;
  resetTheme: () => void;
}
```

### useWalletModal

Composable for global modal control with source tracking.

**Returns:**
```typescript
interface UseWalletModalReturn {
  isOpen: Ref<boolean>;
  theme: ComputedRef<ThemeMode>;
  open: (walletId?: string) => void;
  close: () => void;
  toggle: () => void;
  forceClose: () => void;
  currentWalletId: Ref<string | null>;
  modalSource: Ref<string | null>;
}
```

### useWalletManager

Composable for accessing the underlying wallet manager and adapter management.

**Returns:**
```typescript
interface UseWalletManagerReturn {
  currentAdapter: ComputedRef<BTCWalletAdapter | null>;
  availableAdapters: ComputedRef<BTCWalletAdapter[]>;
  adapterStates: ComputedRef<Record<string, WalletState>>;
  getAdapter: (walletId: string) => BTCWalletAdapter | null;
  addAdapter: (adapter: BTCWalletAdapter) => void;
  removeAdapter: (walletId: string) => boolean;
  manager: Ref<BTCWalletManager | null>;
}
```

**Example:**
```vue
<script setup>
import { useWalletManager } from '@btc-connect/vue'

const {
  currentAdapter,
  availableAdapters,
  adapterStates,
  getAdapter,
  addAdapter,
  removeAdapter
} = useWalletManager()

// Get UniSat adapter
const unisatAdapter = getAdapter('unisat')

// Add custom adapter
const addCustomAdapter = () => {
  const customAdapter = createMyCustomAdapter()
  addAdapter(customAdapter)
}
</script>
```

### useWalletManagerAdvanced

Advanced composable for batch operations and health monitoring.

**Returns:**
```typescript
interface UseWalletManagerAdvancedReturn {
  // Batch Operations
  connectMultiple: (walletIds: string[]) => Promise<Array<{
    walletId: string;
    success: boolean;
    error?: string;
  }>>;
  disconnectAll: () => Promise<Array<{
    walletId: string;
    success: boolean;
    error?: string;
  }>>;
  switchAllToNetwork: (network: string) => Promise<Array<{
    walletId: string;
    success: boolean;
    error?: string;
  }>>;

  // Health & Monitoring
  healthCheck: () => Promise<{
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details: Array<{
      walletId: string;
      status: string;
      issues: string[];
    }>;
  }>;
  adapterMonitor: () => {
    totalAdapters: number;
    readyAdapters: number;
    connectedAdapters: number;
    adaptersWithErrors: number;
    currentAdapter: string | null;
    timestamp: string;
  };

  // Inherited from useWalletManager
  currentAdapter: ComputedRef<BTCWalletAdapter | null>;
  availableAdapters: ComputedRef<BTCWalletAdapter[]>;
  adapterStates: ComputedRef<Record<string, WalletState>>;
  manager: Ref<BTCWalletManager | null>;
}
```

**Example:**
```vue
<script setup>
import { useWalletManagerAdvanced } from '@btc-connect/vue'

const {
  connectMultiple,
  disconnectAll,
  switchAllToNetwork,
  healthCheck,
  adapterMonitor
} = useWalletManagerAdvanced()

// Connect multiple wallets at once
const connectWallets = async () => {
  const results = await connectMultiple(['unisat', 'okx'])
  console.log('Connection results:', results)
}

// Disconnect all wallets
const disconnectAllWallets = async () => {
  const results = await disconnectAll()
  console.log('Disconnect results:', results)
}

// Switch all wallets to testnet
const switchToTestnet = async () => {
  const results = await switchAllToNetwork('testnet')
  console.log('Network switch results:', results)
}

// Check adapter health
const checkHealth = async () => {
  const health = await healthCheck()
  console.log('Health status:', health.status)
  console.log('Details:', health.details)
}

// Get adapter statistics
const getStats = () => {
  const stats = adapterMonitor()
  console.log('Adapter stats:', stats)
}
</script>
```

### useWalletInfo

Composable for accessing current wallet and available wallets information.

**Returns:**
```typescript
interface UseWalletInfoReturn {
  currentWallet: ComputedRef<WalletInfo | null>;
  availableWallets: ComputedRef<WalletInfo[]>;
  hasWallets: ComputedRef<boolean>;
}
```

**Example:**
```vue
<script setup>
import { useWalletInfo } from '@btc-connect/vue'

const { currentWallet, availableWallets, hasWallets } = useWalletInfo()

// Display current wallet info
const walletName = computed(() => currentWallet.value?.name || 'Not connected')

// List all available wallets
const walletList = computed(() => availableWallets.value.map(w => ({
  id: w.id,
  name: w.name,
  icon: w.icon
})))
</script>

<template>
  <div>
    <p>Current: {{ walletName }}</p>
    <p v-if="hasWallets">Available wallets: {{ walletList.length }}</p>
  </div>
</template>
```

### useWalletDetection

Composable for wallet detection with event-driven real-time status updates.

**Returns:**
```typescript
interface UseWalletDetectionReturn {
  // State
  isDetecting: ComputedRef<boolean>;
  availableWallets: ComputedRef<WalletInfo[]>;
  detectedWallets: ComputedRef<string[]>;
  isComplete: ComputedRef<boolean>;
  elapsedTime: ComputedRef<number>;
  lastDetectionTime: ComputedRef<number | null>;
  detectionStats: ComputedRef<{
    totalWallets: number;
    detectedWallets: number;
    detectionRate: number;
    averageDetectionTime: number;
    isOptimal: boolean;
  }>;

  // Methods
  isWalletDetected: (walletId: string) => boolean;
  getWalletDetectionTime: (walletId: string) => number | null;
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  restartDetection: () => Promise<void>;
}
```

**Example:**
```vue
<script setup>
import { useWalletDetection } from '@btc-connect/vue'

const {
  isDetecting,
  detectedWallets,
  isComplete,
  elapsedTime,
  detectionStats,
  isWalletDetected,
  startDetection,
  stopDetection,
  restartDetection
} = useWalletDetection()

// Check if specific wallet is detected
const isUnisatDetected = computed(() => isWalletDetected('unisat'))

// Manual detection control
const handleStartDetection = async () => {
  await startDetection()
}

const handleStopDetection = () => {
  stopDetection()
}

// Display detection progress
const detectionProgress = computed(() => {
  const stats = detectionStats.value
  return `${stats.detectedWallets}/${stats.totalWallets} wallets (${stats.detectionRate.toFixed(1)}%)`
})
</script>

<template>
  <div>
    <p v-if="isDetecting">Detecting wallets... ({{ elapsedTime }}ms)</p>
    <p v-else-if="isComplete">Detection complete: {{ detectionProgress }}</p>
    
    <p>Optimal: {{ detectionStats.isOptimal ? 'Yes' : 'No' }}</p>
    
    <button @click="handleStartDetection" :disabled="isDetecting">Start Detection</button>
    <button @click="handleStopDetection" :disabled="!isDetecting">Stop Detection</button>
    <button @click="restartDetection">Restart Detection</button>
  </div>
</template>
```

## API Reference

### Connection Management

```vue
<script setup>
import { useWallet } from '@btc-connect/vue'

const { connect, isConnected, address } = useWallet()

const handleConnect = async () => {
  try {
    await connect('unisat')
    console.log('Connected to:', address.value)
  } catch (error) {
    console.error('Connection failed:', error)
  }
}
</script>
```

### Event Handling

```vue
<script setup>
import { useWallet } from '@btc-connect/vue'

const { useWalletEvent } = useWallet()

// Listen to connection events
const { on } = useWalletEvent('connect', (accounts) => {
  console.log('Wallet connected:', accounts)
})

// Listen to disconnection
const { on: onDisconnect } = useWalletEvent('disconnect', () => {
  console.log('Wallet disconnected')
})
</script>
```

### Bitcoin Operations

```vue
<script setup>
import { useWallet } from '@btc-connect/vue'

const { signMessage, signPsbt, sendBitcoin } = useWallet()

const handleSignMessage = async () => {
  try {
    const signature = await signMessage('Hello, Bitcoin!')
    console.log('Signature:', signature)
  } catch (error) {
    console.error('Signing failed:', error)
  }
}
</script>
```

## Advanced Usage

### Nuxt 3 Integration

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, {
    autoConnect: true,
    theme: 'auto'
  })
})
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>Bitcoin Wallet App</h1>
    <ClientOnly>
      <ConnectButton />
    </ClientOnly>
  </div>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue'
</script>
```

### Custom Theme

```vue
<template>
  <div>
    <ConnectButton theme="dark" />
    <button @click="toggleTheme">Toggle Theme</button>
  </div>
</template>

<script setup>
import { useTheme } from '@btc-connect/vue'

const { theme, setTheme } = useTheme()

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>
```

### Modal Control

```vue
<template>
  <div>
    <button @click="openModal">Open Wallet Modal</button>
    <button @click="closeModal">Close Modal</button>
  </div>
</template>

<script setup>
import { useWalletModal } from '@btc-connect/vue'

const { open: openModal, close: closeModal, isOpen } = useWalletModal()
</script>
```

## Best Practices

1. **Plugin Installation**: Always install BTCWalletPlugin at app initialization
2. **Error Handling**: Wrap wallet operations in try-catch blocks
3. **Reactivity**: Use reactive refs and computed properties for UI updates
4. **Type Safety**: Leverage TypeScript types for better development experience
5. **SSR**: Use ClientOnly component for wallet-specific UI in SSR environments

## Migration Guide

### From v0.3.x to v0.4.0+

```vue
<!-- Old way -->
<script setup>
import { useCore, useWallet, useWalletEvent } from '@btc-connect/vue'
const { connect } = useCore()
const { address } = useWallet()
useWalletEvent('connect', handler)
</script>

<!-- New way -->
<script setup>
import { useWallet } from '@btc-connect/vue'
const { connect, address, useWalletEvent } = useWallet()
useWalletEvent('connect', handler)
</script>
```

## Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

- 📧 Email: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [Issues](https://github.com/IceHugh/btc-connect/issues)