/**
 * Core wallet functionality Composable
 *
 * Provides core access to the wallet manager with error handling and performance optimization.
 * This is the foundation composable that other wallet composables build upon.
 *
 * @returns {UseCoreReturn} Object containing manager, state, and connection methods
 * @returns {Ref<BTCWalletManager | null>} returns.manager - Wallet manager instance
 * @returns {ComputedRef<WalletState>} returns.state - Current wallet state
 * @returns {ComputedRef<boolean>} returns.isConnected - Whether wallet is connected
 * @returns {ComputedRef<boolean>} returns.isConnecting - Whether wallet is connecting
 * @returns {ComputedRef<WalletInfo | null>} returns.currentWallet - Current wallet info
 * @returns {Ref<WalletInfo[]>} returns.availableWallets - List of available wallets
 * @returns {(walletId: string) => Promise<AccountInfo[]>} returns.connect - Connect to a wallet
 * @returns {() => Promise<void>} returns.disconnect - Disconnect current wallet
 * @returns {(walletId: string) => Promise<AccountInfo[]>} returns.switchWallet - Switch to another wallet
 *
 * @example
 * ```vue
 * <script setup>
 * import { useCore } from '@btc-connect/vue';
 *
 * const { isConnected, connect, disconnect, availableWallets } = useCore();
 *
 * const handleConnect = async (walletId: string) => {
 *   try {
 *     const accounts = await connect(walletId);
 *     console.log('Connected:', accounts);
 *   } catch (error) {
 *     console.error('Connection failed:', error);
 *   }
 * };
 * </script>
 *
 * <template>
 *   <div>
 *     <p>Status: {{ isConnected ? 'Connected' : 'Disconnected' }}</p>
 *     <button v-for="wallet in availableWallets" :key="wallet.id" @click="handleConnect(wallet.id)">
 *       Connect {{ wallet.name }}
 *     </button>
 *     <button v-if="isConnected" @click="disconnect">Disconnect</button>
 *   </div>
 * </template>
 * ```
 */

import {
  type ComputedRef,
  computed,
  nextTick,
  onUnmounted,
  readonly,
  ref,
  watch,
} from 'vue';
import { useConfig } from '../config';
import { isClient } from '../index';
import type { UseCoreReturn } from '../types';
import { useWalletContext } from '../walletContext';

/**
 * Use core wallet functionality Composable - provides access to the wallet manager
 *
 * @returns Core wallet functionality including manager, state, and connection methods
 */
export function useCore(): UseCoreReturn {
  const ctx = useWalletContext();
  const config = useConfig();

  // 错误边界检查
  if (!ctx) {
    throw new Error('useCore must be used within BTCWalletPlugin');
  }

  // 性能优化的计算属性
  const isConnected: ComputedRef<boolean> = computed(() => {
    return Boolean(ctx.isConnected.value && ctx.manager.value);
  });

  // 添加错误处理的连接方法
  const connect = async (walletId: string) => {
    if (!isClient) {
      throw new Error('Cannot connect wallet on server side');
    }

    if (!ctx.manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    if (!walletId) {
      throw new Error('Wallet ID is required');
    }

    const startTime = performance.now();

    try {
      if (config.getDevConfig().debug) {
        console.log(`🔗 [useCore] Connecting to wallet: ${walletId}`);
      }

      const accounts = await ctx.connect(walletId);

      // 性能监控
      if (config.getPerformanceConfig().enableCache) {
        const duration = performance.now() - startTime;
        if (config.getDevConfig().showPerformanceMetrics) {
          console.log(`⚡ [useCore] Connection took ${duration.toFixed(2)}ms`);
        }
      }

      // 等待下一个tick确保状态更新
      await nextTick();

      return accounts;
    } catch (error) {
      console.error(`❌ [useCore] Failed to connect to ${walletId}:`, error);
      throw error;
    }
  };

  // 添加错误处理的断开连接方法
  const disconnect = async () => {
    if (!isClient) {
      return;
    }

    if (!ctx.manager.value) {
      return;
    }

    try {
      if (config.getDevConfig().debug) {
        console.log('🔌 [useCore] Disconnecting wallet');
      }

      await ctx.disconnect();

      // 等待下一个tick确保状态更新
      await nextTick();
    } catch (error) {
      console.error('❌ [useCore] Failed to disconnect wallet:', error);
      throw error;
    }
  };

  // 添加错误处理的切换钱包方法
  const switchWallet = async (walletId: string) => {
    if (!isClient) {
      throw new Error('Cannot switch wallet on server side');
    }

    if (!ctx.manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    if (!walletId) {
      throw new Error('Wallet ID is required');
    }

    try {
      if (config.getDevConfig().debug) {
        console.log(`🔄 [useCore] Switching to wallet: ${walletId}`);
      }

      const accounts = await ctx.switchWallet(walletId);

      // 等待下一个tick确保状态更新
      await nextTick();

      return accounts;
    } catch (error) {
      console.error(`❌ [useCore] Failed to switch to ${walletId}:`, error);
      throw error;
    }
  };

  // 监听连接状态变化，进行性能优化
  let stateUpdateTimer: NodeJS.Timeout | null = null;

  const throttledStateUpdate = () => {
    if (stateUpdateTimer) {
      clearTimeout(stateUpdateTimer);
    }

    stateUpdateTimer = setTimeout(() => {
      // 强制触发状态重新计算
      ctx._stateUpdateTrigger.value++;

      // 清除定时器
      stateUpdateTimer = null;
    }, config.getPerformanceConfig().stateUpdateThrottle);
  };

  // 监听状态变化
  watch(
    () => ctx.state.value,
    () => {
      throttledStateUpdate();
    },
    { deep: false, flush: 'post' },
  );

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (stateUpdateTimer) {
      clearTimeout(stateUpdateTimer);
      stateUpdateTimer = null;
    }
  });

  return {
    // 核心管理器
    manager: ctx.manager,

    // 状态（优化响应性）
    state: ctx.state,
    isConnected,
    isConnecting: ctx.isConnecting,
    currentWallet: ctx.currentWallet,
    availableWallets: ctx.availableWallets,

    // 操作方法（增强错误处理）
    connect,
    disconnect,
    switchWallet,
  };
}

/**
 * Get direct access to the wallet manager (for advanced usage only)
 *
 * @returns The BTCWalletManager instance
 * @throws Error if wallet manager is not initialized
 *
 * @warning Direct manipulation of the manager may bypass Vue's reactivity system, use with caution
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWalletManager } from '@btc-connect/vue';
 *
 * const manager = useWalletManager();
 *
 * // Access low-level manager methods
 * const adapter = manager.getCurrentAdapter();
 * console.log('Current adapter:', adapter?.name);
 * </script>
 * ```
 */
export function useWalletManager() {
  const ctx = useWalletContext();

  if (!ctx?.manager.value) {
    throw new Error('Wallet manager not initialized');
  }

  return ctx.manager.value;
}

/**
 * Wallet state monitor (for debugging and monitoring)
 *
 * @param callback - Callback function invoked when state changes
 * @returns Cleanup function to stop monitoring
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWalletStateMonitor } from '@btc-connect/vue';
 *
 * const cleanup = useWalletStateMonitor((newState, prevState) => {
 *   console.log('State changed:', { newState, prevState });
 * });
 *
 * onUnmounted(cleanup);
 * </script>
 * ```
 */
export function useWalletStateMonitor(
  callback: (state: any, prevState: any) => void,
) {
  const ctx = useWalletContext();
  const config = useConfig();

  if (!config.getDevConfig().debug) {
    // 非调试模式下不启用监控
    return () => {};
  }

  let prevState = null;

  const stopWatcher = watch(
    () => ctx.state.value,
    (newState) => {
      if (prevState !== null) {
        callback(newState, prevState);
      }
      prevState = { ...newState };
    },
    { deep: true, immediate: false },
  );

  return () => {
    stopWatcher();
  };
}

/**
 * Performance monitoring Composable
 *
 * Provides metrics tracking for wallet operations including connection time
 * and state update frequency.
 *
 * @returns Performance metrics and reset function
 * @returns {Object} returns.metrics - Performance metrics object
 * @returns {number} returns.metrics.connectionTime - Last connection duration in ms
 * @returns {number} returns.metrics.stateUpdateCount - Number of state updates
 * @returns {number} returns.metrics.lastUpdateTime - Timestamp of last update
 * @returns {() => void} returns.reset - Reset all metrics
 *
 * @example
 * ```vue
 * <script setup>
 * import { usePerformanceMonitor } from '@btc-connect/vue';
 *
 * const { metrics, reset } = usePerformanceMonitor();
 *
 * // Monitor performance
 * watch(metrics, (newMetrics) => {
 *   console.log('State updates:', newMetrics.stateUpdateCount);
 * });
 * </script>
 * ```
 */
export function usePerformanceMonitor() {
  const config = useConfig();

  const metrics = ref({
    connectionTime: 0,
    stateUpdateCount: 0,
    lastUpdateTime: 0,
  });

  if (config.getPerformanceConfig().enableCache) {
    const ctx = useWalletContext();

    // 监控状态更新
    watch(
      () => ctx._stateUpdateTrigger.value,
      () => {
        metrics.value.stateUpdateCount++;
        metrics.value.lastUpdateTime = Date.now();
      },
    );
  }

  return {
    metrics: readonly(metrics),
    reset: () => {
      metrics.value = {
        connectionTime: 0,
        stateUpdateCount: 0,
        lastUpdateTime: 0,
      };
    },
  };
}
