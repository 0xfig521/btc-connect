# @btc-connect/core

中文文档 | [English](./README.md)

<p align="center">
  <strong>框架无关的比特币钱包连接工具包</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/core">
    <img src="https://img.shields.io/npm/v/@btc-connect/core.svg" alt="NPM 版本">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="覆盖率">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/core">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/core.svg" alt="包大小">
  </a>
</p>

## 概述

`@btc-connect/core` 是一个框架无关的比特币钱包连接库，为各种比特币钱包提供统一的接口。它采用适配器模式来抽象钱包特定的实现，使得在不同钱包提供商之间切换变得简单。

## 特性

- 🔌 **多钱包支持**: UniSat、OKX、Xverse（以及更多）
- 🎯 **框架无关**: 可与任何JavaScript框架配合使用
- 🔄 **事件驱动**: 内置事件系统，支持实时状态更新
- 🛡️ **类型安全**: 完整的TypeScript支持和严格类型检查
- 📦 **轻量级**: 最小化包大小，支持Tree Shaking
- 🧪 **测试完备**: 全面的测试套件，100%覆盖率

## 安装

```bash
npm install @btc-connect/core
```

## 快速开始

```typescript
import { BTCWalletManager, createWalletManager } from '@btc-connect/core';

// 创建钱包管理器
const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('状态变化:', state),
  onError: (error) => console.error('钱包错误:', error)
});

// 初始化钱包适配器
manager.initializeAdapters();

// 获取可用钱包
const availableWallets = manager.getAvailableWallets();
console.log('可用钱包:', availableWallets);

// 连接钱包
try {
  const accounts = await manager.connect('unisat');
  console.log('已连接的账户:', accounts);
} catch (error) {
  console.error('连接失败:', error);
}
```

## 核心概念

### 钱包管理器

`BTCWalletManager` 是管理钱包连接和状态的核心组件。

```typescript
interface WalletManager {
  // 配置
  readonly config: WalletManagerConfig;

  // 适配器管理
  register(adapter: BTCWalletAdapter): void;
  unregister(walletId: string): void;
  getAdapter(walletId: string): BTCWalletAdapter | null;
  getAllAdapters(): BTCWalletAdapter[];
  getAvailableWallets(): WalletInfo[];

  // 连接管理
  connect(walletId: string): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;
  switchWallet(walletId: string): Promise<AccountInfo[]>;

  // 网络管理
  switchNetwork(network: string): Promise<void>;

  assumeConnected(walletId: string): Promise<AccountInfo[] | null>;

  // 状态管理
  getState(): WalletState;
  getCurrentAdapter(): BTCWalletAdapter | null;
  getCurrentWallet(): WalletInfo | null;

  // 事件处理
  on(event: WalletEvent, handler: EventHandler): void;
  off(event: WalletEvent, handler: EventHandler): void;
}
```

### 钱包适配器

钱包适配器实现 `BTCWalletAdapter` 接口来提供钱包特定的功能。

```typescript
interface BTCWalletAdapter {
  // 基本信息
  readonly id: string;
  readonly name: string;
  readonly icon: string;

  // 状态检查
  isReady(): boolean;
  getState(): WalletState;

  // 连接管理
  connect(): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;

  // 账户管理
  getAccounts(): Promise<AccountInfo[]>;
  getCurrentAccount(): Promise<AccountInfo | null>;

  // 网络管理
  getNetwork(): Promise<Network>;
  switchNetwork(network: Network): Promise<void>;

  // 事件
  on(event: WalletEvent, handler: EventHandler): void;
  off(event: WalletEvent, handler: EventHandler): void;

  // 比特币操作
  signMessage(message: string): Promise<string>;
  signPsbt(psbt: string): Promise<string>;
  sendBitcoin(toAddress: string, amount: number): Promise<string>;
}
```

### 状态管理

钱包状态表示当前的连接状态和账户信息。

```typescript
interface WalletState {
  status: ConnectionStatus; // 'disconnected' | 'connecting' | 'connected' | 'error'
  accounts: AccountInfo[];
  currentAccount?: AccountInfo;
  network?: Network; // 'livenet' | 'testnet' | 'regtest' | 'mainnet'
  error?: Error;
}

interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: number;
  network?: Network;
}
```

## API 参考

### 创建钱包管理器

```typescript
import { BTCWalletManager, createWalletManager } from '@btc-connect/core';

// 方法1: 直接实例化
const manager = new BTCWalletManager({
  onStateChange: (state) => {
    console.log('状态变化:', state.status);
  },
  onError: (error) => {
    console.error('钱包错误:', error);
  }
});

// 方法2: 工厂函数
const manager = createWalletManager({
  onStateChange: handleStateChange,
  onError: handleError
});
```

### 适配器管理

```typescript
// 注册自定义适配器
import { BaseWalletAdapter } from '@btc-connect/core';

class MyCustomAdapter extends BaseWalletAdapter {
  id = 'my-wallet';
  name = '我的自定义钱包';
  icon = 'https://example.com/icon.png';

  async connect(): Promise<AccountInfo[]> {
    // 实现连接逻辑
    return [{
      address: 'tb1qexample...',
      publicKey: '02abcdef...',
      balance: 100000,
      network: 'testnet'
    }];
  }

  // 实现其他必需方法...
}

// 注册适配器
manager.register(new MyCustomAdapter());

// 获取所有注册的适配器
const allAdapters = manager.getAllAdapters();

// 获取特定适配器
const adapter = manager.getAdapter('my-wallet');
```

### 连接管理

```typescript
// 获取可用钱包（已安装且就绪）
const availableWallets = manager.getAvailableWallets();
console.log('可用钱包:', availableWallets);
// 输出: [{ id: 'unisat', name: 'UniSat', icon: '...' }, ...]

// 连接钱包
try {
  const accounts = await manager.connect('unisat');
  console.log('已连接的账户:', accounts);

  // 获取当前状态
  const state = manager.getState();
  console.log('当前状态:', state);
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.log('钱包未安装');
  } else if (error instanceof WalletConnectionError) {
    console.log('连接失败:', error.message);
  }
}

// 切换到不同的钱包
const newAccounts = await manager.switchWallet('okx');

// 断开连接
await manager.disconnect();
```

### 网络切换

```typescript
// 切换网络 (v0.3.11+)
try {
  await manager.switchNetwork('testnet');
  console.log('已切换到测试网');
} catch (error) {
  console.error('网络切换失败:', error.message);
}

// 切换到主网
await manager.switchNetwork('mainnet');

// 切换到回归测试网
await manager.switchNetwork('regtest');

// 监听网络变化事件
manager.on('networkChange', ({ walletId, network }) => {
  console.log(`钱包 ${walletId} 切换到 ${network} 网络`);
});
```

### 事件处理

```typescript
// 监听连接事件
manager.on('connect', (accounts) => {
  console.log('钱包已连接:', accounts);
});

manager.on('disconnect', () => {
  console.log('钱包已断开连接');
});

manager.on('accountChange', (accounts) => {
  console.log('账户已更改:', accounts);
});

manager.on('networkChange', (network) => {
  console.log('网络已更改:', network);
});

manager.on('error', (error) => {
  console.error('钱包错误:', error);
});

// 移除事件监听器
const handler = (accounts) => console.log('已连接:', accounts);
manager.on('connect', handler);
manager.off('connect', handler);
```

### 比特币操作

```typescript
// 获取当前适配器
const adapter = manager.getCurrentAdapter();
if (!adapter) {
  console.log('没有连接的钱包');
  return;
}

// 签名消息
const message = 'Hello, Bitcoin!';
const signature = await adapter.signMessage(message);
console.log('消息签名:', signature);

// 签名PSBT
const psbtHex = '70736274ff...';
const signedPsbt = await adapter.signPsbt(psbtHex);
console.log('已签名的PSBT:', signedPsbt);

// 发送比特币
const txid = await adapter.sendBitcoin('tb1qrecipient...', 1000); // 1000聪
console.log('交易ID:', txid);
```

### 增强钱包检测

```typescript
import { detectAvailableWallets } from '@btc-connect/core';

// 增强的钱包检测，支持轮询检测延迟注入的钱包
const result = await detectAvailableWallets({
  timeout: 20000,        // 20秒超时
  interval: 300,         // 300ms检测间隔
  onProgress: (wallets, time) => {
    console.log(`检测到钱包: ${wallets.join(', ')} (${time}ms)`);
  }
});

console.log('检测结果:', {
  wallets: result.wallets,     // 检测到的钱包ID
  adapters: result.adapters,   // 可用的适配器实例
  elapsedTime: result.elapsedTime, // 总耗时
  isComplete: result.isComplete   // 是否完成检测
});
```

**检测配置参数:**
- `timeout?: number` - 检测超时时间（毫秒），默认20000
- `interval?: number` - 轮询间隔（毫秒），默认300
- `onProgress?: (detectedWallets: string[], elapsedTime: number) => void` - 进度回调

**检测结果:**
- `wallets: string[]` - 检测到的钱包ID列表
- `adapters: BTCWalletAdapter[]` - 可用的适配器实例
- `elapsedTime: number` - 总耗时
- `isComplete: boolean` - 是否完成检测

### 自动连接

```typescript
// 尝试恢复之前的连接
const previousWalletId = localStorage.getItem('last-connected-wallet');
if (previousWalletId) {
  try {
    const accounts = await manager.assumeConnected(previousWalletId);
    if (accounts && accounts.length > 0) {
      console.log('自动连接的账户:', accounts);
    }
  } catch (error) {
    console.log('自动连接失败:', error);
  }
}
```

## 支持的钱包

### UniSat

```typescript
// 连接到UniSat
const accounts = await manager.connect('unisat');

// UniSat特定功能
const unisatAdapter = manager.getAdapter('unisat');
if (unisatAdapter) {
  // UniSat可用
}
```

### OKX钱包

```typescript
// 连接到OKX
const accounts = await manager.connect('okx');

// OKX特定功能
const okxAdapter = manager.getAdapter('okx');
if (okxAdapter) {
  // OKX可用
}
```

## 缓存系统

缓存系统提供高效的内存缓存，支持 TTL（生存时间）和 LRU（最近最少使用）淘汰策略。

### MemoryCache

基础内存缓存，支持自动过期和大小限制。

**构造函数：**
```typescript
import { MemoryCache, createCache } from '@btc-connect/core';

// 创建缓存实例
const cache = new MemoryCache<string>({
  ttl: 60000,              // 默认 TTL：60秒
  maxSize: 100,            // 最多100个条目
  enableAutoCleanup: true, // 自动清理过期条目
  cleanupInterval: 30000   // 每30秒清理一次
});

// 或使用工厂函数
const cache = createCache<string>({ ttl: 30000 });
```

**核心方法：**
- `set(key: string, data: T, ttl?: number): void` - 存储缓存项
- `get(key: string): T | null` - 获取缓存项
- `has(key: string): boolean` - 检查是否存在且未过期
- `delete(key: string): boolean` - 删除缓存项
- `clear(): void` - 清空所有缓存
- `size(): number` - 获取缓存大小
- `keys(): string[]` - 获取所有缓存键
- `cleanup(): number` - 手动清理过期条目
- `getStats(): CacheStats` - 获取缓存统计信息
- `destroy(): void` - 销毁缓存实例

**使用示例：**
```typescript
// 存储余额数据
cache.set('balance:unisat:tb1q...', { confirmed: 100000, unconfirmed: 5000 });

// 获取数据（自动检查过期）
const balance = cache.get('balance:unisat:tb1q...');
if (balance) {
  console.log('余额:', balance);
}

// 检查存在性
if (cache.has('balance:unisat:tb1q...')) {
  console.log('缓存命中');
}

// 为特定条目设置自定义 TTL
cache.set('temp-data', 'value', 5000); // 5秒 TTL
```

### EnhancedMemoryCache

增强缓存，添加统计追踪、事件系统和批量操作。

**构造函数：**
```typescript
import { EnhancedMemoryCache } from '@btc-connect/core';

const cache = new EnhancedMemoryCache<UserData>({
  ttl: 60000,
  maxSize: 1000,
  trackStats: true,      // 启用统计
  trackEvents: true,     // 启用事件
  maxMemory: 50 * 1024 * 1024  // 50MB 内存限制
});
```

**额外方法：**
- `getMany(keys: string[]): Map<string, T>` - 批量获取
- `setMany(entries: Array<{key, value, ttl?}>): number` - 批量设置
- `deleteMany(keys: string[]): number` - 批量删除
- `find(predicate: (value, key) => boolean): Array<[string, T]>` - 条件查找
- `entries(): Array<[string, T]>` - 获取所有键值对
- `getStats(): CacheStats` - 获取详细统计
- `resetStats(): void` - 重置统计
- `getHitRatePercent(): number` - 获取命中率百分比
- `on(handler: CacheEventHandler): void` - 添加事件监听器
- `off(handler: CacheEventHandler): void` - 移除事件监听器

**统计信息：**
```typescript
const stats = cache.getStats();
console.log({
  size: stats.size,           // 当前缓存大小
  maxSize: stats.maxSize,     // 最大大小
  hits: stats.hits,           // 缓存命中次数
  misses: stats.misses,       // 缓存未命中次数
  hitRate: stats.hitRate,     // 命中率 (0-1)
  evictions: stats.evictions, // 淘汰次数
  memoryUsage: stats.memoryUsage, // 估算内存使用
  oldestEntry: stats.oldestEntry, // 最旧条目时间戳
  newestEntry: stats.newestEntry  // 最新条目时间戳
});
```

**事件系统：**
```typescript
// 监听缓存事件
cache.on((event) => {
  console.log(`缓存事件: ${event.type}`, event.key);
  // event.type: 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'clear'
});
```

### CacheManager

单例管理器，管理多个缓存实例。

**方法：**
- `getInstance(): CacheManager` - 获取单例实例
- `getCache<T>(name: string, options?: CacheOptions): MemoryCache<T>` - 获取或创建缓存
- `deleteCache(name: string): boolean` - 删除缓存实例
- `clearAll(): void` - 清空所有缓存
- `getAllStats(): Record<string, CacheStats>` - 获取所有缓存统计
- `cleanupAll(): number` - 清理所有过期条目
- `destroy(): void` - 销毁管理器

**使用示例：**
```typescript
import { getCacheManager } from '@btc-connect/core';

const manager = getCacheManager();

// 创建命名缓存
const balanceCache = manager.getCache('balance', { ttl: 10000 });
const accountCache = manager.getCache('accounts', { ttl: 30000 });

// 获取所有统计信息
const allStats = manager.getAllStats();
console.log(allStats.balance, allStats.accounts);

// 清理所有过期条目
const cleaned = manager.cleanupAll();
console.log(`已清理 ${cleaned} 个过期条目`);
```

### CacheKeyBuilder

缓存键生成工具类。

```typescript
import { CacheKeyBuilder } from '@btc-connect/core';

// 生成缓存键
const balanceKey = CacheKeyBuilder.balance('unisat', 'tb1q...');
const accountsKey = CacheKeyBuilder.accounts('unisat', 'livenet');
const networkKey = CacheKeyBuilder.network('unisat');
const txKey = CacheKeyBuilder.transaction('unisat', 'abc123');
const sigKey = CacheKeyBuilder.signature('unisat', 'msg-hash');
const stateKey = CacheKeyBuilder.walletState('unisat', 'tb1q...');
const inscriptionsKey = CacheKeyBuilder.inscriptions('unisat', 'tb1q...', 0);
```

### 缓存装饰器

方法装饰器，实现自动缓存。

**@cached - 基础缓存装饰器：**
```typescript
import { cached, CachePresets } from '@btc-connect/core';

class WalletService {
  @cached({
    cacheName: 'balance',
    ttl: 10000,
    keyBuilder: (walletId, address) => `balance:${walletId}:${address}`,
    shouldCache: (result) => result !== null,
    bypassCache: () => false // 始终使用缓存
  })
  async getBalance(walletId: string, address: string) {
    // 从钱包获取余额
    return await wallet.getBalance(address);
  }
}
```

**@smartCached - 动态 TTL 装饰器：**
```typescript
import { smartCached } from '@btc-connect/core';

class DataService {
  @smartCached({
    cacheName: 'data',
    successTtl: 60000,  // 成功结果 60秒
    errorTtl: 5000,     // 错误 5秒
    emptyTtl: 10000     // 空结果 10秒
  })
  async fetchData(id: string) {
    return await api.fetch(id);
  }
}
```

**@conditionalCached - 条件缓存装饰器：**
```typescript
import { conditionalCached } from '@btc-connect/core';

class QueryService {
  @conditionalCached(
    (forceRefresh) => !forceRefresh, // forceRefresh=true 时跳过缓存
    { cacheName: 'query', ttl: 30000 }
  )
  async query(forceRefresh = false) {
    return await db.query();
  }
}
```

**@invalidateCache - 缓存失效装饰器：**
```typescript
import { invalidateCache } from '@btc-connect/core';

class TransactionService {
  @invalidateCache(['balance', 'transactions'])
  async sendTransaction(to: string, amount: number) {
    // 交易后，余额和交易缓存被清除
    return await wallet.send(to, amount);
  }
}
```

### CachePresets

预配置的缓存选项，用于常见场景。

```typescript
import { CachePresets } from '@btc-connect/core';

// 可用预设
CachePresets.balance     // 10秒 TTL，用于余额数据
CachePresets.accounts    // 30秒 TTL，用于账户列表
CachePresets.network     // 60秒 TTL，用于网络信息
CachePresets.inscriptions // 60秒 TTL，用于铭文数据
CachePresets.chain       // 60秒 TTL，用于链信息
CachePresets.publicKey   // 30秒 TTL，用于公钥

// 配合装饰器使用
@cached(CachePresets.balance)
async getBalance(walletId: string, address: string) {
  // ...
}
```

## 批处理系统

批处理系统通过将多个请求合并为单个批次操作来优化性能。

### BatchScheduler

核心批调度器，支持可配置的时间和大小限制。

**构造函数：**
```typescript
import { BatchScheduler, createBatchScheduler } from '@btc-connect/core';

// 定义批处理器
const processor = async (requests) => {
  const results = new Map<string, Result>();
  // 批量处理所有请求
  for (const req of requests) {
    const result = await processItem(req.data);
    results.set(req.id, result);
  }
  return results;
};

// 创建调度器
const scheduler = new BatchScheduler(processor, {
  maxBatchSize: 100,      // 每批最多100项
  maxWaitTimeMS: 50,      // 处理前最大等待时间
  minBatchSize: 1,        // 触发处理的最小项数
  priorityThreshold: 10   // 立即处理的优先级阈值
});

// 或使用工厂函数
const scheduler = createBatchScheduler(processor, config);
```

**核心方法：**
- `submit(data: T, priority?: number): Promise<R>` - 提交请求到队列
- `flush(): Promise<void>` - 立即处理当前队列
- `clear(): void` - 清空队列并拒绝待处理请求
- `getQueueSize(): number` - 获取当前队列大小
- `getMetrics(): BatchMetrics` - 获取性能指标
- `resetMetrics(): void` - 重置指标
- `on(handler: BatchEventHandler): void` - 添加事件监听器
- `off(handler: BatchEventHandler): void` - 移除事件监听器
- `destroy(): void` - 销毁调度器

**使用示例：**
```typescript
// 提交请求
const promises = [
  scheduler.submit({ address: 'tb1q...' }, 0),  // 普通优先级
  scheduler.submit({ address: 'tb1q...' }, 10), // 高优先级
  scheduler.submit({ address: 'tb1q...' }, 5)   // 中等优先级
];

// 等待所有结果
const results = await Promise.all(promises);

// 强制立即处理
await scheduler.flush();

// 获取指标
const metrics = scheduler.getMetrics();
console.log({
  totalBatches: metrics.totalBatches,      // 总批次数
  totalRequests: metrics.totalRequests,    // 总请求数
  averageBatchSize: metrics.averageBatchSize, // 平均批次大小
  averageWaitTime: metrics.averageWaitTime,   // 平均等待时间
  successRate: metrics.successRate            // 成功率
});
```

**事件处理：**
```typescript
scheduler.on((event) => {
  switch (event.type) {
    case 'batchStart':
      console.log(`批次 ${event.batchId} 开始处理`);
      break;
    case 'batchComplete':
      console.log(`批次 ${event.batchId} 处理完成`);
      break;
    case 'batchError':
      console.error(`批次错误:`, event.error);
      break;
    case 'requestQueued':
      console.log(`请求 ${event.requestId} 已入队`);
      break;
  }
});
```

### createSimpleBatchScheduler

简化的批调度器，用于基于数组的处理。

```typescript
import { createSimpleBatchScheduler } from '@btc-connect/core';

// 创建简单调度器
const scheduler = createSimpleBatchScheduler<string, Balance>(
  async (addresses) => {
    // 处理地址数组，返回结果数组
    return await Promise.all(
      addresses.map(addr => fetchBalance(addr))
    );
  },
  { maxBatchSize: 50, maxWaitTimeMS: 100 }
);

// 提交请求
const balance1 = await scheduler.submit('tb1qabc...');
const balance2 = await scheduler.submit('tb1qdef...');
```

### 批处理类型

**BatchRequest：**
```typescript
interface BatchRequest<T = unknown> {
  id: string;          // 唯一请求 ID
  data: T;             // 请求数据
  priority: number;    // 优先级（越高越紧急）
  timestamp: number;   // 提交时间戳
}
```

**BatchSchedulerConfig：**
```typescript
interface BatchSchedulerConfig {
  maxBatchSize?: number;      // 每批最大项数（默认：100）
  maxWaitTimeMS?: number;     // 最大等待时间 ms（默认：50）
  minBatchSize?: number;      // 触发处理的最小项数（默认：1）
  priorityThreshold?: number; // 立即处理的优先级（默认：10）
}
```

**BatchMetrics：**
```typescript
interface BatchMetrics {
  totalBatches: number;      // 已处理批次总数
  totalRequests: number;     // 已处理请求总数
  averageBatchSize: number;  // 平均每批项数
  averageWaitTime: number;   // 平均处理时间（ms）
  successRate: number;       // 成功率（0-1）
}
```

### BatchDefaults

默认配置值。

```typescript
import { BatchDefaults } from '@btc-connect/core';

BatchDefaults.MAX_BATCH_SIZE       // 100
BatchDefaults.MAX_WAIT_TIME_MS     // 50
BatchDefaults.MIN_BATCH_SIZE       // 1
BatchDefaults.PRIORITY_THRESHOLD   // 10
```

## 错误处理

统一错误处理系统提供标准化的错误类型、错误码和恢复策略。

### UnifiedError

基础错误类，包含结构化错误信息。

**属性：**
- `code: ErrorCode` - 错误码标识符
- `severity: ErrorSeverity` - 错误严重级别
- `context: ErrorContext` - 额外的错误上下文
- `originalError?: Error` - 原始错误（如果被包装）
- `timestamp: number` - 错误发生时间戳

**方法：**
- `getFullMessage(): string` - 获取包含上下文的完整错误消息
- `toJSON(): object` - 序列化错误为 JSON
- `withRetryCount(count: number): UnifiedError` - 创建带重试计数的错误
- `canRetry(): boolean` - 检查错误是否可重试

**使用示例：**
```typescript
import { UnifiedError, ErrorCode, ErrorSeverity } from '@btc-connect/core';

try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof UnifiedError) {
    console.log('错误码:', error.code);
    console.log('严重级别:', error.severity);
    console.log('完整消息:', error.getFullMessage());
    console.log('可重试:', error.canRetry());
    
    // 访问上下文
    if (error.context.walletId) {
      console.log('钱包:', error.context.walletId);
    }
  }
}
```

### ErrorFactory

工厂方法，用于创建常见错误类型。

```typescript
import { ErrorFactory } from '@btc-connect/core';

// 钱包错误
const error1 = ErrorFactory.walletNotInstalled('unisat');
const error2 = ErrorFactory.walletNotConnected('okx');
const error3 = ErrorFactory.walletConnectionFailed('unisat', '用户拒绝');

// 网络错误
const error4 = ErrorFactory.networkError('livenet', '连接超时');
const error5 = ErrorFactory.networkUnsupported('regtest');

// 交易错误
const error6 = ErrorFactory.transactionFailed('手续费不足');
const error7 = ErrorFactory.transactionRejected('用户取消');
const error8 = ErrorFactory.insufficientBalance('1000', '500');

// 签名错误
const error9 = ErrorFactory.signatureFailed('无效消息');
const error10 = ErrorFactory.signatureRejected('用户拒绝');

// 通用错误
const error11 = ErrorFactory.unknownError('未知错误');
const error12 = ErrorFactory.invalidArgument('address', 'string', 'number');
const error13 = ErrorFactory.notImplemented('功能 XYZ');
const error14 = ErrorFactory.timeout('connect', 30000);
```

### ErrorCode 枚举

按类别分类的标准化错误码。

```typescript
import { ErrorCode } from '@btc-connect/core';

// 通用错误 (1xxx)
ErrorCode.UNKNOWN_ERROR        // '1000'
ErrorCode.INVALID_ARGUMENT     // '1001'
ErrorCode.NOT_IMPLEMENTED      // '1002'
ErrorCode.TIMEOUT              // '1003'

// 钱包错误 (2xxx)
ErrorCode.WALLET_NOT_INSTALLED    // '2000'
ErrorCode.WALLET_NOT_CONNECTED    // '2001'
ErrorCode.WALLET_CONNECTION_FAILED // '2002'
ErrorCode.WALLET_DISCONNECTED     // '2003'
ErrorCode.WALLET_LOCKED           // '2004'

// 网络错误 (3xxx)
ErrorCode.NETWORK_ERROR        // '3000'
ErrorCode.NETWORK_UNSUPPORTED  // '3001'
ErrorCode.NETWORK_SWITCH_FAILED // '3002'

// 交易错误 (4xxx)
ErrorCode.TRANSACTION_FAILED   // '4000'
ErrorCode.TRANSACTION_REJECTED // '4001'
ErrorCode.TRANSACTION_TIMEOUT  // '4002'
ErrorCode.INSUFFICIENT_BALANCE // '4003'
ErrorCode.INVALID_ADDRESS      // '4004'
ErrorCode.INVALID_AMOUNT       // '4005'

// 签名错误 (5xxx)
ErrorCode.SIGNATURE_FAILED    // '5000'
ErrorCode.SIGNATURE_REJECTED  // '5001'

// 配置错误 (6xxx)
ErrorCode.CONFIG_INVALID      // '6000'
ErrorCode.CONFIG_MISSING      // '6001'
```

### ErrorSeverity 枚举

用于优先级的错误严重级别。

```typescript
import { ErrorSeverity } from '@btc-connect/core';

ErrorSeverity.LOW       // 低级别，不影响核心功能
ErrorSeverity.MEDIUM    // 中级别，影响部分功能
ErrorSeverity.HIGH      // 高级别，影响核心功能
ErrorSeverity.CRITICAL  // 严重级别，系统无法运行
```

### ErrorContext 接口

错误的详细上下文信息。

```typescript
interface ErrorContext {
  // 钱包信息
  walletId?: string;
  walletName?: string;

  // 网络信息
  network?: string;
  chainId?: number;

  // 账户信息
  address?: string;
  publicKey?: string;

  // 交易信息
  txId?: string;
  txHash?: string;
  amount?: string;
  toAddress?: string;

  // 操作信息
  operation?: string;
  method?: string;
  params?: any;

  // 时间信息
  timestamp?: number;
  duration?: number;

  // 额外上下文
  metadata?: Record<string, any>;
  suggestion?: string;

  // 重试信息
  retryable?: boolean;
  retryCount?: number;
  maxRetries?: number;
}
```

**带上下文的使用：**
```typescript
const error = ErrorFactory.transactionFailed('手续费不足', {
  walletId: 'unisat',
  network: 'livenet',
  address: 'tb1q...',
  txId: 'abc123',
  amount: '10000',
  suggestion: '增加交易手续费',
  retryable: true,
  maxRetries: 3
});

console.log(error.getFullMessage());
// [4000] Transaction failed: 手续费不足 | Severity: high | Wallet: unisat | Network: livenet | Suggestion: 增加交易手续费
```

### 错误恢复模式

```typescript
import { UnifiedError, ErrorFactory } from '@btc-connect/core';

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: UnifiedError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof UnifiedError) {
        lastError = error.withRetryCount(attempt + 1);
        
        if (!error.canRetry()) {
          throw error;
        }
        
        // 重试前等待
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        throw error;
      }
    }
  }

  throw lastError || ErrorFactory.unknownError('超过最大重试次数');
}

// 使用示例
try {
  const result = await withRetry(() => manager.connect('unisat'));
} catch (error) {
  if (error instanceof UnifiedError) {
    console.log(`${error.context.retryCount} 次尝试后失败`);
  }
}
```

### 传统错误类型

为向后兼容，库也提供特定的错误类：

```typescript
import {
  WalletError,
  WalletNotInstalledError,
  WalletConnectionError,
  WalletDisconnectedError,
  NetworkError,
  TransactionError
} from '@btc-connect/core';

try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.log('请安装 UniSat 钱包');
  } else if (error instanceof WalletConnectionError) {
    console.log('连接失败:', error.message);
  } else if (error instanceof NetworkError) {
    console.log('网络错误:', error.message);
  }
}
```

## 高级用法

### 自定义适配器实现

```typescript
import { BaseWalletAdapter, WalletState, AccountInfo } from '@btc-connect/core';

class CustomWalletAdapter extends BaseWalletAdapter {
  id = 'custom-wallet';
  name = '自定义钱包';
  icon = 'https://example.com/icon.png';

  isReady(): boolean {
    // 检查钱包是否可用
    return typeof window !== 'undefined' && !!(window as any).customWallet;
  }

  getState(): WalletState {
    // 返回当前钱包状态
    return {
      status: 'disconnected',
      accounts: [],
      network: 'livenet'
    };
  }

  async connect(): Promise<AccountInfo[]> {
    if (!this.isReady()) {
      throw new WalletNotInstalledError(this.id);
    }

    try {
      // 连接到钱包
      const wallet = (window as any).customWallet;
      await wallet.connect();

      const accounts = await wallet.getAccounts();
      return accounts.map(account => ({
        address: account.address,
        publicKey: account.publicKey,
        balance: account.balance,
        network: account.network
      }));
    } catch (error) {
      throw new WalletConnectionError(`无法连接到${this.name}`);
    }
  }

  async disconnect(): Promise<void> {
    const wallet = (window as any).customWallet;
    if (wallet) {
      await wallet.disconnect();
    }
  }

  // 实现其他必需方法...
}

// 注册自定义适配器
manager.register(new CustomWalletAdapter());
```

### 状态持久化

```typescript
// 将钱包状态保存到localStorage
manager.on('connect', (accounts) => {
  localStorage.setItem('btc-connect-accounts', JSON.stringify(accounts));
  localStorage.setItem('btc-connect-wallet', manager.getCurrentWallet()?.id || '');
});

// 页面加载时恢复状态
const savedWalletId = localStorage.getItem('btc-connect-wallet');
if (savedWalletId) {
  manager.assumeConnected(savedWalletId);
}
```

## 最佳实践

1. **错误处理**: 始终将钱包操作包装在try-catch块中
2. **事件监听器**: 不再需要时清理事件监听器
3. **状态管理**: 使用事件来响应状态变化，而不是轮询
4. **网络检测**: 在操作前检查网络兼容性
5. **用户体验**: 为连接状态提供清晰的反馈

## 迁移指南

### 从版本0.1.x迁移到0.2.x

```typescript
// 旧方式（已弃用）
const manager = new WalletManager();

// 新方式
const manager = new BTCWalletManager({
  onStateChange: handleStateChange,
  onError: handleError
});
```

## 贡献

请阅读我们的[贡献指南](../../CONTRIBUTING.zh-CN.md)了解我们的行为准则和提交拉取请求的流程。

## 许可证

本项目采用MIT许可证 - 查看[LICENSE](../../LICENSE)文件了解详情。

## 支持

- 📧 邮箱: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [问题反馈](https://github.com/IceHugh/btc-connect/issues)