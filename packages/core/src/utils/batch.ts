/**
 * 批处理请求系统
 *
 * 提供智能的请求批处理功能，将多个请求合并为单个批次处理，
 * 减少网络开销，提高性能。
 */

import { EventEmitter } from '../events';

// ===== 类型定义 =====

export interface BatchRequest<T = unknown, R = unknown> {
  id: string;
  data: T;
  priority: number;
  timestamp: number;
  resolve: (result: R) => void;
  reject: (error: Error) => void;
}

export interface BatchProcessor<T = unknown, R = unknown> {
  (requests: BatchRequest<T, R>[]): Promise<Map<string, R>>;
}

export interface BatchSchedulerConfig {
  maxBatchSize?: number;
  maxWaitTime?: number;
  minBatchSize?: number;
  priorityThreshold?: number;
  adaptiveBatching?: boolean;
}

export interface BatchMetrics {
  totalBatches: number;
  totalRequests: number;
  averageBatchSize: number;
  averageWaitTime: number;
  successRate: number;
  throughput: number; // requests per second
}

export interface BatchEventMap {
  batchStart: { batchId: string; requestCount: number };
  batchComplete: { batchId: string; duration: number; success: boolean };
  batchError: { batchId: string; error: Error };
  requestQueued: { requestId: string; queueSize: number };
  requestTimeout: { requestId: string; waitTime: number };
  metricsUpdate: { metrics: BatchMetrics };
}

// ===== 批处理器 =====

export class BatchScheduler<T = unknown, R = unknown> extends EventEmitter<BatchEventMap> {
  private queue: BatchRequest<T, R>[] = [];
  private processing = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private batchId = 0;
  private metrics: BatchMetrics;
  private readonly config: Required<BatchSchedulerConfig>;

  constructor(
    private processor: BatchProcessor<T, R>,
    config: BatchSchedulerConfig = {}
  ) {
    super();
    this.config = {
      maxBatchSize: config.maxBatchSize ?? 100,
      maxWaitTime: config.maxWaitTime ?? 50,
      minBatchSize: config.minBatchSize ?? 1,
      priorityThreshold: config.priorityThreshold ?? 10,
      adaptiveBatching: config.adaptiveBatching ?? true,
    };
    this.metrics = this.createEmptyMetrics();
  }

  /**
   * 提交请求到批处理队列
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
      this.emit('requestQueued', { requestId: request.id, queueSize: this.queue.length });

      this.scheduleProcessing();
    });
  }

  /**
   * 立即处理当前队列
   */
  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    return this.processBatch();
  }

  /**
   * 清空队列
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 拒绝所有待处理的请求
    const error = new Error('Batch scheduler cleared');
    for (const request of this.queue) {
      request.reject(error);
    }

    this.queue = [];
    this.processing = false;
  }

  /**
   * 获取当前队列大小
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
    this.metrics = this.createEmptyMetrics();
  }

  /**
   * 销毁调度器
   */
  destroy(): void {
    this.clear();
    this.removeAllListeners();
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
      }, this.config.maxWaitTime);
    }
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const batchId = `batch-${++this.batchId}`;

    // 准备批次
    const batchSize = Math.min(this.queue.length, this.config.maxBatchSize);
    const batch = this.queue.splice(0, batchSize);

    this.emit('batchStart', { batchId, requestCount: batch.length });

    const startTime = performance.now();
    let success = false;

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

      success = true;
    } catch (error) {
      // 批次处理失败，拒绝所有请求
      const err = error instanceof Error ? error : new Error(String(error));
      for (const request of batch) {
        request.reject(err);
      }

      this.emit('batchError', { batchId, error: err });
    } finally {
      const duration = performance.now() - startTime;
      this.updateMetrics(batch.length, duration, success);
      this.emit('batchComplete', { batchId, duration, success });

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

  private createEmptyMetrics(): BatchMetrics {
    return {
      totalBatches: 0,
      totalRequests: 0,
      averageBatchSize: 0,
      averageWaitTime: 0,
      successRate: 1,
      throughput: 0,
    };
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

    // 吞吐量 (请求/秒)
    const seconds = duration / 1000;
    const currentThroughput = seconds > 0 ? batchSize / seconds : 0;
    m.throughput =
      (m.throughput * (m.totalBatches - 1) + currentThroughput) / m.totalBatches;

    this.emit('metricsUpdate', { metrics: m });
  }
}

// ===== 便捷函数 =====

/**
 * 创建批处理器
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
      map.set(req.id, results[index]);
    });
    return map;
  };

  return new BatchScheduler(batchProcessor, config);
}

// ===== 常量导出 =====

export const BatchDefaults = {
  MAX_BATCH_SIZE: 100,
  MAX_WAIT_TIME: 50,
  MIN_BATCH_SIZE: 1,
  PRIORITY_THRESHOLD: 10,
} as const;

// ===== 类型重新导出 =====
export type { BatchEventMap } from './batch';