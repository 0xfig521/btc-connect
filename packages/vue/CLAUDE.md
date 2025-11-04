# @btc-connect/vue

> **Vue 3 比特币钱包连接库** - 提供完整的钱包连接、状态管理和UI组件

[![npm version](https://badge.fury.io/js/%40btc-connect%2Fvue.svg)](https://badge.fury.io/js/%40btc-connect%2Fvue)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)

## 变更记录 (Changelog)

### 2025-11-04 22:00:00 - 🚀 v0.5.0 代码质量与功能完善
- **版本升级**: 包版本从 v0.4.1 升级到 v0.5.0
- **代码质量优化**: 修复所有Lint错误，优化代码规范
- **主题检测增强**: 新增themeDetection.ts工具，支持智能主题切换
- **Composable优化**: 完善所有Composable的类型定义和实现
- **构建优化**: 优化Vite配置，提升构建性能
- **类型安全**: 完善TypeScript类型定义，确保100%类型检查通过
- **模块重构**: 优化模块结构，提升代码可维护性

### 2025-10-31 22:00:00 - 🎉 Vue 模块重大架构优化
- **统一API**: 与React包实现完全一致的Hook接口
- **Composable增强**: useWallet成为统一访问点，集成所有功能
- **主题系统**: 完善的主题管理，支持亮色/暗色/自动模式
- **组件优化**: ConnectButton和WalletModal组件功能增强
- **类型系统**: 新增完整的TypeScript类型定义

## 🎯 快速开始

### 安装

```bash
npm install @btc-connect/vue
# 或
yarn add @btc-connect/vue
# 或
bun add @btc-connect/vue
```

### 基础使用

```vue
<template>
  <div>
    <ConnectButton @connect="handleConnect" />
  </div>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue';

const handleConnect = (walletId) => {
  console.log('Connected to:', walletId);
};
</script>
```

### 🆕 v0.4.0+ 统一 API 使用

```vue
<script setup>
import { useWallet } from '@btc-connect/vue';

const wallet = useWallet();
// wallet 包含所有钱包状态、操作和工具函数
</script>
```

### 插件安装

```typescript
// main.ts
import { createApp } from 'vue';
import { BTCWalletPlugin } from '@btc-connect/vue';
import App from './App.vue';

const app = createApp(App);
app.use(BTCWalletPlugin, {
  autoConnect: true,
  theme: 'auto'
});
app.mount('#app');
```

## 🏗️ 模块架构

### 核心职责

@btc-connect/vue 是 btc-connect 项目的 Vue 3 适配模块，为 Vue 应用提供完整的钱包连接功能。它通过 Vue 3 的组合式 API 和插件系统，提供了：

- 🔄 **响应式状态管理** - 基于 Vue 3 的响应式系统
- 🎨 **主题系统支持** - 支持亮色/暗色/自动主题
- 📱 **移动端适配** - 完整的响应式设计
- ⚡ **性能优化** - 缓存、节流、懒加载等优化
- 🛡️ **TypeScript 支持** - 完整的类型定义和类型安全
- 🌐 **SSR 兼容** - 完整的服务器端渲染支持

## 📦 对外接口

### 组件

#### ConnectButton
主要连接组件，已内置钱包选择模态框。

```typescript
interface ConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'select' | 'button' | 'compact';
  label?: string;
  disabled?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  showBalance?: boolean;
  showAddress?: boolean;
  balancePrecision?: number;
}
```

#### 子组件 (高级用法)
- `AddressDisplay` - 地址显示组件
- `BalanceDisplay` - 余额显示组件
- `WalletStatus` - 钱包状态组件

### Composables

#### 🆕 useWallet - 统一钱包访问点 (v0.4.0+)
提供所有钱包功能的统一访问点，返回响应式状态和方法。

```typescript
interface UseWalletReturn {
  // === 基础状态 (响应式) ===
  status: Ref<ConnectionStatus>;
  accounts: Ref<AccountInfo[]>;
  currentAccount: Ref<AccountInfo | undefined>;
  network: Ref<Network>;
  error: Ref<Error | undefined>;
  currentWallet: Ref<WalletInfo | null>;
  isConnected: Ref<boolean>;
  isConnecting: Ref<boolean>;
  theme: Ref<ThemeMode>;
  address: Ref<string | undefined>;
  balance: Ref<number | undefined>;
  publicKey: Ref<string | undefined>;

  // === 连接操作 ===
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  availableWallets: Ref<WalletInfo[]>;

  // === 网络管理 ===
  switchNetwork: (network: Network) => Promise<void>;

  // === 事件监听功能 ===
  useWalletEvent: UseWalletEventFunction;

  // === 模态框控制 ===
  walletModal: UseWalletModalReturn;

  // === 钱包管理器功能 ===
  currentAdapter: Ref<BTCWalletAdapter | null>;
  allAdapters: Ref<BTCWalletAdapter[]>;
  manager: Ref<BTCWalletManager>;

  // === 签名功能 ===
  signMessage: (message: string) => Promise<string>;
  signPsbt: (psbt: string) => Promise<string>;

  // === 交易功能 ===
  sendBitcoin: (toAddress: string, amount: number) => Promise<string>;

  // === 工具函数快捷访问 ===
  utils: UtilsObject;
}
```

#### 🆕 useWalletEvent - 事件监听 (v0.4.0+)
提供跨框架的事件监听功能，支持自动清理。

```typescript
interface UseWalletEventReturn<T extends WalletEvent> {
  on: (handler: EventHandler<T>) => void;
  off: (handler: EventHandler<T>) => void;
  once: (handler: EventHandler<T>) => void;
  clear: () => void;
  clearHistory: () => void;
  eventHistory: Ref<EventHistoryItem[]>;
}
```

#### 🆕 useWalletManager - 高级钱包管理器 (v0.4.0+)
提供高级钱包管理功能，包括适配器操作和统计信息。

```typescript
interface UseWalletManagerReturn {
  currentAdapter: Ref<BTCWalletAdapter | null>;
  availableAdapters: Ref<BTCWalletAdapter[]>;
  adapterStates: Ref<AdapterState[]>;
  getAdapter: (walletId: string) => BTCWalletAdapter | null;
  addAdapter: (adapter: BTCWalletAdapter) => void;
  removeAdapter: (walletId: string) => void;
  manager: Ref<BTCWalletManager>;
  stats: ComputedRef<ManagerStats>;
}
```

#### 🆕 useTheme - 主题管理 (v0.4.0+)
提供完整的主题系统，支持亮色/暗色/自动主题切换。

```typescript
interface UseThemeReturn {
  theme: Ref<ThemeMode>;
  systemTheme: Ref<ThemeMode>;
  effectiveTheme: ComputedRef<ThemeMode>;
  setTheme: (theme: ThemeMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setCustomTheme: (theme: CustomTheme) => void;
  resetTheme: () => void;
}
```

#### 🆕 useWalletModal - 全局模态框控制 (v0.4.0+)
全局模态框状态管理，支持来源追踪和程序化控制。

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

#### useCore - 核心钱包管理 (保持兼容)
```typescript
interface UseCoreReturn {
  manager: Ref<BTCWalletManager | null>;
  state: ComputedRef<WalletState>;
  isConnected: ComputedRef<boolean>;
  isConnecting: ComputedRef<boolean>;
  currentWallet: ComputedRef<WalletInfo | null>;
  availableWallets: Ref<WalletInfo[]>;
  theme: ComputedRef<ThemeMode>;
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
}
```

#### 其他 Composables
- `useBalance` - 余额管理和格式化
- `useNetwork` - 网络管理和切换
- `useAutoConnect` - 自动连接功能
- `useWalletDetection` - 钱包检测功能

### 插件配置

```typescript
interface BTCWalletPluginOptions {
  autoConnect?: boolean;
  connectTimeout?: number;
  theme?: ThemeMode;
  modalConfig?: ModalConfig;
  config?: WalletManagerConfig;
}
```

## 🎨 主题系统

### 支持的主题模式
- **light** - 亮色主题
- **dark** - 暗色主题
- **auto** - 跟随系统主题 (推荐)

### 主题配置

支持全局主题配置和组件级主题覆盖，可通过 BTCWalletPlugin 的 theme 属性进行配置。

## ⚡ 性能优化

### 内置优化
- ✅ **智能缓存** - 自动缓存钱包状态和余额信息
- ✅ **状态节流** - 防止频繁的状态更新
- ✅ **懒加载** - 组件和样式按需加载
- ✅ **SSR 优化** - 完整的服务器端渲染支持

### 性能监控

提供 `usePerformanceMonitor` Composable 用于监控连接时间等性能指标。

## 🛠️ 工具函数

### 常用工具
提供 `formatBTCBalance`、`formatAddressShort`、`copyToClipboard`、`cacheManager`、`performanceMonitor`、`validateAmount` 等工具函数。

### 缓存使用
提供 `cacheManager` 用于设置、获取和清理缓存数据。

## 🔧 开发和调试

### 开发模式
支持通过 BTCWalletPlugin 的 config.dev 配置启用详细日志和性能监控。

### 调试工具
提供 `useWalletStateMonitor` Composable 用于监控钱包状态变化。

## 🌐 SSR 支持

完全支持服务器端渲染，无需额外配置。支持 Nuxt 3 插件集成和 ClientOnly 组件包装。

## 📖 最佳实践

### 推荐用法
推荐使用 ConnectButton 组件并结合 useCore Composable 进行状态管理和错误处理。

### 错误处理
使用 try-catch 包装连接操作，处理连接失败的情况。

### 状态管理
利用 Vue 3 的 computed API 创建响应式的钱包信息计算属性。

## 🔗 相关链接

- [Core 模块文档](../core/CLAUDE.md)
- [React 模块文档](../react/CLAUDE.md)
- [GitHub 仓库](https://github.com/IceHugh/btc-connect)
- [NPM 包](https://www.npmjs.com/package/@btc-connect/vue)
- [在线演示](https://btc-connect-demo.vercel.app)

## ❓ 常见问题

### Q: 如何自定义模态框样式？
A: 通过 CSS 变量覆盖主题样式，或使用 CSS 模块自定义。

### Q: 如何在路由切换时关闭模态框？
A: 使用 `useWalletModal().forceClose()` 方法。

### Q: 如何监听钱包事件？
A: 使用 `useCore().manager.value.on()` 方法监听事件。

### Q: 支持哪些钱包？
A: 目前支持 UniSat、OKX、Xverse 等主流比特币钱包。

---

*最后更新: 2025-11-01*