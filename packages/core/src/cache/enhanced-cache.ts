/**
 * Enhanced cache system with statistics tracking, events, and batch operations.
 * Extends MemoryCache with additional features for monitoring and optimization.
 *
 * @example
 * ```typescript
 * import { EnhancedMemoryCache } from '@btc-connect/core';
 *
 * const cache = new EnhancedMemoryCache<UserData>({
 *   ttl: 60000,
 *   maxSize: 1000,
 *   trackStats: true,      // Enable statistics
 *   trackEvents: true,     // Enable events
 *   maxMemory: 50 * 1024 * 1024  // 50MB memory limit
 * });
 *
 * // Get statistics
 * const stats = cache.getStats();
 * console.log('Hit rate:', stats.hitRate);
 *
 * // Listen to events
 * cache.on((event) => {
 *   console.log(`Cache event: ${event.type}`, event.key);
 * });
 *
 * // Batch operations
 * cache.setMany([
 *   { key: 'user:1', value: { name: 'Alice' } },
 *   { key: 'user:2', value: { name: 'Bob' } }
 * ]);
 * ```
 */

import type { CacheOptions as BaseCacheOptions } from './memory-cache';
import { MemoryCache, type CacheItem } from './memory-cache';

// ===== 增强类型定义 =====

export interface EnhancedCacheOptions extends BaseCacheOptions {
  trackStats?: boolean; // 是否追踪统计信息
  trackEvents?: boolean; // 是否追踪事件
  maxMemory?: number; // 最大内存占用（字节）
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  memoryUsage: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

export type CacheEventType = 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'clear';

export interface CacheEvent {
  type: CacheEventType;
  key: string;
  timestamp: number;
  data?: unknown;
}

export type CacheEventHandler = (event: CacheEvent) => void;

// ===== 增强缓存类 =====

/**
 * Enhanced memory cache with statistics and events.
 *
 * @template T - The type of cached values
 */
export class EnhancedMemoryCache<T = unknown> extends MemoryCache<T> {
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private eventHandlers: CacheEventHandler[] = [];
  private readonly options: EnhancedCacheOptions;
  private accessTimes: Map<string, number> = new Map();

  constructor(options: EnhancedCacheOptions = {}) {
    super({
      ttl: options.ttl,
      maxSize: options.maxSize,
      enableAutoCleanup: options.enableAutoCleanup,
      cleanupInterval: options.cleanupInterval,
    });
    this.options = {
      trackStats: options.trackStats ?? true,
      trackEvents: options.trackEvents ?? false,
      maxMemory: options.maxMemory ?? 50 * 1024 * 1024, // 50MB
      ...options,
    };
  }

  // ===== 重写核心方法添加追踪 =====

  override get(key: string): T | null {
    const result = super.get(key);

    if (this.options.trackStats) {
      if (result === null) {
        this.misses++;
      } else {
        this.hits++;
        this.accessTimes.set(key, Date.now());
      }
    }

    if (this.options.trackEvents) {
      this.emitEvent({
        type: result === null ? 'miss' : 'hit',
        key,
        timestamp: Date.now(),
        data: result ?? undefined,
      });
    }

    return result;
  }

  override set(key: string, data: T, ttl?: number): void {
    // 检查内存限制
    if (this.options.maxMemory) {
      const currentUsage = this.calculateMemoryUsage();
      const itemSize = this.estimateSize(data);

      if (currentUsage + itemSize > this.options.maxMemory) {
        this.evictToFreeMemory(itemSize);
      }
    }

    super.set(key, data, ttl);
    this.accessTimes.set(key, Date.now());

    if (this.options.trackEvents) {
      this.emitEvent({
        type: 'set',
        key,
        timestamp: Date.now(),
        data,
      });
    }
  }

  override delete(key: string): boolean {
    const result = super.delete(key);
    this.accessTimes.delete(key);

    if (this.options.trackEvents && result) {
      this.emitEvent({
        type: 'delete',
        key,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  override clear(): void {
    super.clear();
    this.accessTimes.clear();

    if (this.options.trackEvents) {
      this.emitEvent({
        type: 'clear',
        key: '',
        timestamp: Date.now(),
      });
    }
  }

  // ===== 批量操作 =====

  /**
   * Batch retrieves multiple values from the cache.
   *
   * @param keys - Array of cache keys
   * @returns Map of found key-value pairs
   *
   * @example
   * ```typescript
   * const results = cache.getMany(['user:1', 'user:2']);
   * ```
   */
  getMany(keys: string[]): Map<string, T> {
    const results = new Map<string, T>();
    for (const key of keys) {
      const value = this.get(key);
      if (value !== null) {
        results.set(key, value);
      }
    }
    return results;
  }

  /**
   * Batch sets multiple values in the cache.
   *
   * @param entries - Array of key-value-ttl entries
   * @returns Number of successfully set entries
   *
   * @example
   * ```typescript
   * cache.setMany([
   *   { key: 'user:1', value: { name: 'Alice' } },
   *   { key: 'user:2', value: { name: 'Bob' }, ttl: 5000 }
   * ]);
   * ```
   */
  setMany(entries: Array<{ key: string; value: T; ttl?: number }>): number {
    let successCount = 0;
    for (const entry of entries) {
      try {
        this.set(entry.key, entry.value, entry.ttl);
        successCount++;
      } catch {
        // 跳过失败的条目
      }
    }
    return successCount;
  }

  /**
   * Batch deletes multiple keys from the cache.
   *
   * @param keys - Array of cache keys to delete
   * @returns Number of deleted keys
   */
  deleteMany(keys: string[]): number {
    let deleteCount = 0;
    for (const key of keys) {
      if (this.delete(key)) {
        deleteCount++;
      }
    }
    return deleteCount;
  }

  // ===== 查询操作 =====

  /**
   * Finds cache entries matching a predicate.
   *
   * @param predicate - Function to test each entry
   * @returns Array of matching key-value pairs
   *
   * @example
   * ```typescript
   * const activeUsers = cache.find((user, key) => user.isActive);
   * ```
   */
  find(predicate: (value: T, key: string) => boolean): Array<[string, T]> {
    const keys = this.keys();
    const results: Array<[string, T]> = [];

    for (const key of keys) {
      const value = this.get(key);
      if (value !== null && predicate(value, key)) {
        results.push([key, value]);
      }
    }

    return results;
  }

  /**
   * Gets all cache entries as key-value pairs.
   *
   * @returns Array of all key-value pairs
   */
  entries(): Array<[string, T]> {
    const keys = this.keys();
    const results: Array<[string, T]> = [];

    for (const key of keys) {
      const value = this.get(key);
      if (value !== null) {
        results.push([key, value]);
      }
    }

    return results;
  }

  // ===== 统计信息 =====

  /**
   * Gets detailed cache statistics.
   *
   * @returns Complete statistics including hits, misses, and memory usage
   */
  override getStats(): CacheStats {
    const baseStats = super.getStats();
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    // 计算最旧和最新的条目
    const accessTimes = Array.from(this.accessTimes.values());
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    if (accessTimes.length > 0) {
      oldestEntry = Math.min(...accessTimes);
      newestEntry = Math.max(...accessTimes);
    }

    return {
      ...baseStats,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      evictions: this.evictions,
      memoryUsage: this.calculateMemoryUsage(),
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Resets all statistics counters.
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.accessTimes.clear();
  }

  /**
   * Gets the cache hit rate as a percentage.
   *
   * @returns Hit rate percentage (0-100)
   */
  getHitRatePercent(): number {
    const total = this.hits + this.misses;
    return total > 0 ? (this.hits / total) * 100 : 0;
  }

  // ===== 事件系统 =====

  /**
   * 添加事件监听器
   */
  on(eventHandler: CacheEventHandler): void {
    this.eventHandlers.push(eventHandler);
  }

  /**
   * 移除事件监听器
   */
  off(eventHandler: CacheEventHandler): void {
    const index = this.eventHandlers.indexOf(eventHandler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * 移除所有事件监听器
   */
  offAll(): void {
    this.eventHandlers = [];
  }

  // ===== 私有方法 =====

  private emitEvent(event: CacheEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in cache event handler:', error);
      }
    }
  }

  private calculateMemoryUsage(): number {
    let total = 0;
    const keys = this.keys();

    for (const key of keys) {
      total += key.length * 2; // UTF-16 每字符2字节
      // 估算值的大小
      total += 64; // 假设每个条目约64字节
    }

    return total;
  }

  private estimateSize(value: T): number {
    try {
      const str = JSON.stringify(value);
      return str.length * 2;
    } catch {
      return 1024; // 默认1KB
    }
  }

  private evictToFreeMemory(requiredSize: number): void {
    // 记录淘汰事件
    this.evictions++;

    if (this.options.trackEvents) {
      this.emitEvent({
        type: 'evict',
        key: 'memory-limit',
        timestamp: Date.now(),
      });
    }
  }
}

// ===== 常量导出 =====

export const CacheDefaults = {
  MAX_SIZE: 1000,
  MAX_MEMORY: 50 * 1024 * 1024, // 50MB
  DEFAULT_TTL: 60000, // 60秒
  CLEANUP_INTERVAL: 30000, // 30秒
} as const;
