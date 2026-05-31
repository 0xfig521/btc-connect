/**
 * Batch request processing system.
 * Provides intelligent request batching to combine multiple requests into single batches,
 * reducing network overhead and improving performance.
 *
 * @example
 * ```typescript
 * import { BatchScheduler, createBatchScheduler } from '@btc-connect/core';
 *
 * // Define batch processor
 * const processor = async (requests) => {
 *   const results = new Map<string, Result>();
 *   for (const req of requests) {
 *     const result = await processItem(req.data);
 *     results.set(req.id, result);
 *   }
 *   return results;
 * };
 *
 * // Create scheduler
 * const scheduler = new BatchScheduler(processor, {
 *   maxBatchSize: 100,
 *   maxWaitTimeMS: 50
 * });
 *
 * // Submit requests
 * const result1 = await scheduler.submit({ address: 'tb1q...' });
 * const result2 = await scheduler.submit({ address: 'tb1q...' });
 * ```
 */

// ===== 类型定义 =====

export interface BatchRequest<T = unknown, R = unknown> {
  id: string;
  data: T;
  priority: number;
  timestamp: number;
  resolve: (result: R) => void;
  reject: (error: Error) => void;
}

export type BatchProcessor<T = unknown, R = unknown> = (
  requests: BatchRequest<T, R>[]
) => Promise<Map<string, R>>;

export interface BatchSchedulerConfig {
  maxBatchSize?: number;
  maxWaitTimeMS?: number;
  minBatchSize?: number;
  priorityThreshold?: number;
}

export interface BatchMetrics {
  totalBatches: number;
  totalRequests: number;
  averageBatchSize: number;
  averageWaitTime: number;
  successRate: number;
}

export type BatchEventType =
  | 'batchStart'
  | 'batchComplete'
  | 'batchError'
  | 'requestQueued';

export interface BatchEvent {
  type: BatchEventType;
  batchId?: string;
  requestId?: string;
  timestamp: number;
  error?: Error;
}

export type BatchEventHandler = (event: BatchEvent) => void;

// ===== 批调度器 =====

/**
 * Batch scheduler for processing requests in batches.
 * Supports priority-based processing, configurable batch sizes, and event tracking.
 *
 * @template T - Request data type
 * @template R - Result data type
 */
export class BatchScheduler<T = unknown, R = unknown> {
  private queue: BatchRequest<T, R>[] = [];
  private processing = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private batchId = 0;
  private metrics: BatchMetrics = {
    totalBatches: 0,
    totalRequests: 0,
    averageBatchSize: 0,
    averageWaitTime: 0,
    successRate: 1,
  };
  private eventHandlers: BatchEventHandler[] = [];
  private readonly config: Required<BatchSchedulerConfig>;

  constructor(
    private processor: BatchProcessor<T, R>,
    config: BatchSchedulerConfig = {}
  ) {
    this.config = {
      maxBatchSize: config.maxBatchSize ?? 100,
      maxWaitTimeMS: config.maxWaitTimeMS ?? 50,
      minBatchSize: config.minBatchSize ?? 1,
      priorityThreshold: config.priorityThreshold ?? 10,
    };
  }

  /**
   * Submits a request to the batch queue.
   *
   * @param data - The request data
   * @param priority - Request priority (higher = more urgent)
   * @returns Promise resolving to the result
   *
   * @example
   * ```typescript
   * const result = await scheduler.submit({ address: 'tb1q...' }, 5);
   * ```
   */
  submit(data: T, priority = 0): Promise<R> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest<T, R> = {
        id: this.generateId(),
        data,
        priority,
        timestamp: performance.now(),
        resolve,
        reject,
      };

      this.queue.push(request);

      this.emitEvent({
        type: 'requestQueued',
        requestId: request.id,
        timestamp: Date.now(),
      });

      this.scheduleProcessing();
    });
  }

  /**
   * Immediately processes the current queue.
   *
   * @returns Promise that resolves when processing completes
   */
  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    return this.processBatch();
  }

  /**
   * Clears the queue and rejects all pending requests.
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const error = new Error('Batch scheduler cleared');
    for (const request of this.queue) {
      request.reject(error);
    }

    this.queue = [];
    this.processing = false;
  }

  /**
   * Gets the current queue size.
   *
   * @returns Number of pending requests
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * 获取统计信息
   */
  getMetrics(): BatchMetrics {
    return { ...this.metrics };
  }

  /**
   * 重置统计信息
   */
  resetMetrics(): void {
    this.metrics = {
      totalBatches: 0,
      totalRequests: 0,
      averageBatchSize: 0,
      averageWaitTime: 0,
      successRate: 1,
    };
  }

  /**
   * 添加事件监听器
   */
  on(handler: BatchEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * 移除事件监听器
   */
  off(handler: BatchEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * 销毁调度器
   */
  destroy(): void {
    this.clear();
    this.eventHandlers = [];
  }

  // ===== 私有方法 =====

  private scheduleProcessing(): void {
    if (this.processing) return;

    // 检查是否满足立即处理条件
    const highPriorityCount = this.queue.filter(
      (r) => r.priority >= this.config.priorityThreshold
    ).length;

    if (highPriorityCount >= this.config.minBatchSize) {
      this.processBatch();
      return;
    }

    if (this.queue.length >= this.config.maxBatchSize) {
      this.processBatch();
      return;
    }

    // 设置延迟处理
    if (!this.timer) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.processBatch();
      }, this.config.maxWaitTimeMS);
    }
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const batchId = `batch-${++this.batchId}`;

    // 准备批次
    const batchSize = Math.min(this.queue.length, this.config.maxBatchSize);
    const batch = this.queue.splice(0, batchSize);

    this.emitEvent({
      type: 'batchStart',
      batchId,
      timestamp: Date.now(),
    });

    const startTime = performance.now();
    let success = true;

    try {
      const results = await this.processor(batch);

      // 分发结果
      for (const request of batch) {
        const result = results.get(request.id);
        if (result !== undefined) {
          request.resolve(result);
        } else {
          request.reject(new Error(`No result for request ${request.id}`));
        }
      }
    } catch (error) {
      success = false;
      const err = error instanceof Error ? error : new Error(String(error));

      // 拒绝所有请求
      for (const request of batch) {
        request.reject(err);
      }

      this.emitEvent({
        type: 'batchError',
        batchId,
        timestamp: Date.now(),
        error: err,
      });
    } finally {
      const duration = performance.now() - startTime;
      this.updateMetrics(batchSize, duration, success);

      this.emitEvent({
        type: 'batchComplete',
        batchId,
        timestamp: Date.now(),
      });

      this.processing = false;

      // 检查是否还有更多请求需要处理
      if (this.queue.length > 0) {
        this.scheduleProcessing();
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private updateMetrics(batchSize: number, duration: number, success: boolean): void {
    const m = this.metrics;

    m.totalBatches++;
    m.totalRequests += batchSize;

    // 计算移动平均值
    m.averageBatchSize =
      (m.averageBatchSize * (m.totalBatches - 1) + batchSize) / m.totalBatches;
    m.averageWaitTime =
      (m.averageWaitTime * (m.totalBatches - 1) + duration) / m.totalBatches;

    // 成功率
    const successCount = Math.round(m.successRate * (m.totalBatches - 1)) + (success ? 1 : 0);
    m.successRate = successCount / m.totalBatches;
  }

  private emitEvent(event: BatchEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in batch event handler:', error);
      }
    }
  }
}

// ===== 便捷函数 =====

/**
 * 创建批调度器
 */
export function createBatchScheduler<T, R>(
  processor: BatchProcessor<T, R>,
  config?: BatchSchedulerConfig
): BatchScheduler<T, R> {
  return new BatchScheduler(processor, config);
}

/**
 * 创建简单批处理器（直接映射）
 */
export function createSimpleBatchScheduler<T, R>(
  processor: (items: T[]) => Promise<R[]>,
  config?: BatchSchedulerConfig
): BatchScheduler<T, R> {
  const batchProcessor: BatchProcessor<T, R> = async (requests) => {
    const items = requests.map((r) => r.data);
    const results = await processor(items);
    const map = new Map<string, R>();
    requests.forEach((req, index) => {
      if (index < results.length) {
        map.set(req.id, results[index]);
      }
    });
    return map;
  };

  return new BatchScheduler(batchProcessor, config);
}

// ===== 常量导出 =====

export const BatchDefaults = {
  MAX_BATCH_SIZE: 100,
  MAX_WAIT_TIME_MS: 50,
  MIN_BATCH_SIZE: 1,
  PRIORITY_THRESHOLD: 10,
} as const;
