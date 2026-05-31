# @btc-connect/core

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <strong>Framework-agnostic Bitcoin wallet connection toolkit</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/core">
    <img src="https://img.shields.io/npm/v/@btc-connect/core.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/core">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/core.svg" alt="Bundle Size">
  </a>
</p>

## Overview

`@btc-connect/core` is a framework-agnostic Bitcoin wallet connection library that provides a unified interface for interacting with various Bitcoin wallets. It implements the adapter pattern to abstract away wallet-specific implementations, making it easy to switch between different wallet providers.

## Features

- 🔌 **Multi-Wallet Support**: UniSat, OKX, Xverse (and more to come)
- 🎯 **Framework Agnostic**: Works with any JavaScript framework
- 🔄 **Event-Driven**: Built-in event system for real-time state updates
- 🛡️ **Type Safe**: Full TypeScript support with strict typing
- 📦 **Lightweight**: Minimal bundle size with tree-shaking support
- 🧪 **Well Tested**: Comprehensive test suite with 100% coverage

## Installation

```bash
npm install @btc-connect/core
```

## Quick Start

```typescript
import { BTCWalletManager } from '@btc-connect/core';

// Create wallet manager
const manager = new BTCWalletManager({
  onStateChange: (state) => console.log('State changed:', state),
  onError: (error) => console.error('Wallet error:', error)
});

// Initialize and connect
manager.initializeAdapters();
const accounts = await manager.connect('unisat');
```

## Core Concepts

### BTCWalletManager
Central wallet management with connection control and state handling.

**Key Methods:**
- `connect(walletId: string)` - Connect to specific wallet
- `disconnect()` - Disconnect current wallet
- `switchWallet(walletId: string)` - Switch between wallets
- `getAvailableWallets()` - Get installed wallet list
- `getState()` - Get current wallet state
- `on(event, handler)` - Listen to wallet events

### BTCWalletAdapter
Wallet-specific implementations providing unified interface.

**Key Methods:**
- `connect()` - Establish wallet connection
- `disconnect()` - Close wallet connection
- `signMessage(message)` - Sign arbitrary message
- `signPsbt(psbt)` - Sign Partially Signed Bitcoin Transaction
- `sendBitcoin(address, amount)` - Send Bitcoin transaction

### State Management
Real-time wallet state with event-driven updates.

**Key Properties:**
- `status: ConnectionStatus` - Connection state
- `accounts: AccountInfo[]` - Connected accounts
- `network: Network` - Current network
- `error?: Error` - Error information

## API Reference

### BTCWalletManager

**Constructor Parameters:**
- `onStateChange?: (state: WalletState) => void` - State change callback
- `onError?: (error: Error) => void` - Error callback

**Key Methods:**
- `initializeAdapters()` - Initialize built-in wallet adapters
- `connect(walletId: string): Promise<AccountInfo[]>` - Connect to wallet
- `disconnect(): Promise<void>` - Disconnect current wallet
- `switchWallet(walletId: string): Promise<AccountInfo[]>` - Switch wallet
- `assumeConnected(walletId: string): Promise<AccountInfo[] | null>` - Restore connection
- `getAvailableWallets(): WalletInfo[]` - Get available wallets
- `getState(): WalletState` - Get current state
- `on(event: WalletEvent, handler: EventHandler): void` - Add event listener
- `off(event: WalletEvent, handler: EventHandler): void` - Remove event listener

### BTCWalletAdapter

**Properties:**
- `id: string` - Unique wallet identifier
- `name: string` - Display name
- `icon: string` - Icon URL

**Methods:**
- `isReady(): boolean` - Check if wallet is available
- `connect(): Promise<AccountInfo[]>` - Connect to wallet
- `disconnect(): Promise<void>` - Disconnect from wallet
- `signMessage(message: string): Promise<string>` - Sign message
- `signPsbt(psbt: string): Promise<string>` - Sign PSBT
- `sendBitcoin(toAddress: string, amount: number): Promise<string>` - Send BTC

### Wallet Detection

**Enhanced Detection:**
```typescript
import { detectAvailableWallets } from '@btc-connect/core';

const result = await detectAvailableWallets({
  timeout: 20000,
  interval: 300
});
```

**Parameters:**
- `timeout?: number` - Detection timeout (ms)
- `interval?: number` - Poll interval (ms)
- `onProgress?: (wallets: string[], time: number) => void` - Progress callback

**Returns:**
- `wallets: string[]` - Detected wallet IDs
- `adapters: BTCWalletAdapter[]` - Available adapters
- `elapsedTime: number` - Detection duration
- `isComplete: boolean` - Detection completion status

## Supported Wallets

### UniSat
- **ID**: `unisat`
- **Network**: Mainnet, Testnet
- **Status**: ✅ Active

### OKX Wallet
- **ID**: `okx`
- **Network**: Mainnet, Testnet
- **Status**: ✅ Active

### Xverse
- **ID**: `xverse`
- **Network**: Mainnet, Testnet
- **Status**: 🚧 In Development

## Cache System

The cache system provides efficient in-memory caching with TTL (Time-To-Live) and LRU (Least Recently Used) eviction strategies.

### MemoryCache

Basic in-memory cache with automatic expiration and size limits.

**Constructor:**
```typescript
import { MemoryCache, createCache } from '@btc-connect/core';

// Create cache with options
const cache = new MemoryCache<string>({
  ttl: 60000,              // Default TTL: 60 seconds
  maxSize: 100,            // Maximum 100 items
  enableAutoCleanup: true, // Auto cleanup expired items
  cleanupInterval: 30000   // Cleanup every 30 seconds
});

// Or use factory function
const cache = createCache<string>({ ttl: 30000 });
```

**Key Methods:**
- `set(key: string, data: T, ttl?: number): void` - Store item in cache
- `get(key: string): T | null` - Retrieve item from cache
- `has(key: string): boolean` - Check if item exists and not expired
- `delete(key: string): boolean` - Remove item from cache
- `clear(): void` - Clear all items
- `size(): number` - Get current cache size
- `keys(): string[]` - Get all cache keys
- `cleanup(): number` - Manually cleanup expired items
- `getStats(): CacheStats` - Get cache statistics
- `destroy(): void` - Destroy cache instance

**Usage Example:**
```typescript
// Store balance data
cache.set('balance:unisat:tb1q...', { confirmed: 100000, unconfirmed: 5000 });

// Retrieve with automatic expiration check
const balance = cache.get('balance:unisat:tb1q...');
if (balance) {
  console.log('Balance:', balance);
}

// Check existence
if (cache.has('balance:unisat:tb1q...')) {
  console.log('Cache hit');
}

// Custom TTL for specific item
cache.set('temp-data', 'value', 5000); // 5 seconds TTL
```

### EnhancedMemoryCache

Extended cache with statistics tracking, event system, and batch operations.

**Constructor:**
```typescript
import { EnhancedMemoryCache } from '@btc-connect/core';

const cache = new EnhancedMemoryCache<UserData>({
  ttl: 60000,
  maxSize: 1000,
  trackStats: true,      // Enable statistics
  trackEvents: true,     // Enable events
  maxMemory: 50 * 1024 * 1024  // 50MB memory limit
});
```

**Additional Methods:**
- `getMany(keys: string[]): Map<string, T>` - Batch get multiple items
- `setMany(entries: Array<{key, value, ttl?}>): number` - Batch set items
- `deleteMany(keys: string[]): number` - Batch delete items
- `find(predicate: (value, key) => boolean): Array<[string, T]>` - Find items by condition
- `entries(): Array<[string, T]>` - Get all key-value pairs
- `getStats(): CacheStats` - Get detailed statistics
- `resetStats(): void` - Reset statistics
- `getHitRatePercent(): number` - Get hit rate percentage
- `on(handler: CacheEventHandler): void` - Add event listener
- `off(handler: CacheEventHandler): void` - Remove event listener

**Statistics:**
```typescript
const stats = cache.getStats();
console.log({
  size: stats.size,           // Current cache size
  maxSize: stats.maxSize,     // Maximum size
  hits: stats.hits,           // Number of cache hits
  misses: stats.misses,       // Number of cache misses
  hitRate: stats.hitRate,     // Hit rate (0-1)
  evictions: stats.evictions, // Number of evictions
  memoryUsage: stats.memoryUsage, // Estimated memory usage
  oldestEntry: stats.oldestEntry, // Oldest entry timestamp
  newestEntry: stats.newestEntry  // Newest entry timestamp
});
```

**Event System:**
```typescript
// Listen to cache events
cache.on((event) => {
  console.log(`Cache event: ${event.type}`, event.key);
  // event.type: 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'clear'
});
```

### CacheManager

Singleton manager for multiple cache instances.

**Methods:**
- `getInstance(): CacheManager` - Get singleton instance
- `getCache<T>(name: string, options?: CacheOptions): MemoryCache<T>` - Get or create cache
- `deleteCache(name: string): boolean` - Delete cache instance
- `clearAll(): void` - Clear all caches
- `getAllStats(): Record<string, CacheStats>` - Get all cache statistics
- `cleanupAll(): number` - Cleanup all expired items
- `destroy(): void` - Destroy manager

**Usage:**
```typescript
import { getCacheManager } from '@btc-connect/core';

const manager = getCacheManager();

// Create named caches
const balanceCache = manager.getCache('balance', { ttl: 10000 });
const accountCache = manager.getCache('accounts', { ttl: 30000 });

// Get all statistics
const allStats = manager.getAllStats();
console.log(allStats.balance, allStats.accounts);

// Cleanup all expired items
const cleaned = manager.cleanupAll();
console.log(`Cleaned ${cleaned} expired items`);
```

### CacheKeyBuilder

Utility class for generating consistent cache keys.

```typescript
import { CacheKeyBuilder } from '@btc-connect/core';

// Generate cache keys
const balanceKey = CacheKeyBuilder.balance('unisat', 'tb1q...');
const accountsKey = CacheKeyBuilder.accounts('unisat', 'livenet');
const networkKey = CacheKeyBuilder.network('unisat');
const txKey = CacheKeyBuilder.transaction('unisat', 'abc123');
const sigKey = CacheKeyBuilder.signature('unisat', 'msg-hash');
const stateKey = CacheKeyBuilder.walletState('unisat', 'tb1q...');
const inscriptionsKey = CacheKeyBuilder.inscriptions('unisat', 'tb1q...', 0);
```

### Cache Decorators

Method decorators for automatic caching.

**@cached - Basic Cache Decorator:**
```typescript
import { cached, CachePresets } from '@btc-connect/core';

class WalletService {
  @cached({
    cacheName: 'balance',
    ttl: 10000,
    keyBuilder: (walletId, address) => `balance:${walletId}:${address}`,
    shouldCache: (result) => result !== null,
    bypassCache: () => false // Always use cache
  })
  async getBalance(walletId: string, address: string) {
    // Fetch balance from wallet
    return await wallet.getBalance(address);
  }
}
```

**@smartCached - Dynamic TTL Decorator:**
```typescript
import { smartCached } from '@btc-connect/core';

class DataService {
  @smartCached({
    cacheName: 'data',
    successTtl: 60000,  // 60s for successful results
    errorTtl: 5000,     // 5s for errors
    emptyTtl: 10000     // 10s for empty results
  })
  async fetchData(id: string) {
    return await api.fetch(id);
  }
}
```

**@conditionalCached - Conditional Cache Decorator:**
```typescript
import { conditionalCached } from '@btc-connect/core';

class QueryService {
  @conditionalCached(
    (forceRefresh) => !forceRefresh, // Skip cache if forceRefresh=true
    { cacheName: 'query', ttl: 30000 }
  )
  async query(forceRefresh = false) {
    return await db.query();
  }
}
```

**@invalidateCache - Cache Invalidation Decorator:**
```typescript
import { invalidateCache } from '@btc-connect/core';

class TransactionService {
  @invalidateCache(['balance', 'transactions'])
  async sendTransaction(to: string, amount: number) {
    // After transaction, balance and transaction caches are cleared
    return await wallet.send(to, amount);
  }
}
```

### CachePresets

Pre-configured cache options for common use cases.

```typescript
import { CachePresets } from '@btc-connect/core';

// Available presets
CachePresets.balance     // 10s TTL, for balance data
CachePresets.accounts    // 30s TTL, for account lists
CachePresets.network     // 60s TTL, for network info
CachePresets.inscriptions // 60s TTL, for inscription data
CachePresets.chain       // 60s TTL, for chain info
CachePresets.publicKey   // 30s TTL, for public keys

// Use with decorator
@cached(CachePresets.balance)
async getBalance(walletId: string, address: string) {
  // ...
}
```

## Batch Processing

The batch processing system optimizes multiple requests by combining them into single batch operations.

### BatchScheduler

Core scheduler for batching requests with configurable timing and size limits.

**Constructor:**
```typescript
import { BatchScheduler, createBatchScheduler } from '@btc-connect/core';

// Define batch processor
const processor = async (requests) => {
  const results = new Map<string, Result>();
  // Process all requests in batch
  for (const req of requests) {
    const result = await processItem(req.data);
    results.set(req.id, result);
  }
  return results;
};

// Create scheduler
const scheduler = new BatchScheduler(processor, {
  maxBatchSize: 100,      // Maximum items per batch
  maxWaitTimeMS: 50,      // Maximum wait time before processing
  minBatchSize: 1,        // Minimum items to trigger processing
  priorityThreshold: 10   // Priority level for immediate processing
});

// Or use factory function
const scheduler = createBatchScheduler(processor, config);
```

**Key Methods:**
- `submit(data: T, priority?: number): Promise<R>` - Submit request to queue
- `flush(): Promise<void>` - Immediately process current queue
- `clear(): void` - Clear queue and reject pending requests
- `getQueueSize(): number` - Get current queue size
- `getMetrics(): BatchMetrics` - Get performance metrics
- `resetMetrics(): void` - Reset metrics
- `on(handler: BatchEventHandler): void` - Add event listener
- `off(handler: BatchEventHandler): void` - Remove event listener
- `destroy(): void` - Destroy scheduler

**Usage Example:**
```typescript
// Submit requests
const promises = [
  scheduler.submit({ address: 'tb1q...' }, 0),  // Normal priority
  scheduler.submit({ address: 'tb1q...' }, 10), // High priority
  scheduler.submit({ address: 'tb1q...' }, 5)   // Medium priority
];

// Wait for all results
const results = await Promise.all(promises);

// Force immediate processing
await scheduler.flush();

// Get metrics
const metrics = scheduler.getMetrics();
console.log({
  totalBatches: metrics.totalBatches,
  totalRequests: metrics.totalRequests,
  averageBatchSize: metrics.averageBatchSize,
  averageWaitTime: metrics.averageWaitTime,
  successRate: metrics.successRate
});
```

**Event Handling:**
```typescript
scheduler.on((event) => {
  switch (event.type) {
    case 'batchStart':
      console.log(`Batch ${event.batchId} started`);
      break;
    case 'batchComplete':
      console.log(`Batch ${event.batchId} completed`);
      break;
    case 'batchError':
      console.error(`Batch error:`, event.error);
      break;
    case 'requestQueued':
      console.log(`Request ${event.requestId} queued`);
      break;
  }
});
```

### createSimpleBatchScheduler

Simplified batch scheduler for array-based processing.

```typescript
import { createSimpleBatchScheduler } from '@btc-connect/core';

// Create simple scheduler
const scheduler = createSimpleBatchScheduler<string, Balance>(
  async (addresses) => {
    // Process array of addresses, return array of results
    return await Promise.all(
      addresses.map(addr => fetchBalance(addr))
    );
  },
  { maxBatchSize: 50, maxWaitTimeMS: 100 }
);

// Submit requests
const balance1 = await scheduler.submit('tb1qabc...');
const balance2 = await scheduler.submit('tb1qdef...');
```

### Batch Types

**BatchRequest:**
```typescript
interface BatchRequest<T = unknown> {
  id: string;          // Unique request ID
  data: T;             // Request data
  priority: number;    // Priority level (higher = more urgent)
  timestamp: number;   // Submission timestamp
}
```

**BatchSchedulerConfig:**
```typescript
interface BatchSchedulerConfig {
  maxBatchSize?: number;      // Max items per batch (default: 100)
  maxWaitTimeMS?: number;     // Max wait time in ms (default: 50)
  minBatchSize?: number;      // Min items to trigger (default: 1)
  priorityThreshold?: number; // Priority for immediate processing (default: 10)
}
```

**BatchMetrics:**
```typescript
interface BatchMetrics {
  totalBatches: number;      // Total batches processed
  totalRequests: number;     // Total requests handled
  averageBatchSize: number;  // Average items per batch
  averageWaitTime: number;   // Average processing time (ms)
  successRate: number;       // Success rate (0-1)
}
```

### BatchDefaults

Default configuration values.

```typescript
import { BatchDefaults } from '@btc-connect/core';

BatchDefaults.MAX_BATCH_SIZE       // 100
BatchDefaults.MAX_WAIT_TIME_MS     // 50
BatchDefaults.MIN_BATCH_SIZE       // 1
BatchDefaults.PRIORITY_THRESHOLD   // 10
```

## Error Handling

The unified error handling system provides standardized error types, error codes, and recovery strategies.

### UnifiedError

Base error class with structured error information.

**Properties:**
- `code: ErrorCode` - Error code identifier
- `severity: ErrorSeverity` - Error severity level
- `context: ErrorContext` - Additional error context
- `originalError?: Error` - Original error if wrapped
- `timestamp: number` - Error occurrence timestamp

**Methods:**
- `getFullMessage(): string` - Get complete error message with context
- `toJSON(): object` - Serialize error to JSON
- `withRetryCount(count: number): UnifiedError` - Create error with retry count
- `canRetry(): boolean` - Check if error is retryable

**Usage:**
```typescript
import { UnifiedError, ErrorCode, ErrorSeverity } from '@btc-connect/core';

try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof UnifiedError) {
    console.log('Error code:', error.code);
    console.log('Severity:', error.severity);
    console.log('Full message:', error.getFullMessage());
    console.log('Can retry:', error.canRetry());
    
    // Access context
    if (error.context.walletId) {
      console.log('Wallet:', error.context.walletId);
    }
  }
}
```

### ErrorFactory

Factory methods for creating common error types.

```typescript
import { ErrorFactory } from '@btc-connect/core';

// Wallet errors
const error1 = ErrorFactory.walletNotInstalled('unisat');
const error2 = ErrorFactory.walletNotConnected('okx');
const error3 = ErrorFactory.walletConnectionFailed('unisat', 'User rejected');

// Network errors
const error4 = ErrorFactory.networkError('livenet', 'Connection timeout');
const error5 = ErrorFactory.networkUnsupported('regtest');

// Transaction errors
const error6 = ErrorFactory.transactionFailed('Insufficient fee');
const error7 = ErrorFactory.transactionRejected('User cancelled');
const error8 = ErrorFactory.insufficientBalance('1000', '500');

// Signature errors
const error9 = ErrorFactory.signatureFailed('Invalid message');
const error10 = ErrorFactory.signatureRejected('User denied');

// General errors
const error11 = ErrorFactory.unknownError('Unexpected error');
const error12 = ErrorFactory.invalidArgument('address', 'string', 'number');
const error13 = ErrorFactory.notImplemented('Feature XYZ');
const error14 = ErrorFactory.timeout('connect', 30000);
```

### ErrorCode Enumeration

Standardized error codes by category.

```typescript
import { ErrorCode } from '@btc-connect/core';

// General errors (1xxx)
ErrorCode.UNKNOWN_ERROR        // '1000'
ErrorCode.INVALID_ARGUMENT     // '1001'
ErrorCode.NOT_IMPLEMENTED      // '1002'
ErrorCode.TIMEOUT              // '1003'

// Wallet errors (2xxx)
ErrorCode.WALLET_NOT_INSTALLED    // '2000'
ErrorCode.WALLET_NOT_CONNECTED    // '2001'
ErrorCode.WALLET_CONNECTION_FAILED // '2002'
ErrorCode.WALLET_DISCONNECTED     // '2003'
ErrorCode.WALLET_LOCKED           // '2004'

// Network errors (3xxx)
ErrorCode.NETWORK_ERROR        // '3000'
ErrorCode.NETWORK_UNSUPPORTED  // '3001'
ErrorCode.NETWORK_SWITCH_FAILED // '3002'

// Transaction errors (4xxx)
ErrorCode.TRANSACTION_FAILED   // '4000'
ErrorCode.TRANSACTION_REJECTED // '4001'
ErrorCode.TRANSACTION_TIMEOUT  // '4002'
ErrorCode.INSUFFICIENT_BALANCE // '4003'
ErrorCode.INVALID_ADDRESS      // '4004'
ErrorCode.INVALID_AMOUNT       // '4005'

// Signature errors (5xxx)
ErrorCode.SIGNATURE_FAILED    // '5000'
ErrorCode.SIGNATURE_REJECTED  // '5001'

// Configuration errors (6xxx)
ErrorCode.CONFIG_INVALID      // '6000'
ErrorCode.CONFIG_MISSING      // '6001'
```

### ErrorSeverity Enumeration

Error severity levels for prioritization.

```typescript
import { ErrorSeverity } from '@btc-connect/core';

ErrorSeverity.LOW       // Low impact, doesn't affect core functionality
ErrorSeverity.MEDIUM    // Medium impact, affects some features
ErrorSeverity.HIGH      // High impact, affects core functionality
ErrorSeverity.CRITICAL  // Critical, system cannot operate
```

### ErrorContext Interface

Detailed context information for errors.

```typescript
interface ErrorContext {
  // Wallet information
  walletId?: string;
  walletName?: string;

  // Network information
  network?: string;
  chainId?: number;

  // Account information
  address?: string;
  publicKey?: string;

  // Transaction information
  txId?: string;
  txHash?: string;
  amount?: string;
  toAddress?: string;

  // Operation information
  operation?: string;
  method?: string;
  params?: any;

  // Timing
  timestamp?: number;
  duration?: number;

  // Additional context
  metadata?: Record<string, any>;
  suggestion?: string;

  // Retry information
  retryable?: boolean;
  retryCount?: number;
  maxRetries?: number;
}
```

**Usage with Context:**
```typescript
const error = ErrorFactory.transactionFailed('Insufficient fee', {
  walletId: 'unisat',
  network: 'livenet',
  address: 'tb1q...',
  txId: 'abc123',
  amount: '10000',
  suggestion: 'Increase transaction fee',
  retryable: true,
  maxRetries: 3
});

console.log(error.getFullMessage());
// [4000] Transaction failed: Insufficient fee | Severity: high | Wallet: unisat | Network: livenet | Suggestion: Increase transaction fee
```

### Error Recovery Pattern

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
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        throw error;
      }
    }
  }

  throw lastError || ErrorFactory.unknownError('Max retries exceeded');
}

// Usage
try {
  const result = await withRetry(() => manager.connect('unisat'));
} catch (error) {
  if (error instanceof UnifiedError) {
    console.log(`Failed after ${error.context.retryCount} attempts`);
  }
}
```

### Legacy Error Types

For backward compatibility, the library also provides specific error classes:

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
    console.log('Please install UniSat wallet');
  } else if (error instanceof WalletConnectionError) {
    console.log('Connection failed:', error.message);
  } else if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
  }
}
```

## Best Practices

1. Always wrap wallet operations in try-catch blocks
2. Clean up event listeners when no longer needed
3. Use events to react to state changes
4. Check network compatibility before operations
5. Provide clear feedback for connection states

## Type Definitions

**Core Types:**
- `Network`: `'livenet' | 'testnet' | 'regtest' | 'mainnet'`
- `ConnectionStatus`: `'disconnected' | 'connecting' | 'connected' | 'error'`
- `AccountInfo`: `{ address: string; publicKey?: string; balance?: number; network?: Network }`
- `WalletInfo`: `{ id: string; name: string; icon: string }`
- `WalletState`: `{ status: ConnectionStatus; accounts: AccountInfo[]; currentAccount?: AccountInfo; network?: Network; error?: Error }`

## Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

- 📧 Email: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [Issues](https://github.com/IceHugh/btc-connect/issues)