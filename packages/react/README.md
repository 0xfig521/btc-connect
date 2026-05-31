# @btc-connect/react

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <strong>React adapter for BTC Connect with Hooks and Context</strong>
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

## Overview

`@btc-connect/react` provides React-specific bindings for BTC Connect, offering a declarative way to integrate Bitcoin wallet functionality into React applications. It includes custom hooks, context providers, and pre-built components for seamless wallet integration.

## Features

- 🎣 **Modern React Hooks**: Individual hooks for each function with unified access point
- 📦 **Context Provider**: Centralized wallet state management
- 🎨 **Pre-built Components**: Ready-to-use wallet connection UI components
- ⚛️ **React 18+ Support**: Built for modern React with concurrent features
- 🔄 **Auto Reconnection**: Automatic wallet reconnection on app reload
- 🛡️ **Type Safe**: Full TypeScript support with proper type definitions
- 📱 **SSR Compatible**: Server-side rendering support with Next.js
- 🎯 **Framework Optimized**: Designed specifically for React patterns
- 🛠️ **Utility Functions**: Built-in formatting and validation tools

## Installation

```bash
npm install @btc-connect/react
```

**Peer Dependencies**: Ensure you have React 18+ installed:

```bash
npm install react react-dom
```

## Quick Start

```tsx
import React from 'react';
import { BTCWalletProvider, ConnectButton } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <div>
        <h1>My Bitcoin App</h1>
        <ConnectButton />
      </div>
    </BTCWalletProvider>
  );
}

export default App;
```

## Core Components

### BTCWalletProvider

Root provider that manages wallet state and provides it to the application tree.

**Props:**
- `children: ReactNode` - Child components
- `autoConnect?: boolean` - Enable auto-connection (default: false)
- `connectTimeout?: number` - Connection timeout in ms (default: 5000)
- `connectionPolicy?: ConnectionPolicy` - Custom connection strategy
- `theme?: 'light' | 'dark'` - Theme for all components (default: 'light')
- `config?: WalletManagerConfig` - Core manager configuration

### ConnectButton

Pre-built button component for wallet connection with customizable styling.

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `variant?: 'select' | 'button' | 'compact'` - Display style (default: 'select')
- `label?: string` - Custom button label
- `disabled?: boolean` - Disable button (default: false)
- `className?: string` - Custom CSS class
- `style?: React.CSSProperties` - Custom inline styles

### WalletModal

Modal component for wallet selection and connection management.

**Props:**
- `theme?: 'light' | 'dark'` - Modal theme (default: inherited from provider)
- `isOpen?: boolean` - Modal open state (controlled mode)
- `onClose?: () => void` - Close callback
- `onConnect?: (walletId: string) => void` - Connection callback

## React Hooks

### Hooks Overview

| Hook | Description | Main Return Values |
|------|-------------|-------------------|
| `useWallet()` | Primary Hook | Unified access point for all wallet functionality |
| `useConnectWallet()` | Connection Operations | `connect`, `disconnect`, `switchWallet` |
| `useNetwork()` | Network Management | `network`, `switchNetwork` |
| `useWalletModal()` | Modal Control | `isModalOpen`, `openModal`, `closeModal` |
| `useAccount()` | Account Info | `address`, `publicKey`, `accounts` |
| `useBalance()` | Balance Management | `balance`, `refreshBalance` |
| `useSignature()` | Signature Operations | `signMessage`, `signPsbt` |
| `useTransactions()` | Transaction Operations | `sendBitcoin` |
| `useWalletEvent()` | Event Listening | Automatic lifecycle management |
| `useWalletManager()` | Manager Access | `currentAdapter`, `availableAdapters` |
| `useWalletModalEnhanced()` | Enhanced Modal | `openWithSource`, `forceClose` |
| `useWalletDetection()` | Wallet Detection | `isDetecting`, `detectedWallets`, `stats` |

### useWallet - Unified Hook

Primary hook providing access to all wallet functionality.

**Returns:**
```typescript
interface UseWalletReturn {
  // === Basic State ===
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

  // === Connection Operations ===
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  availableWallets: WalletInfo[];

  // === Network Management ===
  switchNetwork: (network: Network) => Promise<void>;

  // === Event Listening ===
  useWalletEvent: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => void;

  // === Modal Control ===
  walletModal: {
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    toggleModal: () => void;
  };

  // === Wallet Manager ===
  currentAdapter: BTCWalletAdapter | null;
  allAdapters: BTCWalletAdapter[];
  manager: BTCWalletManager;

  // === Signature Functions ===
  signMessage: (message: string) => Promise<string>;
  signPsbt: (psbt: string) => Promise<string>;

  // === Transaction Functions ===
  sendBitcoin: (to: string, amount: number) => Promise<string>;

  // === Utility Functions ===
  utils: {
    formatAddress: (address: string, options?: FormatOptions) => Promise<string>;
    formatBalance: (satoshis: number, options?: FormatOptions) => Promise<string>;
  };
}
```

### useWalletEvent

Hook for listening to wallet events with automatic cleanup.

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
  eventHistory: EventHistoryItem[];
}
```

### useNetwork

Hook for network management and switching.

**Returns:**
```typescript
interface UseNetworkReturn {
  network: Network;
  switchNetwork: (network: Network) => Promise<void>;
}
```

### useTheme

Hook for theme management and switching.

**Returns:**
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

Hook for real-time wallet detection with event-based updates. Provides comprehensive wallet detection status management and event listening.

**Returns:**
```typescript
interface UseWalletDetectionReturn {
  // === State ===
  isDetecting: boolean;                    // Whether detection is in progress
  detectedWallets: DetectedWallet[];       // List of detected wallets
  detectionComplete: boolean;              // Whether detection is complete
  lastDetectionTime: number | null;        // Timestamp of last detection
  stats: WalletDetectionStats;             // Detection statistics

  // === Methods ===
  detectWallets: () => Promise<DetectedWallet[]>;  // Manually trigger detection
  resetDetectionState: () => void;                 // Reset detection state
  getWalletInfo: (walletId: string) => DetectedWallet | null;
  isWalletAvailable: (walletId: string) => boolean;
  getAvailableWallets: () => string[];

  // === Event Listeners ===
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
  totalScans: number;           // Total number of scans performed
  successfulDetections: number; // Number of successful detections
  lastScanDuration: number;     // Duration of last scan (ms)
  averageScanDuration: number;  // Average scan duration (ms)
  detectedWalletCount: number;  // Number of detected wallets
}
```

**Example:**
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

  // Listen for wallet detection events
  onWalletDetected((wallet) => {
    console.log('Wallet detected:', wallet.name);
  });

  onDetectionComplete((wallets) => {
    console.log('Detection complete:', wallets.length, 'wallets found');
  });

  return (
    <div>
      <h3>Wallet Detection</h3>
      <p>Status: {isDetecting ? 'Detecting...' : 'Idle'}</p>
      <p>Complete: {detectionComplete ? 'Yes' : 'No'}</p>
      <p>Total Scans: {stats.totalScans}</p>
      <p>Average Duration: {stats.averageScanDuration}ms</p>

      <button onClick={detectWallets} disabled={isDetecting}>
        {isDetecting ? 'Detecting...' : 'Detect Wallets'}
      </button>

      <ul>
        {detectedWallets.map((wallet) => (
          <li key={wallet.walletId}>
            {wallet.name} - {wallet.isAvailable ? 'Available' : 'Not Available'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### useWalletManager

Hook for accessing and managing wallet adapters. Provides direct access to the underlying wallet manager for advanced use cases.

**Returns:**
```typescript
interface UseWalletManagerReturn {
  currentAdapter: BTCWalletAdapter | null;     // Currently active adapter
  availableAdapters: BTCWalletAdapter[];       // All available adapters
  adapterStates: Record<string, WalletState>;  // State of each adapter
  getAdapter: (walletId: string) => BTCWalletAdapter | null;
  addAdapter: (adapter: BTCWalletAdapter) => void;
  removeAdapter: (walletId: string) => void;
  manager: BTCWalletManager;                   // Direct manager access
}
```

**Example:**
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

  // Get specific adapter
  const unisatAdapter = getAdapter('unisat');

  // Check adapter state
  const adapterState = adapterStates['unisat'];

  return (
    <div>
      <p>Current Adapter: {currentAdapter?.name || 'None'}</p>
      <p>Available Adapters: {availableAdapters.length}</p>
      {availableAdapters.map((adapter) => (
        <div key={adapter.id}>
          <span>{adapter.name}</span>
          <span>State: {adapterStates[adapter.id]?.status}</span>
        </div>
      ))}
    </div>
  );
}
```

### useWalletModalEnhanced

Enhanced hook for wallet modal management with source tracking, configuration, and advanced operations.

**Returns:**
```typescript
interface UseWalletModalEnhancedReturn {
  // === State ===
  isOpen: boolean;
  openSource: string | null;     // Where the modal was opened from
  openCount: number;             // Number of times modal was opened
  config: ModalConfig;           // Current modal configuration
  modalState: ModalState;        // Complete modal state

  // === Methods ===
  open: () => void;
  close: () => void;
  toggle: () => void;
  openWithSource: (source: string) => void;  // Open with source tracking
  forceClose: () => void;                     // Force close (ignores config)
  setConfig: (config: Partial<ModalConfig>) => void;
}

interface ModalConfig {
  closeOnEscape?: boolean;        // Close on ESC key (default: true)
  closeOnOutsideClick?: boolean;  // Close on outside click (default: true)
  showCloseButton?: boolean;      // Show close button (default: true)
  preventBodyScroll?: boolean;    // Prevent body scroll (default: true)
  animationDuration?: number;     // Animation duration in ms (default: 300)
}
```

**Example:**
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
      <p>Modal is {isOpen ? 'open' : 'closed'}</p>
      <p>Opened from: {openSource || 'unknown'}</p>
      <p>Open count: {openCount}</p>

      <button onClick={() => openWithSource('header-button')}>
        Open from Header
      </button>

      <button onClick={open}>Open (default)</button>
      <button onClick={close}>Close</button>
      <button onClick={forceClose}>Force Close</button>

      <button onClick={() => setConfig({
        closeOnEscape: false,
        animationDuration: 500
      })}>
        Update Config
      </button>
    </div>
  );
}
```

## API Reference

### Connection Management

```typescript
// Connect to a wallet
const { connect, isConnected, address } = useWallet();

const handleConnect = async () => {
  try {
    await connect('unisat');
    console.log('Connected to:', address);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};
```

### Event Handling

```typescript
// Listen to wallet events
const { useWalletEvent } = useWallet();

useWalletEvent('connect', (accounts) => {
  console.log('Wallet connected:', accounts);
});

useWalletEvent('disconnect', () => {
  console.log('Wallet disconnected');
});
```

### Bitcoin Operations

```typescript
// Sign message
const { signMessage, signPsbt, sendBitcoin } = useWallet();

const handleSignMessage = async () => {
  const signature = await signMessage('Hello, Bitcoin!');
  console.log('Signature:', signature);
};
```

## Advanced Usage

### Custom Connection Policy

```typescript
interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[];
  emitEventsOnAutoConnect?: boolean;
}

const customPolicy: ConnectionPolicy = {
  tasks: [
    {
      run: async (context) => {
        // Custom connection logic
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

### SSR Support with Next.js

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
      <h1>Bitcoin Wallet App</h1>
      <ConnectButton />
    </div>
  );
}
```

## Best Practices

1. **Provider Placement**: Place BTCWalletProvider at the root of your app
2. **Error Handling**: Always wrap wallet operations in try-catch blocks
3. **Event Cleanup**: Use the automatic cleanup provided by hooks
4. **Type Safety**: Leverage TypeScript types for better development experience
5. **SSR**: Ensure wallet operations are only performed on the client side

## Migration Guide

### From v0.3.x to v0.4.0+

```tsx
// Old way
import { useWallet, useAccount, useWalletEvent } from '@btc-connect/react';
const { connect } = useWallet();
const { address } = useAccount();
useWalletEvent('connect', handler);

// New way
import { useWallet } from '@btc-connect/react';
const { connect, address, useWalletEvent } = useWallet();
useWalletEvent('connect', handler);
```

## Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

- 📧 Email: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [Issues](https://github.com/IceHugh/btc-connect/issues)