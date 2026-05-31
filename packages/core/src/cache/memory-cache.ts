/**
 * In-memory cache system with TTL (Time-To-Live) and LRU (Least Recently Used) eviction.
 * Provides efficient caching for wallet data with automatic expiration.
 *
 * @example
 * ```typescript
 * import { MemoryCache, createCache } from '@btc-connect/core';
 *
 * // Create cache with options
 * const cache = new MemoryCache<string>({
 *   ttl: 60000,              // 60 seconds default TTL
 *   maxSize: 100,            // Maximum 100 items
 *   enableAutoCleanup: true, // Auto cleanup expired items
 *   cleanupInterval: 30000   // Cleanup every 30 seconds
 * });
 *
 * // Or use factory function
 * const cache = createCache<string>({ ttl: 30000 });
 *
 * // Store data
 * cache.set('balance:unisat:tb1q...', { total: 100000 });
 *
 * // Retrieve data
 * const balance = cache.get('balance:unisat:tb1q...');
 *
 * // Check existence
 * if (cache.has('balance:unisat:tb1q...')) {
 *   console.log('Cache hit');
 * }
 * ```
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  enableAutoCleanup?: boolean;
  cleanupInterval?: number;
}

/**
 * In-memory cache with TTL expiration and LRU eviction.
 *
 * @template T - The type of cached values
 *
 * @example
 * ```typescript
 * const cache = new MemoryCache<UserData>({
 *   ttl: 60000,
 *   maxSize: 100
 * });
 * ```
 */
export class MemoryCache<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private maxSize: number;
  private defaultTtl: number;
  private cleanupTimer?: NodeJS.Timeout;
  private accessOrder: string[] = []; // LRU访问顺序记录

  /**
   * Creates a new MemoryCache instance.
   *
   * @param options - Cache configuration options
   * @param options.ttl - Default time-to-live in milliseconds (default: 60000)
   * @param options.maxSize - Maximum number of items (default: 100)
   * @param options.enableAutoCleanup - Enable automatic cleanup of expired items (default: true)
   * @param options.cleanupInterval - Cleanup interval in milliseconds (default: 30000)
   */
  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTtl = options.ttl || 60000; // 默认60秒

    // 启动自动清理过期缓存
    if (options.enableAutoCleanup !== false) {
      this.startAutoCleanup(options.cleanupInterval || 30000); // 默认30秒清理一次
    }
  }

  /**
   * Stores a value in the cache.
   *
   * @param key - The cache key
   * @param data - The value to cache
   * @param ttl - Optional TTL override in milliseconds
   *
   * @example
   * ```typescript
   * cache.set('user:123', { name: 'Alice' });
   * cache.set('temp', 'value', 5000); // 5 second TTL
   * ```
   */
  set(key: string, data: T, ttl?: number): void {
    const effectiveTtl = ttl || this.defaultTtl;
    const now = Date.now();

    // 如果缓存已满，执行LRU淘汰
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: effectiveTtl,
      key,
    };

    this.cache.set(key, cacheItem);
    this.updateAccessOrder(key);
  }

  /**
   * Retrieves a value from the cache.
   * Returns null if the key doesn't exist or has expired.
   *
   * @param key - The cache key
   * @returns The cached value, or null if not found/expired
   *
   * @example
   * ```typescript
   * const user = cache.get('user:123');
   * if (user) {
   *   console.log('Found:', user.name);
   * }
   * ```
   */
  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // 更新访问顺序
    this.updateAccessOrder(key);

    return item.data;
  }

  /**
   * Checks if a key exists and hasn't expired.
   *
   * @param key - The cache key to check
   * @returns True if the key exists and is valid
   *
   * @example
   * ```typescript
   * if (cache.has('user:123')) {
   *   // Key exists and is not expired
   * }
   * ```
   */
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }

    return true;
  }

  /**
   * Removes a key from the cache.
   *
   * @param key - The cache key to remove
   * @returns True if the key was removed
   *
   * @example
   * ```typescript
   * cache.delete('user:123');
   * ```
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }

  /**
   * Removes all items from the cache.
   *
   * @example
   * ```typescript
   * cache.clear();
   * ```
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Gets the current number of items in the cache.
   *
   * @returns The cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Gets all cache keys.
   *
   * @returns Array of all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Manually triggers cleanup of expired items.
   *
   * @returns Number of items removed
   *
   * @example
   * ```typescript
   * const removed = cache.cleanup();
   * console.log(`Removed ${removed} expired items`);
   * ```
   */
  cleanup(): number {
    const _now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    });

    return expiredKeys.length;
  }

  /**
   * Gets cache statistics.
   *
   * @returns Object containing size and maxSize
   *
   * @example
   * ```typescript
   * const stats = cache.getStats();
   * console.log(`${stats.size}/${stats.maxSize} items`);
   * ```
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
    memoryUsage?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Destroys the cache and stops automatic cleanup.
   *
   * @example
   * ```typescript
   * cache.destroy();
   * ```
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * 淘汰最近最少使用的缓存项
   */
  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder[0];
      this.cache.delete(lruKey);
      this.accessOrder.shift();
    }
  }

  /**
   * 更新访问顺序
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * 从访问顺序中移除键
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * 启动自动清理过期缓存
   */
  private startAutoCleanup(interval: number): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, interval);
  }
}

/**
 * Singleton manager for multiple cache instances.
 * Provides centralized management of named caches.
 *
 * @example
 * ```typescript
 * import { getCacheManager } from '@btc-connect/core';
 *
 * const manager = getCacheManager();
 *
 * // Create named caches
 * const balanceCache = manager.getCache('balance', { ttl: 10000 });
 * const accountCache = manager.getCache('accounts', { ttl: 30000 });
 *
 * // Get all statistics
 * const allStats = manager.getAllStats();
 *
 * // Cleanup all expired items
 * const cleaned = manager.cleanupAll();
 * ```
 */
export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, MemoryCache> = new Map();

  private constructor() {}

  /**
   * Gets the singleton instance of CacheManager.
   *
   * @returns The CacheManager singleton
   *
   * @example
   * ```typescript
   * const manager = CacheManager.getInstance();
   * ```
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Gets or creates a named cache instance.
   *
   * @template T - The type of cached values
   * @param name - The cache name
   * @param options - Cache options (only used when creating new cache)
   * @returns The cache instance
   *
   * @example
   * ```typescript
   * const balanceCache = manager.getCache<Balance>('balance', { ttl: 10000 });
   * ```
   */
  getCache<T>(name: string, options?: CacheOptions): MemoryCache<T> {
    let cache = this.caches.get(name);

    if (!cache) {
      cache = new MemoryCache<T>(options);
      this.caches.set(name, cache);
    }

    return cache as MemoryCache<T>;
  }

  /**
   * Deletes a named cache instance.
   *
   * @param name - The cache name to delete
   * @returns True if the cache was deleted
   *
   * @example
   * ```typescript
   * manager.deleteCache('balance');
   * ```
   */
  deleteCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.destroy();
      return this.caches.delete(name);
    }
    return false;
  }

  /**
   * Clears and destroys all cache instances.
   *
   * @example
   * ```typescript
   * manager.clearAll();
   * ```
   */
  clearAll(): void {
    for (const [_name, cache] of this.caches.entries()) {
      cache.destroy();
    }
    this.caches.clear();
  }

  /**
   * Gets statistics for all caches.
   *
   * @returns Object mapping cache names to their statistics
   *
   * @example
   * ```typescript
   * const stats = manager.getAllStats();
   * console.log(stats.balance, stats.accounts);
   * ```
   */
  getAllStats(): Record<string, { size: number; maxSize: number }> {
    const stats: Record<string, { size: number; maxSize: number }> = {};

    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }

    return stats;
  }

  /**
   * Triggers cleanup on all cache instances.
   *
   * @returns Total number of items removed across all caches
   *
   * @example
   * ```typescript
   * const totalRemoved = manager.cleanupAll();
   * ```
   */
  cleanupAll(): number {
    let totalCleaned = 0;

    for (const cache of this.caches.values()) {
      totalCleaned += cache.cleanup();
    }

    return totalCleaned;
  }

  /**
   * Destroys the manager and all caches.
   *
   * @example
   * ```typescript
   * manager.destroy();
   * ```
   */
  destroy(): void {
    this.clearAll();
  }
}

/**
 * Utility class for generating consistent cache keys.
 * Provides factory methods for common cache key patterns.
 *
 * @example
 * ```typescript
 * import { CacheKeyBuilder } from '@btc-connect/core';
 *
 * const balanceKey = CacheKeyBuilder.balance('unisat', 'tb1q...');
 * const accountsKey = CacheKeyBuilder.accounts('unisat', 'livenet');
 * const networkKey = CacheKeyBuilder.network('unisat');
 * const txKey = CacheKeyBuilder.transaction('unisat', 'abc123');
 * const sigKey = CacheKeyBuilder.signature('unisat', 'msg-hash');
 * const stateKey = CacheKeyBuilder.walletState('unisat', 'tb1q...');
 * const inscriptionsKey = CacheKeyBuilder.inscriptions('unisat', 'tb1q...', 0);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CacheKeyBuilder {
  /**
   * Generates a balance cache key.
   *
   * @param walletId - The wallet identifier
   * @param address - The Bitcoin address
   * @returns The cache key string
   */
  static balance(walletId: string, address: string): string {
    return `balance:${walletId}:${address}`;
  }

  /**
   * Generates an accounts cache key.
   *
   * @param walletId - The wallet identifier
   * @param network - The network name
   * @returns The cache key string
   */
  static accounts(walletId: string, network: string): string {
    return `accounts:${walletId}:${network}`;
  }

  /**
   * Generates a network cache key.
   *
   * @param walletId - The wallet identifier
   * @returns The cache key string
   */
  static network(walletId: string): string {
    return `network:${walletId}`;
  }

  /**
   * Generates a transaction cache key.
   *
   * @param walletId - The wallet identifier
   * @param txId - The transaction ID
   * @returns The cache key string
   */
  static transaction(walletId: string, txId: string): string {
    return `tx:${walletId}:${txId}`;
  }

  /**
   * Generates a signature cache key.
   *
   * @param walletId - The wallet identifier
   * @param messageHash - The message hash
   * @returns The cache key string
   */
  static signature(walletId: string, messageHash: string): string {
    return `sig:${walletId}:${messageHash}`;
  }

  /**
   * Generates a wallet state cache key.
   *
   * @param walletId - The wallet identifier
   * @param address - The Bitcoin address
   * @returns The cache key string
   */
  static walletState(walletId: string, address: string): string {
    return `state:${walletId}:${address}`;
  }

  /**
   * Generates an inscriptions cache key.
   *
   * @param walletId - The wallet identifier
   * @param address - The Bitcoin address
   * @param cursor - The pagination cursor
   * @returns The cache key string
   */
  static inscriptions(
    walletId: string,
    address: string,
    cursor?: number,
  ): string {
    return `inscriptions:${walletId}:${address}:${cursor || 0}`;
  }
}
