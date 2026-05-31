import { OKXAdapter } from './okx';
import { UniSatAdapter } from './unisat';

export { BaseWalletAdapter } from './base';
export { OKXAdapter } from './okx';
export { UniSatAdapter } from './unisat';
export { XverseAdapter } from './xverse';

/**
 * Creates a wallet adapter instance based on the wallet type.
 *
 * @param type - The wallet type identifier ('unisat', 'okx', or 'xverse')
 * @returns A new wallet adapter instance
 * @throws {Error} If the wallet type is not supported
 *
 * @example
 * ```typescript
 * import { createAdapter } from '@btc-connect/core';
 *
 * const adapter = createAdapter('unisat');
 * await adapter.connect();
 * ```
 */
export function createAdapter(type: 'unisat' | 'okx' | 'xverse') {
  switch (type) {
    case 'unisat':
      return new UniSatAdapter();
    case 'okx':
      return new OKXAdapter();
    // case 'xverse':
    //   return new XverseAdapter();
    default:
      throw new Error(`Unsupported wallet type: ${type}`);
  }
}

/**
 * Gets all supported wallet adapter instances.
 * This returns adapters for all wallets regardless of whether they are installed.
 *
 * @returns Array of all wallet adapter instances
 *
 * @example
 * ```typescript
 * import { getAllAdapters } from '@btc-connect/core';
 *
 * const adapters = getAllAdapters();
 * console.log('Supported wallets:', adapters.map(a => a.name));
 * ```
 */
export function getAllAdapters() {
  return [new UniSatAdapter(), new OKXAdapter()];
}

/**
 * Gets wallet adapter instances for installed wallets only.
 * Filters out adapters for wallets that are not installed in the browser.
 *
 * @returns Array of wallet adapter instances for installed wallets
 *
 * @example
 * ```typescript
 * import { getAvailableAdapters } from '@btc-connect/core';
 *
 * const adapters = getAvailableAdapters();
 * console.log('Installed wallets:', adapters.map(a => a.name));
 * ```
 */
export function getAvailableAdapters() {
  return getAllAdapters().filter((adapter) => adapter.isReady());
}

// 增强的钱包检测配置
export interface WalletDetectionConfig {
  timeout?: number; // 超时时间（毫秒），默认20000
  interval?: number; // 轮询间隔（毫秒），默认300
  onProgress?: (detectedWallets: string[], elapsedTime: number) => void; // 进度回调
}

// 增强的钱包检测结果
export interface WalletDetectionResult {
  wallets: string[]; // 检测到的钱包ID列表
  adapters: ReturnType<typeof getAllAdapters>; // 可用的适配器实例
  elapsedTime: number; // 总耗时
  isComplete: boolean; // 是否完成检测
}

/**
 * Detects available wallets with support for delayed wallet injection.
 * Some wallets inject their providers asynchronously, so this function
 * polls for wallet availability within the specified timeout period.
 *
 * @param config - Detection configuration options
 * @returns Promise resolving to detection result with available wallets
 *
 * @example
 * ```typescript
 * import { detectAvailableWallets } from '@btc-connect/core';
 *
 * const result = await detectAvailableWallets({
 *   timeout: 20000,
 *   interval: 300,
 *   onProgress: (wallets, elapsed) => {
 *     console.log(`Detected ${wallets.length} wallets after ${elapsed}ms`);
 *   }
 * });
 *
 * console.log('Available wallets:', result.wallets);
 * console.log('Detection took:', result.elapsedTime, 'ms');
 * ```
 */
export function detectAvailableWallets(
  config: WalletDetectionConfig = {},
): Promise<WalletDetectionResult> {
  const {
    timeout = 20000, // 20秒超时
    interval = 300, // 300ms间隔
    onProgress,
  } = config;

  return new Promise((resolve) => {
    const startTime = Date.now();
    let lastDetectedWallets: string[] = [];

    const checkWallets = (): WalletDetectionResult => {
      const adapters = getAllAdapters();
      const availableAdapters = adapters.filter((adapter) => adapter.isReady());
      const detectedWallets = availableAdapters.map((adapter) => adapter.id);
      const elapsedTime = Date.now() - startTime;

      // 检查是否有新的钱包被检测到
      const hasNewWallets =
        detectedWallets.length !== lastDetectedWallets.length ||
        detectedWallets.some(
          (wallet, index) => wallet !== lastDetectedWallets[index],
        );

      if (hasNewWallets) {
        lastDetectedWallets = [...detectedWallets];
        onProgress?.(detectedWallets, elapsedTime);
      }

      const result: WalletDetectionResult = {
        wallets: detectedWallets,
        adapters: availableAdapters,
        elapsedTime,
        isComplete: elapsedTime >= timeout,
      };

      return result;
    };

    // 立即执行一次检测
    const initialResult = checkWallets();
    if (initialResult.wallets.length > 0) {
      // 如果初始检测就有钱包，继续轮询以确保完整性
    }

    // 设置轮询
    const pollInterval = setInterval(() => {
      const result = checkWallets();

      if (result.isComplete) {
        clearInterval(pollInterval);
        resolve(result);
      }
    }, interval);

    // 设置超时保险
    const timeoutId = setTimeout(() => {
      clearInterval(pollInterval);
      const finalResult = checkWallets();
      resolve({
        ...finalResult,
        isComplete: true,
      });
    }, timeout);

    // 清理函数
    const cleanup = () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
    };

    // 如果所有已知钱包都被检测到，可以提前结束
    const allKnownWallets = ['unisat', 'okx', 'xverse'];
    const earlyCheckInterval = setInterval(() => {
      const result = checkWallets();
      if (
        result.wallets.length === allKnownWallets.length ||
        result.isComplete
      ) {
        cleanup();
        resolve(result);
      }
    }, interval);

    // 合并清理
    setTimeout(() => {
      clearInterval(earlyCheckInterval);
    }, timeout);
  });
}

/**
 * Synchronous wallet detection with retry support.
 * Attempts to detect installed wallets with a limited number of retries.
 *
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @param retryDelay - Delay between retries in milliseconds (default: 300)
 * @returns Array of available wallet adapters
 *
 * @example
 * ```typescript
 * import { getAvailableWalletsWithRetry } from '@btc-connect/core';
 *
 * const adapters = getAvailableWalletsWithRetry(10, 200);
 * if (adapters.length > 0) {
 *   console.log('Found wallet:', adapters[0].name);
 * }
 * ```
 */
export function getAvailableWalletsWithRetry(
  maxRetries: number = 5,
  retryDelay: number = 300,
): ReturnType<typeof getAvailableAdapters> {
  let retries = 0;

  const check = (): ReturnType<typeof getAvailableAdapters> => {
    const adapters = getAvailableAdapters();

    if (adapters.length > 0 || retries >= maxRetries) {
      return adapters;
    }

    retries++;
    setTimeout(check, retryDelay);
    return adapters;
  };

  return check();
}
