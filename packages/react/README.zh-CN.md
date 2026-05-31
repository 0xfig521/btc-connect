# @btc-connect/react

中文文档 | [English](./README.md)

<p align="center">
  <strong>React 适配器 - 提供Hooks和Context的BTC Connect绑定</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/react">
    <img src="https://img.shields.io/npm/v/@btc-connect/react.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/react">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/react.svg" alt="Bundle Size">
  </a>
</p>

## 概述

`@btc-connect/react` 为BTC Connect提供React特定的绑定，提供声明式的比特币钱包功能集成方式。它包含自定义hooks、context providers和预构建组件，实现无缝的钱包集成。

## 特性

- 🎣 **现代React Hooks**: 为每个功能提供独立的hooks，统一访问点
- 📦 **Context Provider**: 集中式钱包状态管理
- 🎨 **预构建组件**: 即可用的钱包连接UI组件
- ⚛️ **React 18+支持**: 为现代React构建，支持并发特性
- 🔄 **自动重连**: 应用重新加载时自动恢复钱包连接
- 🛡️ **类型安全**: 完整的TypeScript支持和类型定义
- 📱 **SSR兼容**: 支持Next.js等服务器端渲染框架
- 🎯 **框架优化**: 专为React模式设计
- 🛠️ **工具函数**: 内置格式化和验证工具

## 安装

```bash
npm install @btc-connect/react
```

**对等依赖**: 确保已安装React 18+:

```bash
npm install react react-dom
```

## 快速开始

```tsx
import React from 'react';
import { BTCWalletProvider, ConnectButton } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <div>
        <h1>我的比特币应用</h1>
        <ConnectButton />
      </div>
    </BTCWalletProvider>
  );
}

export default App;
```

## 核心组件

### BTCWalletProvider

管理钱包状态并为整个应用树提供状态管理的根Provider。

**Props:**
- `children: ReactNode` - 子组件
- `autoConnect?: boolean` - 启用自动连接（默认: false）
- `connectTimeout?: number` - 连接超时时间，毫秒（默认: 5000）
- `connectionPolicy?: ConnectionPolicy` - 自定义连接策略
- `theme?: 'light' | 'dark'` - 所有组件的主题（默认: 'light'）
- `config?: WalletManagerConfig` - 核心管理器配置

### ConnectButton

可自定义样式的钱包连接预构建按钮组件。

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - 按钮大小（默认: 'md'）
- `variant?: 'select' | 'button' | 'compact'` - 显示样式（默认: 'select'）
- `label?: string` - 自定义按钮标签
- `disabled?: boolean` - 禁用按钮（默认: false）
- `className?: string` - 自定义CSS类
- `style?: React.CSSProperties` - 自定义内联样式

### WalletModal

钱包选择和连接管理的模态框组件。

**Props:**
- `theme?: 'light' | 'dark'` - 模态框主题（默认: 从provider继承）
- `isOpen?: boolean` - 模态框打开状态（受控模式）
- `onClose?: () => void` - 关闭回调
- `onConnect?: (walletId: string) => void` - 连接回调

## React Hooks

### Hooks 概览

| Hook | 说明 | 主要返回值 |
|------|------|-----------|
| `useWallet()` | 主要 Hook | 所有功能的统一访问点 |
| `useConnectWallet()` | 连接操作 | `connect`, `disconnect`, `switchWallet` |
| `useNetwork()` | 网络管理 | `network`, `switchNetwork` |
| `useWalletModal()` | 弹窗控制 | `isModalOpen`, `openModal`, `closeModal` |
| `useAccount()` | 账户信息 | `address`, `publicKey`, `accounts` |
| `useBalance()` | 余额管理 | `balance`, `refreshBalance` |
| `useSignature()` | 签名操作 | `signMessage`, `signPsbt` |
| `useTransactions()` | 交易操作 | `sendBitcoin` |
| `useWalletEvent()` | 事件监听 | 自动管理生命周期 |
| `useWalletManager()` | 管理器访问 | `currentAdapter`, `availableAdapters` |
| `useWalletModalEnhanced()` | 增强弹窗 | `openWithSource`, `forceClose` |
| `useWalletDetection()` | 钱包检测 | `isDetecting`, `detectedWallets`, `stats` |

### useWallet - 统一Hook

主要hook，提供所有钱包功能的访问。

**返回值:**
```typescript
interface UseWalletReturn {
  // === 基础状态 ===
  status: ConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: BalanceInfo | null;
  publicKey: string | null;
  accounts: AccountInfo[];
  currentAccount: AccountInfo | null;
  network: Network;
  error: Error | null;
  currentWallet: WalletInfo | null;

  // === 连接操作 ===
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  availableWallets: WalletInfo[];

  // === 网络管理 ===
  switchNetwork: (network: Network) => Promise<void>;

  // === 事件监听 ===
  useWalletEvent: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => void;

  // === 弹窗控制 ===
  walletModal: {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
  };

  // === 钱包管理器 ===
  currentAdapter: BTCWalletAdapter | null;
  allAdapters: BTCWalletAdapter[];
  manager: BTCWalletManager;

  // === 签名功能 ===
  signMessage: (message: string) => Promise<string>;
  signPsbt: (psbt: string) => Promise<string>;

  // === 交易功能 ===
  sendBitcoin: (to: string, amount: number) => Promise<string>;

  // === 工具函数 ===
  utils: {
    formatAddress: (address: string, options?: FormatOptions) => Promise<string>;
    formatBalance: (satoshis: number, options?: FormatOptions) => Promise<string>;
  };
}
```

### useWalletEvent

监听钱包事件的hook，支持自动清理。

**参数:**
- `event: WalletEvent` - 事件类型（'connect', 'disconnect', 'accountChange', 'networkChange', 'error'）
- `handler: EventHandler` - 事件处理函数

**返回值:**
```typescript
interface UseWalletEventReturn<T> {
  on: (handler: EventHandler<T>) => void;
  off: (handler: EventHandler<T>) => void;
  once: (handler: EventHandler<T>) => void;
  clear: () => void;
  eventHistory: EventHistoryItem[];
}
```

### useNetwork

网络管理和切换的hook。

**返回值:**
```typescript
interface UseNetworkReturn {
  network: Network;
  switchNetwork: (network: Network) => Promise<void>;
}
```

### useTheme

主题管理和切换的hook。

**返回值:**
```typescript
interface UseThemeReturn {
  theme: ThemeMode;
  systemTheme: ThemeMode;
  effectiveTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resetTheme: () => void;
}
```

### useWalletDetection

基于事件的实时钱包检测 Hook。提供全面的钱包检测状态管理和事件监听。

**返回值:**
```typescript
interface UseWalletDetectionReturn {
  // === 状态 ===
  isDetecting: boolean;                    // 是否正在检测
  detectedWallets: DetectedWallet[];       // 已检测到的钱包列表
  detectionComplete: boolean;              // 检测是否完成
  lastDetectionTime: number | null;        // 上次检测时间戳
  stats: WalletDetectionStats;             // 检测统计信息

  // === 方法 ===
  detectWallets: () => Promise<DetectedWallet[]>;  // 手动触发检测
  resetDetectionState: () => void;                 // 重置检测状态
  getWalletInfo: (walletId: string) => DetectedWallet | null;
  isWalletAvailable: (walletId: string) => boolean;
  getAvailableWallets: () => string[];

  // === 事件监听器 ===
  onWalletDetected: (callback: (result: DetectedWallet) => void) => void;
  onDetectionComplete: (callback: (results: DetectedWallet[]) => void) => void;
  onAvailableWallets: (callback: (wallets: string[]) => void) => void;
  removeAllListeners: () => void;
}

interface DetectedWallet {
  walletId: string;
  name: string;
  isAvailable: boolean;
}

interface WalletDetectionStats {
  totalScans: number;           // 执行的总扫描次数
  successfulDetections: number; // 成功检测次数
  lastScanDuration: number;     // 上次扫描耗时（毫秒）
  averageScanDuration: number;  // 平均扫描耗时（毫秒）
  detectedWalletCount: number;  // 检测到的钱包数量
}
```

**示例:**
```tsx
import { useWalletDetection } from '@btc-connect/react';

function WalletDetectionExample() {
  const {
    isDetecting,
    detectedWallets,
    detectionComplete,
    stats,
    detectWallets,
    onWalletDetected,
    onDetectionComplete
  } = useWalletDetection();

  // 监听钱包检测事件
  onWalletDetected((wallet) => {
    console.log('检测到钱包:', wallet.name);
  });

  onDetectionComplete((wallets) => {
    console.log('检测完成:', wallets.length, '个钱包');
  });

  return (
    <div>
      <h3>钱包检测</h3>
      <p>状态: {isDetecting ? '检测中...' : '空闲'}</p>
      <p>完成: {detectionComplete ? '是' : '否'}</p>
      <p>总扫描次数: {stats.totalScans}</p>
      <p>平均耗时: {stats.averageScanDuration}ms</p>

      <button onClick={detectWallets} disabled={isDetecting}>
        {isDetecting ? '检测中...' : '检测钱包'}
      </button>

      <ul>
        {detectedWallets.map((wallet) => (
          <li key={wallet.walletId}>
            {wallet.name} - {wallet.isAvailable ? '可用' : '不可用'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### useWalletManager

访问和管理钱包适配器的 Hook。提供对底层钱包管理器的直接访问，用于高级用例。

**返回值:**
```typescript
interface UseWalletManagerReturn {
  currentAdapter: BTCWalletAdapter | null;     // 当前活动的适配器
  availableAdapters: BTCWalletAdapter[];       // 所有可用适配器
  adapterStates: Record<string, WalletState>;  // 每个适配器的状态
  getAdapter: (walletId: string) => BTCWalletAdapter | null;
  addAdapter: (adapter: BTCWalletAdapter) => void;
  removeAdapter: (walletId: string) => void;
  manager: BTCWalletManager;                   // 直接访问管理器
}
```

**示例:**
```tsx
import { useWalletManager } from '@btc-connect/react';

function WalletManagerExample() {
  const {
    currentAdapter,
    availableAdapters,
    adapterStates,
    getAdapter,
    manager
  } = useWalletManager();

  // 获取特定适配器
  const unisatAdapter = getAdapter('unisat');

  // 检查适配器状态
  const adapterState = adapterStates['unisat'];

  return (
    <div>
      <p>当前适配器: {currentAdapter?.name || '无'}</p>
      <p>可用适配器: {availableAdapters.length}</p>
      {availableAdapters.map((adapter) => (
        <div key={adapter.id}>
          <span>{adapter.name}</span>
          <span>状态: {adapterStates[adapter.id]?.status}</span>
        </div>
      ))}
    </div>
  );
}
```

### useWalletModalEnhanced

增强的钱包弹窗管理 Hook，支持来源追踪、配置管理和高级操作。

**返回值:**
```typescript
interface UseWalletModalEnhancedReturn {
  // === 状态 ===
  isOpen: boolean;
  openSource: string | null;     // 弹窗打开的来源
  openCount: number;             // 弹窗打开次数
  config: ModalConfig;           // 当前弹窗配置
  modalState: ModalState;        // 完整弹窗状态

  // === 方法 ===
  open: () => void;
  close: () => void;
  toggle: () => void;
  openWithSource: (source: string) => void;  // 带来源追踪的打开
  forceClose: () => void;                     // 强制关闭（忽略配置）
  setConfig: (config: Partial<ModalConfig>) => void;
}

interface ModalConfig {
  closeOnEscape?: boolean;        // ESC键关闭（默认: true）
  closeOnOutsideClick?: boolean;  // 点击外部关闭（默认: true）
  showCloseButton?: boolean;      // 显示关闭按钮（默认: true）
  preventBodyScroll?: boolean;    // 禁止页面滚动（默认: true）
  animationDuration?: number;     // 动画时长（毫秒，默认: 300）
}
```

**示例:**
```tsx
import { useWalletModalEnhanced } from '@btc-connect/react';

function ModalExample() {
  const {
    isOpen,
    open,
    close,
    openWithSource,
    forceClose,
    openSource,
    openCount,
    config,
    setConfig
  } = useWalletModalEnhanced();

  return (
    <div>
      <p>弹窗状态: {isOpen ? '打开' : '关闭'}</p>
      <p>打开来源: {openSource || '未知'}</p>
      <p>打开次数: {openCount}</p>

      <button onClick={() => openWithSource('header-button')}>
        从头部打开
      </button>

      <button onClick={open}>打开（默认）</button>
      <button onClick={close}>关闭</button>
      <button onClick={forceClose}>强制关闭</button>

      <button onClick={() => setConfig({
        closeOnEscape: false,
        animationDuration: 500
      })}>
        更新配置
      </button>
    </div>
  );
}
```

## API 参考

### 连接管理

```typescript
// 连接钱包
const { connect, isConnected, address } = useWallet();

const handleConnect = async () => {
  try {
    await connect('unisat');
    console.log('连接到:', address);
  } catch (error) {
    console.error('连接失败:', error);
  }
};
```

### 事件处理

```typescript
// 监听钱包事件
const { useWalletEvent } = useWallet();

useWalletEvent('connect', (accounts) => {
  console.log('钱包已连接:', accounts);
});

useWalletEvent('disconnect', () => {
  console.log('钱包已断开');
});
```

### 比特币操作

```typescript
// 签名消息
const { signMessage, signPsbt, sendBitcoin } = useWallet();

const handleSignMessage = async () => {
  const signature = await signMessage('Hello, Bitcoin!');
  console.log('签名:', signature);
};
```

## 高级用法

### 自定义连接策略

```typescript
interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[];
  emitEventsOnAutoConnect?: boolean;
}

const customPolicy: ConnectionPolicy = {
  tasks: [
    {
      run: async (context) => {
        // 自定义连接逻辑
        return { success: true };
      },
      required: true
    }
  ]
};

<BTCWalletProvider connectionPolicy={customPolicy}>
  <App />
</BTCWalletProvider>
```

### Next.js SSR支持

```tsx
// pages/_app.tsx
import { BTCWalletProvider } from '@btc-connect/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <BTCWalletProvider autoConnect={true}>
      <Component {...pageProps} />
    </BTCWalletProvider>
  );
}

// pages/index.tsx
import { ConnectButton } from '@btc-connect/react';

export default function Home() {
  return (
    <div>
      <h1>比特币钱包应用</h1>
      <ConnectButton />
    </div>
  );
}
```

## 最佳实践

1. **Provider位置**: 将BTCWalletProvider放在应用的根位置
2. **错误处理**: 始终将钱包操作包装在try-catch块中
3. **事件清理**: 使用hooks提供的自动清理功能
4. **类型安全**: 利用TypeScript类型获得更好的开发体验
5. **SSR**: 确保钱包操作只在客户端执行

## 迁移指南

### 从v0.3.x迁移到v0.4.0+

```tsx
// 旧方式
import { useWallet, useAccount, useWalletEvent } from '@btc-connect/react';
const { connect } = useWallet();
const { address } = useAccount();
useWalletEvent('connect', handler);

// 新方式
import { useWallet } from '@btc-connect/react';
const { connect, address, useWalletEvent } = useWallet();
useWalletEvent('connect', handler);
```

## 贡献

请阅读我们的[贡献指南](../../CONTRIBUTING.md)了解我们的行为准则和提交拉取请求的流程。

## 许可证

本项目采用MIT许可证 - 查看[LICENSE](../../LICENSE)文件了解详情。

## 支持

- 📧 邮箱: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [问题反馈](https://github.com/IceHugh/btc-connect/issues)