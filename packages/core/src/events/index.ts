import type {
  AccountChangeEventParams,
  AvailableWalletsEventParams,
  ConnectEventParams,
  ErrorEventParams,
  EventHandler,
  NetworkChangeEventParams,
  WalletDetectedEventParams,
  WalletDetectionCompleteEventParams,
  WalletEvent,
} from '../types';

// 事件监听器接口
interface EventListener<T extends WalletEvent> {
  event: T;
  handler: EventHandler<T>;
  once?: boolean;
}

/**
 * Simple event emitter implementation for wallet events.
 * Provides type-safe event handling with support for one-time listeners.
 *
 * @example
 * ```typescript
 * import { EventEmitter } from '@btc-connect/core';
 *
 * const emitter = new EventEmitter();
 *
 * // Add listener
 * emitter.on('connect', (params) => {
 *   console.log('Connected:', params.walletId);
 * });
 *
 * // One-time listener
 * emitter.once('disconnect', (params) => {
 *   console.log('Disconnected:', params.walletId);
 * });
 *
 * // Emit event
 * emitter.emit('connect', { walletId: 'unisat', accounts: [...] });
 *
 * // Remove listener
 * emitter.off('connect', handler);
 * ```
 */
export class EventEmitter {
  private listeners: Map<WalletEvent, EventListener<any>[]> = new Map();
  private maxListeners: number = 100;

  /**
   * Registers an event listener.
   *
   * @template T - The event type
   * @param event - The event name
   * @param handler - The callback function
   */
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
    this.addListener(event, handler, false);
  }

  /**
   * Registers a one-time event listener that is removed after first invocation.
   *
   * @template T - The event type
   * @param event - The event name
   * @param handler - The callback function
   */
  once<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
    this.addListener(event, handler, true);
  }

  /**
   * Removes an event listener.
   *
   * @template T - The event type
   * @param event - The event name
   * @param handler - The callback function to remove
   */
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    const index = listeners.findIndex(
      (listener) => listener.handler === handler,
    );
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // 如果没有监听器了，删除该事件的映射
    if (listeners.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Removes all listeners for a specific event, or all listeners if no event specified.
   *
   * @param event - Optional event name to clear listeners for
   */
  removeAllListeners(event?: WalletEvent): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emits an event to all registered listeners.
   *
   * @param event - The event name
   * @param args - Event arguments
   * @returns True if listeners were called, false otherwise
   */
  emit(event: WalletEvent, ...args: any[]): boolean {
    const listeners = this.listeners.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }

    // 创建副本以避免在遍历时修改数组
    const listenersCopy = [...listeners];

    for (const listener of listenersCopy) {
      try {
        listener.handler(...args);

        // 如果是一次性监听器，移除它
        if (listener.once) {
          this.off(event, listener.handler);
        }
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }

    return true;
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: WalletEvent): number {
    const listeners = this.listeners.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): WalletEvent[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * 添加监听器的内部方法
   */
  private addListener<T extends WalletEvent>(
    event: T,
    handler: EventHandler<T>,
    once: boolean,
  ): void {
    const listeners = this.listeners.get(event) || [];

    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(
        `Possible memory leak detected. ${listeners.length} ${event} listeners added.`,
      );
    }

    listeners.push({ event, handler, once });
    this.listeners.set(event, listeners);
  }
}

/**
 * Wallet-specific event manager with typed event emission methods.
 * Extends EventEmitter with wallet-specific event types.
 *
 * @example
 * ```typescript
 * import { WalletEventManager } from '@btc-connect/core';
 *
 * const eventManager = new WalletEventManager();
 *
 * // Listen to events
 * eventManager.on('connect', (params) => {
 *   console.log('Connected:', params.walletId, params.accounts);
 * });
 *
 * eventManager.on('accountChange', (params) => {
 *   console.log('Account changed:', params.accounts);
 * });
 *
 * // Emit events
 * eventManager.emitConnect('unisat', accounts);
 * eventManager.emitAccountChange('unisat', newAccounts);
 * ```
 */
export class WalletEventManager extends EventEmitter {
  private isDestroyed = false;

  /**
   * Emits a wallet connect event.
   *
   * @param walletId - The connected wallet ID
   * @param accounts - The connected accounts
   * @returns True if listeners were called
   */
  emitConnect(
    walletId: string,
    accounts: ConnectEventParams['accounts'],
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('connect', { walletId, accounts });
  }

  /**
   * Emits a wallet disconnect event.
   *
   * @param walletId - The disconnected wallet ID
   * @returns True if listeners were called
   */
  emitDisconnect(walletId: string): boolean {
    if (this.isDestroyed) return false;
    return this.emit('disconnect', { walletId });
  }

  /**
   * Emits an account change event.
   *
   * @param walletId - The wallet ID
   * @param accounts - The new account list
   * @returns True if listeners were called
   */
  emitAccountChange(
    walletId: string,
    accounts: AccountChangeEventParams['accounts'],
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('accountChange', { walletId, accounts });
  }

  /**
   * 发射网络变化事件
   */
  emitNetworkChange(
    walletId: string,
    network: NetworkChangeEventParams['network'],
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('networkChange', { walletId, network });
  }

  /**
   * 发射错误事件
   */
  emitError(walletId: string, error: ErrorEventParams['error']): boolean {
    if (this.isDestroyed) return false;
    return this.emit('error', { walletId, error });
  }

  /**
   * 发射可用钱包列表变化事件
   */
  emitAvailableWallets(params: AvailableWalletsEventParams): boolean {
    if (this.isDestroyed) return false;
    return this.emit('availableWallets', params);
  }

  /**
   * 发射检测到新钱包事件
   */
  emitWalletDetected(params: WalletDetectedEventParams): boolean {
    if (this.isDestroyed) return false;
    return this.emit('walletDetected', params);
  }

  /**
   * 发射钱包检测完成事件
   */
  emitWalletDetectionComplete(
    params: WalletDetectionCompleteEventParams,
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('walletDetectionComplete', params);
  }

  /**
   * 销毁事件管理器
   */
  destroy(): void {
    this.isDestroyed = true;
    this.removeAllListeners();
  }
}
