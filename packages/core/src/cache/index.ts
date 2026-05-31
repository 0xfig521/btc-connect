/**
 * Cache system entry point.
 * Exports all cache-related classes, interfaces, and utility functions.
 */

export {
  type CachedMethodOptions,
  CachePresets,
  cached,
  conditionalCached,
  invalidateCache,
  smartCached,
} from './cache-decorators';
export {
  type CacheItem,
  CacheKeyBuilder,
  CacheManager,
  type CacheOptions,
  MemoryCache,
} from './memory-cache';

// 增强缓存系统
export {
  EnhancedMemoryCache,
  CacheDefaults,
  type EnhancedCacheOptions,
  type CacheStats,
  type CacheEvent,
  type CacheEventHandler,
  type CacheEventType,
} from './enhanced-cache';

import { CacheManager, type CacheOptions, MemoryCache } from './memory-cache';

/**
 * Creates a new MemoryCache instance with the specified options.
 *
 * @template T - The type of cached values
 * @param options - Cache configuration options
 * @returns A new MemoryCache instance
 *
 * @example
 * ```typescript
 * import { createCache } from '@btc-connect/core';
 *
 * const cache = createCache<string>({ ttl: 30000 });
 * ```
 */
export function createCache<T>(options?: CacheOptions): MemoryCache<T> {
  return new MemoryCache<T>(options);
}

/**
 * Gets the global CacheManager singleton instance.
 *
 * @returns The CacheManager singleton
 *
 * @example
 * ```typescript
 * import { getCacheManager } from '@btc-connect/core';
 *
 * const manager = getCacheManager();
 * const balanceCache = manager.getCache('balance');
 * ```
 */
export function getCacheManager(): CacheManager {
  return CacheManager.getInstance();
}
