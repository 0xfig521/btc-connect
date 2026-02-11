// 类型定义

// 适配器
export {
  BaseWalletAdapter,
  createAdapter,
  detectAvailableWallets,
  getAllAdapters,
  getAvailableAdapters,
  getAvailableWalletsWithRetry,
  OKXAdapter,
  UniSatAdapter,
  type WalletDetectionConfig,
  type WalletDetectionResult,
  XverseAdapter,
} from './adapters';
// 缓存系统
export {
  CacheKeyBuilder,
  CacheManager,
  CachePresets,
  cached,
  conditionalCached,
  createCache,
  getCacheManager,
  invalidateCache,
  MemoryCache,
  smartCached,
  // 增强缓存系统
  EnhancedMemoryCache,
  type EnhancedCacheOptions,
  type CacheStats as EnhancedCacheStats,
  type CacheEvent,
  type CacheEventHandler,
  type CacheEventType,
  CacheDefaults as EnhancedCacheDefaults,
} from './cache';
// 事件系统
export { EventEmitter, WalletEventManager } from './events';

// 管理器
export { BTCWalletManager } from './managers';
export type * from './types';
export {
  createWalletManager,
  defaultWalletManager,
} from './utils';

// 错误处理
export {
  ErrorRecoveryStrategy,
  ErrorReporter,
  WalletErrorHandler,
} from './utils/error-handler';

// 统一错误处理系统
export {
  ErrorCode,
  ErrorSeverity,
  UnifiedError,
  ErrorFactory,
  type ErrorContext,
} from './errors';

// 批处理系统
export {
  BatchScheduler,
  createBatchScheduler,
  createSimpleBatchScheduler,
  BatchDefaults as BatchDefaults,
  type BatchRequest,
  type BatchProcessor,
  type BatchSchedulerConfig,
  type BatchMetrics,
  type BatchEvent,
  type BatchEventHandler,
  type BatchEventType,
} from './utils/batch';
