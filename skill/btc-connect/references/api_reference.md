# BTC-Connect API 参考文档 v0.5.1

> 专为比特币 Web3 应用设计的钱包连接工具包完整 API 参考。

## 包结构概览

| 包 | 说明 |
|---|---|
| `@btc-connect/core` | 框架无关的核心适配层和管理系统 |
| `@btc-connect/react` | React 适配层：Hooks + Context + Components |
| `@btc-connect/vue` | Vue 3 适配层：Composables + 插件 + Components |

---

## 核心包 (@btc-connect/core)

### 基础类型

```typescript
type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet'
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface WalletInfo {
  id: string; name: string; icon: string
  description?: string; homepage?: string
}

interface BalanceDetail {
  confirmed: number   // 已确认余额（聪）
  unconfirmed: number // 未确认余额（聪）
  total: number       // 总余额（聪）
}

interface AccountInfo {
  address: string
  publicKey?: string
  balance?: BalanceDetail
  network?: Network
}

interface WalletState {
  status: ConnectionStatus
  accounts: AccountInfo[]
  currentAccount?: AccountInfo
  network?: Network
  error?: Error
}
```

### 事件类型

```typescript
type WalletEvent =
  | 'connect' | 'disconnect' | 'accountChange' | 'networkChange'
  | 'error' | 'availableWallets' | 'walletDetected' | 'walletDetectionComplete'

interface EventHandlerMap {
  connect: (params: ConnectEventParams) => void
  disconnect: (params: DisconnectEventParams) => void
  accountChange: (params: AccountChangeEventParams) => void
  networkChange: (params: NetworkChangeEventParams) => void
  error: (params: ErrorEventParams) => void
  availableWallets: (params: AvailableWalletsEventParams) => void
  walletDetected: (params: WalletDetectedEventParams) => void
  walletDetectionComplete: (params: WalletDetectionCompleteEventParams) => void
}

type EventHandler<T extends WalletEvent> =
  T extends keyof EventHandlerMap ? EventHandlerMap[T] : (...args: any[]) => void
```

### BTCWalletAdapter 接口

```typescript
interface BTCWalletAdapter {
  readonly id: string; readonly name: string; readonly icon: string
  isReady(): boolean
  getState(): WalletState
  connect(): Promise<AccountInfo[]>
  disconnect(): Promise<void>
  getAccounts(): Promise<AccountInfo[]>
  getCurrentAccount(): Promise<AccountInfo | null>
  getNetwork(): Promise<Network>
  switchNetwork(network: Network): Promise<void>
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void
  signMessage(message: string): Promise<string>
  signPsbt(psbt: string): Promise<string>
  sendBitcoin(toAddress: string, amount: number): Promise<string>
}
```

### BaseWalletAdapter 抽象类

除实现 `BTCWalletAdapter` 接口外，还提供以下公共方法：

```typescript
abstract class BaseWalletAdapter implements BTCWalletAdapter {
  // 扩展公共方法
  requestAccounts(): Promise<AccountInfo[]>
  getPublicKey(): Promise<string>
  getBalance(): Promise<BalanceInfo>
  signMessageAdvanced(message: string, options?: SignMessageOptions): Promise<string>
  sendBitcoinAdvanced(toAddress: string, amount: number, options?: SendBitcoinOptions): Promise<string>
  sendInscription(address: string, inscriptionId: string, options?: SendInscriptionOptions): Promise<string>
  pushTx(options: PushTxOptions): Promise<string>
  getInscriptions(options?: GetInscriptionsOptions): Promise<InscriptionsResponse>
  destroy(): void
}
```

### 钱包适配器

| 适配器 | ID | switchNetwork | 说明 |
|--------|-----|:---:|------|
| `UniSatAdapter` | `unisat` | 支持 | 完整功能，支持 Ordinals/BRC-20 |
| `OKXAdapter` | `okx` | 不支持 | 需用户手动在钱包中切换网络 |
| `XverseAdapter` | `xverse` | - | 工厂中已禁用，不可通过 `createAdapter` 创建 |

### 工厂函数

```typescript
// 创建适配器实例（xverse 已禁用）
function createAdapter(type: 'unisat' | 'okx' | 'xverse'): BaseWalletAdapter

// 获取所有适配器（UniSat + OKX）
function getAllAdapters(): BaseWalletAdapter[]

// 获取已安装钱包的适配器
function getAvailableAdapters(): BaseWalletAdapter[]

// 增强钱包检测（支持延迟注入，20s 超时，300ms 轮询）
function detectAvailableWallets(config?: WalletDetectionConfig): Promise<WalletDetectionResult>

// 同步重试检测
function getAvailableWalletsWithRetry(maxRetries?: number, retryDelay?: number): BaseWalletAdapter[]

interface WalletDetectionConfig {
  timeout?: number    // 默认 20000ms
  interval?: number   // 默认 300ms
  onProgress?: (detectedWallets: string[], elapsedTime: number) => void
}

interface WalletDetectionResult {
  wallets: string[]; adapters: BaseWalletAdapter[]
  elapsedTime: number; isComplete: boolean
}
```

### BTCWalletManager

```typescript
class BTCWalletManager implements WalletManager {
  constructor(config?: WalletManagerConfig)
  config: WalletManagerConfig

  // 适配器管理
  initializeAdapters(): void
  register(adapter: BTCWalletAdapter): void
  unregister(walletId: string): void
  getAdapter(walletId: string): BTCWalletAdapter | null
  getAllAdapters(): BTCWalletAdapter[]
  getAvailableWallets(): WalletInfo[]

  // 连接管理
  connect(walletId: string): Promise<AccountInfo[]>
  disconnect(): Promise<void>
  switchWallet(walletId: string): Promise<AccountInfo[]>
  assumeConnected(walletId: string): Promise<AccountInfo[] | null>
  switchNetwork(network: string): Promise<void>

  // 状态获取
  getState(): WalletState
  getCurrentAdapter(): BTCWalletAdapter | null
  getCurrentWallet(): WalletInfo | null

  // 事件监听
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void

  // 销毁
  destroy(): void
}

interface WalletManagerConfig {
  onError?: (error: Error) => void
  onStateChange?: (state: WalletState) => void
  cache?: Partial<Record<string, Partial<Omit<CacheConfig, 'enabled'>>>>
  enableCache?: boolean
  modalConfig?: ModalConfig
}
```

### 事件系统

```typescript
class EventEmitter { on/off/emit/clear/destroy }
class WalletEventManager extends EventEmitter {
  emitConnect(walletId: string, accounts: AccountInfo[]): void
  emitDisconnect(walletId: string): void
  emitAccountChange(walletId: string, accounts: AccountInfo[]): void
  emitNetworkChange(walletId: string, network: Network): void
  emitError(walletId: string, error: WalletError): void
}
```

### 缓存系统

```typescript
class MemoryCache<T> {
  constructor(options?: { ttl?: number; maxSize?: number; enableAutoCleanup?: boolean; cleanupInterval?: number })
  set(key: string, data: T, ttl?: number): void
  get(key: string): T | null
  has(key: string): boolean
  delete(key: string): boolean; clear(): void; size(): number
  keys(): string[]; cleanup(): number; getStats(): CacheStats; destroy(): void
}

class EnhancedMemoryCache<T> extends MemoryCache<T> {
  getMany(keys: string[]): Map<string, T>
  setMany(entries: Array<{key: string; value: T; ttl?: number}>): number
  deleteMany(keys: string[]): number
  find(predicate: (value: T, key: string) => boolean): Array<[string, T]>
  entries(): Array<[string, T]>; getHitRatePercent(): number
  on/off(handler: CacheEventHandler): void
}

class CacheManager {
  static getInstance(): CacheManager
  getCache<T>(name: string, options?): MemoryCache<T>
  deleteCache(name: string): boolean; clearAll(): void
  getAllStats(): Record<string, CacheStats>; cleanupAll(): number; destroy(): void
}

class CacheKeyBuilder {
  static balance(walletId: string, address: string): string
  static accounts(walletId: string, network: string): string
  static network(walletId: string): string
  static transaction(walletId: string, txId: string): string
  static signature(walletId: string, msgHash: string): string
  static walletState(walletId: string, address: string): string
  static inscriptions(walletId: string, address: string, cursor: number): string
}

// 装饰器
function cached(options: { cacheName: string; ttl: number; keyBuilder?: Function; shouldCache?: Function })
function smartCached(options: { cacheName: string; successTtl: number; errorTtl: number; emptyTtl?: number })
function conditionalCached(condition: Function, options: { cacheName: string; ttl: number })
function invalidateCache(cacheNames: string[])

const CachePresets = {
  balance: { ttl: 10000 }, accounts: { ttl: 30000 },
  network: { ttl: 60000 }, inscriptions: { ttl: 60000 },
  chain: { ttl: 60000 }, publicKey: { ttl: 30000 }
}
```

### 工具函数

```typescript
function formatAddress(address: string, options?: FormatAddressOptions): string
function formatBalance(satoshis: number, options?: FormatBalanceOptions): string
function copyToClipboard(text: string): Promise<boolean>
function validateAddress(address: string): boolean
function validateAmount(amount: number): boolean
function getWalletIcon(walletId: string): string
function formatTimestamp(timestamp: number, locale?: string): string
function formatTxid(txid: string, options?: { startChars?: number; endChars?: number; separator?: string }): string
function calculateFeeRate(fee: number, size: number): number
function formatFeeRate(feeRate: number): string
function createWalletManager(config?: WalletManagerConfig): BTCWalletManager

const utils = {
  formatAddress, formatBalance, copyToClipboard, validateAddress,
  validateAmount, getWalletIcon, formatTimestamp, formatTxid,
  calculateFeeRate, formatFeeRate
} as const

interface FormatAddressOptions { startChars?: number; endChars?: number; separator?: string; threshold?: number }
interface FormatBalanceOptions { unit?: 'BTC' | 'satoshi' | 'mBTC'; decimals?: number; showSymbol?: boolean; locale?: string; useGrouping?: boolean }
```

### 批处理系统

```typescript
class BatchScheduler<T = unknown, R = unknown> {
  constructor(processor: BatchProcessor<T, R>, config?: BatchSchedulerConfig)
  submit(data: T, priority?: number): Promise<R>
  flush(): Promise<void>; clear(): void
  getQueueSize(): number; getMetrics(): BatchMetrics
  on/off(handler: BatchEventHandler): void; destroy(): void
}

function createBatchScheduler<T, R>(processor: BatchProcessor<T, R>, config?: BatchSchedulerConfig): BatchScheduler<T, R>
function createSimpleBatchScheduler<T, R>(processor: (items: T[]) => Promise<R[]>, config?: BatchSchedulerConfig): { submit: (data: T) => Promise<R> }

interface BatchSchedulerConfig { maxBatchSize?: number; maxWaitTimeMS?: number; minBatchSize?: number; priorityThreshold?: number }
interface BatchMetrics { totalBatches: number; totalRequests: number; averageBatchSize: number; averageWaitTime: number; successRate: number }
```

### 错误处理

```typescript
class WalletErrorHandler { static handle(error: Error, context?: Partial<ErrorContext>): void }
class ErrorRecoveryStrategy { static retry<T>(fn: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T> }
class ErrorReporter { report(error: Error, context?: Partial<ErrorContext>): void }

// 统一错误系统
class UnifiedError extends Error {
  code: ErrorCode; severity: ErrorSeverity; context: ErrorContext
  getFullMessage(): string; toJSON(): object; canRetry(): boolean
}
const ErrorFactory: { walletNotInstalled, walletNotConnected, walletConnectionFailed, networkError, transactionFailed, signatureFailed, ... }
enum ErrorCode { UNKNOWN_ERROR='1000', WALLET_NOT_INSTALLED='2000', WALLET_CONNECTION_FAILED='2002', NETWORK_ERROR='3000', TRANSACTION_FAILED='4000', SIGNATURE_FAILED='5000', ... }
enum ErrorSeverity { LOW, MEDIUM, HIGH, CRITICAL }

// 传统错误类（向后兼容）
class WalletError extends Error { code: string; context: ErrorContext; getFullMessage(): string }
class WalletNotInstalledError extends WalletError
class WalletConnectionError extends WalletError
class WalletDisconnectedError extends WalletError
class NetworkError extends WalletError
```

### 统一类型 (types/unified.ts)

```typescript
type ThemeMode = 'light' | 'dark' | 'auto'
interface ThemeConfig { mode: ThemeMode; followSystem: boolean; primary?: string; background?: string; text?: string; border?: string; cssVariables?: Record<string, string> }
interface Theme { mode: ThemeMode; isDark: boolean; systemTheme: 'light' | 'dark'; config: ThemeConfig }

interface UseWalletBaseReturn {
  isConnected: boolean; isConnecting: boolean; walletId: string | null
  account: AccountInfo | null; accounts: AccountInfo[]
  network: Network; error: Error | null
  connect: (walletId?: string) => Promise<AccountInfo[]>
  disconnect: () => Promise<void>
  switchWallet: (walletId: string) => Promise<void>
}

interface UseWalletEnhancedReturn extends UseWalletBaseReturn {
  getBalance: () => UseBalanceReturn; getNetwork: () => UseNetworkReturn
  getAccount: () => UseAccountReturn; getSignature: () => UseSignatureReturn
  getTransactions: () => UseTransactionsReturn; getEvents: () => UseWalletEventReturn
  getManager: () => UseWalletManagerReturn; getTheme: () => UseThemeReturn
  getModal: () => UseWalletModalReturn
}

interface UseBalanceReturn { balance: BalanceDetail | null; isLoading: boolean; error: Error | null; refresh: () => Promise<void>; format: (satoshis: number, options?: FormatBalanceOptions) => string }
interface UseNetworkReturn { network: Network; isSwitching: boolean; supportedNetworks: Network[]; switchNetwork: (network: Network) => Promise<void>; getNetworkInfo: (network: Network) => { name: string; type: string } }
interface UseAccountReturn { accounts: AccountInfo[]; currentAccount: AccountInfo | null; address: string | null; publicKey: string | null; refresh: () => Promise<void>; switchAccount: (address: string) => Promise<void>; verifyOwnership: (message: string) => Promise<string> }
interface UseSignatureReturn { isSigning: boolean; error: Error | null; signMessage: (message: string) => Promise<string>; signPsbt: (psbt: string) => Promise<string>; verifySignature: (message: string, signature: string, address: string) => boolean }
interface UseTransactionsReturn { isSending: boolean; error: Error | null; sendBitcoin: (toAddress: string, amount: number) => Promise<string>; sendTransaction: (psbt: string) => Promise<string>; estimateFee: (toAddress: string, amount: number) => Promise<number> }
interface UseThemeReturn { theme: Theme; themeConfig: ThemeConfig; setTheme: (theme: Partial<Theme>) => void; setThemeMode: (mode: ThemeMode) => void; setCustomTheme: (config: Partial<ThemeConfig>) => void; resetTheme: () => void; isDark: boolean; systemTheme: 'light' | 'dark' }
interface UseWalletEventReturn { on: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => () => void; once: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => void; off: <T extends WalletEvent>(event: T, handler?: EventHandler<T>) => void; eventHistory: WalletEventRecord[]; clear: () => void; clearHistory: () => void }
interface UseWalletManagerReturn { currentAdapter: BTCWalletAdapter | null; availableAdapters: BTCWalletAdapter[]; adapterStates: Record<string, WalletState>; getAdapter: (walletId: string) => BTCWalletAdapter | null; addAdapter: (adapter: BTCWalletAdapter) => void; removeAdapter: (walletId: string) => void; manager: WalletManager }
interface UseWalletModalReturn { isOpen: boolean; open: () => void; close: () => void; toggle: () => void; openWithSource: (source: string) => void; forceClose: () => void; openSource: string | null; openCount: number; config: ModalConfig; setConfig: (config: Partial<ModalConfig>) => void; modalState: ModalState }
interface WalletDetectionOptions { autoConnect?: boolean; connectTimeout?: number; interval?: number; timeout?: number }
interface WalletDetectionResult { wallets: string[]; adapters: BTCWalletAdapter[]; elapsedTime: number; isComplete: boolean }
interface UnifiedConfig { theme?: Partial<ThemeConfig>; modal?: ModalConfig; walletDetection?: WalletDetectionOptions; performance?: { enableCache?: boolean; cacheTTL?: number; enableMonitoring?: boolean }; dev?: { debug?: boolean; showPerformanceMetrics?: boolean; verboseLogging?: boolean } }
interface ConnectButtonProps extends ComponentBaseProps { size?: 'sm' | 'md' | 'lg'; variant?: 'select' | 'button' | 'compact'; label?: string; showBalance?: boolean; showAddress?: boolean; balancePrecision?: number; onConnect?: (walletId: string, accounts: AccountInfo[]) => void; onDisconnect?: (walletId: string) => void; onError?: (error: WalletError) => void }
interface WalletModalProps extends ComponentBaseProps { isOpen?: boolean; wallets?: WalletInfo[]; onConnect?: (walletId: string) => void | Promise<void>; onClose?: () => void; title?: string; description?: string }
```

---

## React 包 (@btc-connect/react)

### Hooks 列表

| Hook | 说明 |
|------|------|
| `useWallet` | 统一入口 Hook，包含所有功能 |
| `useConnectWallet` | 连接操作：connect, disconnect, switchWallet |
| `useNetwork` | 网络管理：network, switchNetwork |
| `useAccount` | 账户信息：address, publicKey, accounts |
| `useBalance` | 余额管理：balance, refreshBalance |
| `useSignature` | 签名操作：signMessage, signPsbt |
| `useTransactions` | 交易操作：sendBitcoin |
| `useWalletEvent` | 事件监听（自动清理） |
| `useWalletModal` | 模态框控制：isOpen, openModal, closeModal |
| `useWalletDetection` | 钱包检测：isDetecting, detectedWallets |
| `useWalletManager` | 管理器访问：currentAdapter, availableAdapters |
| `useAutoConnect` | 自动重连 |

### useWallet - 统一 Hook

```typescript
function useWallet(): {
  // 状态
  status: ConnectionStatus; isConnected: boolean; isConnecting: boolean
  address: string | null; balance: BalanceInfo | null; publicKey: string | null
  accounts: AccountInfo[]; currentAccount: AccountInfo | null
  network: Network; error: Error | null; currentWallet: WalletInfo | null

  // 连接操作
  connect: (walletId: string) => Promise<AccountInfo[]>
  disconnect: () => Promise<void>
  switchWallet: (walletId: string) => Promise<AccountInfo[]>
  availableWallets: WalletInfo[]

  // 网络管理
  switchNetwork: (network: Network) => Promise<void>

  // 事件监听
  useWalletEvent: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => void

  // 模态框控制
  walletModal: { isModalOpen: boolean; openModal: () => void; closeModal: () => void; toggleModal: () => void }

  // 管理器
  currentAdapter: BTCWalletAdapter | null; allAdapters: BTCWalletAdapter[]; manager: BTCWalletManager

  // 签名与交易
  signMessage: (message: string) => Promise<string>
  signPsbt: (psbt: string) => Promise<string>
  sendBitcoin: (to: string, amount: number) => Promise<string>

  // 工具函数
  utils: { formatAddress: (address: string, options?) => Promise<string>; formatBalance: (satoshis: number, options?) => Promise<string> }
}
```

```tsx
import { BTCWalletProvider, useWallet } from '@btc-connect/react'

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <WalletComponent />
    </BTCWalletProvider>
  )
}

function WalletComponent() {
  const { isConnected, address, connect, disconnect, switchNetwork } = useWallet()
  return (
    <div>
      {isConnected ? (
        <><p>{address}</p><button onClick={disconnect}>断开</button></>
      ) : (
        <button onClick={() => connect('unisat')}>连接</button>
      )}
    </div>
  )
}
```

### 组件

```typescript
// ConnectButton
<ConnectButton size?: 'sm'|'md'|'lg' variant?: 'select'|'button'|'compact'
  label?: string disabled?: boolean className?: string style?: React.CSSProperties />

// WalletModal
<WalletModal title?: string className?: string style?: React.CSSProperties />
```

### BTCWalletProvider

```tsx
<BTCWalletProvider
  config?: WalletManagerConfig
  autoConnect?: boolean           // 默认 false
  connectTimeout?: number         // 默认 5000
  connectionPolicy?: ConnectionPolicy
  modalConfig?: ModalConfig
>
  {children}
</BTCWalletProvider>

interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[]
  emitEventsOnAutoConnect?: boolean
}
interface ConnectionPolicyTask {
  run: (context: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>
  required: boolean
}
```

### 工具函数与常量

```typescript
const version = '0.5.1'
const defaultConfig = { walletOrder: ['unisat','okx','xverse'], featuredWallets: ['unisat','okx'], theme: 'light', animation: 'scale', showTestnet: false, showRegtest: false, size: 'md', variant: 'select' }

function createBalanceDetail(confirmed: number, unconfirmed: number): BalanceDetail
function normalizeBalance(balance: BalanceDetail | number | null): BalanceDetail
function formatAddress(address: string, options?: FormatAddressOptions): string
function formatBalance(satoshis: number, options?: FormatBalanceOptions): string
```

> 注意：`useAccount`/`useBalance` 导出版本比内部增强版本更简单。`useWalletInfo` 和 `WalletContextType` 不从主入口导出。

---

## Vue 包 (@btc-connect/vue)

### Composables 列表

| Composable | 说明 |
|------------|------|
| `useWallet` | 统一入口 Composable，包含所有功能 |
| `useCore` | 核心功能：manager, state, isConnected |
| `useNetwork` | 网络管理：network, switchNetwork |
| `useAccount` | 账户信息：accounts, currentAccount, balance |
| `useBalance` | 余额管理：balance, refreshBalance |
| `useSignature` | 签名操作：signMessage, signPsbt |
| `useTransactions` | 交易操作：sendBitcoin |
| `useConnectWallet` | 连接操作：connect, disconnect, switchWallet |
| `useWalletModal` | 模态框控制：isOpen, open, close |
| `useWalletDetection` | 钱包检测：isDetecting, detectionStats |
| `useWalletInfo` | 钱包信息：currentWallet, availableWallets |
| `useWalletEvent` | 事件监听（自动清理） |
| `useWalletManager` | 管理器访问：currentAdapter, availableAdapters |
| `useWalletManagerAdvanced` | 高级管理：connectMultiple, disconnectAll, healthCheck |
| `useWalletProvider` | Provider 初始化 |
| `useWalletSafe` | 安全访问（无 Provider 时不报错） |

### useWallet - 统一 Composable

返回值与 React 版 `useWallet` 形状一致，但所有状态值为 `Ref`/`ComputedRef` 包装（Vue 响应式）：

```typescript
function useWallet(): {
  status: Ref<ConnectionStatus>; isConnected: Ref<boolean>; isConnecting: Ref<boolean>
  address: Ref<string | undefined>; balance: Ref<number | undefined>
  network: Ref<Network>; error: Ref<Error | undefined>
  connect: (walletId: string) => Promise<AccountInfo[]>
  disconnect: () => Promise<void>
  switchWallet: (walletId: string) => Promise<AccountInfo[]>
  availableWallets: Ref<WalletInfo[]>
  useWalletEvent: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => UseWalletEventReturn<T>
  walletModal: UseWalletModalReturn
  manager: Ref<BTCWalletManager>
  // ... 其余属性同 React 版
}
```

```vue
<template>
  <div v-if="isConnected">
    <p>{{ address }}</p>
    <button @click="disconnect">断开</button>
  </div>
  <button v-else @click="connect('unisat')">连接</button>
</template>

<script setup>
import { useWallet } from '@btc-connect/vue'
const { isConnected, address, connect, disconnect } = useWallet()
</script>
```

### 组件

```typescript
// ConnectButton
<ConnectButton size?: 'sm'|'md'|'lg' variant?: 'select'|'button'|'compact'
  label?: string disabled?: boolean theme?: ThemeMode class?: string style?: StyleValue />

// AddressDisplay
<AddressDisplay address?: string maxLength?: number copyable?: boolean
  disabled?: boolean theme?: ThemeMode class?: string style?: StyleValue />

// BalanceDisplay
<BalanceDisplay balance?: BalanceDetail error?: Error precision?: number
  showUnit?: boolean theme?: ThemeMode class?: string style?: StyleValue />

// WalletStatus
<WalletStatus />
```

> 注意：`WalletModal` 为内部组件，不对外导出。

### BTCWalletPlugin

```typescript
import { BTCWalletPlugin } from '@btc-connect/vue'

app.use(BTCWalletPlugin, {
  autoConnect?: boolean,
  connectTimeout?: number,
  modalConfig?: ModalConfig,
  config?: WalletManagerConfig
})

interface BTCWalletPluginOptions {
  autoConnect?: boolean
  modalConfig?: WalletManagerConfig['modalConfig']
  config?: Omit<WalletManagerConfig, 'modalConfig'> & { modalConfig?: WalletManagerConfig['modalConfig'] }
}
```

### 配置系统

```typescript
function createConfigManager(config?: Partial<VueConfig>): ConfigManager

interface VueConfig {
  theme: ThemeConfig
  wallets: WalletConfig
  ui: UIConfig
  features: FeatureConfig
  performance: PerformanceConfig
  dev: DevConfig
}
```

### 错误类

```typescript
class BTCConnectError extends Error { code: string; walletId?: string }
class ConnectionError extends BTCConnectError { code: 'CONNECTION_ERROR' }
class NetworkError extends BTCConnectError { code: 'NETWORK_ERROR' }
class ConfigError extends BTCConnectError { code: 'CONFIG_ERROR' }
```

### 工具函数与常量

```typescript
const version = '0.5.1'
const isClient = typeof window !== 'undefined'
const isServer = !isClient
const defaultConfig = { walletOrder: ['unisat','okx','xverse'], featuredWallets: ['unisat','okx'], theme: 'light', animation: 'scale', showTestnet: false, showRegtest: false, size: 'md', variant: 'select' }

function formatAddress(address: string, options?: FormatAddressOptions): string
function formatBalance(satoshis: number, options?: FormatBalanceOptions): string
```

> 注意：`useAutoConnect`、`usePerformance`、`useWalletEventAdvanced`、`useGlobalModal` 不从主入口导出。
