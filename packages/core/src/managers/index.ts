import { getAvailableAdapters } from '../adapters';
import { BaseWalletAdapter } from '../adapters/base';
import { WalletEventManager } from '../events';
import type {
  AccountInfo,
  BTCWalletAdapter,
  EventHandler,
  WalletEvent,
  WalletInfo,
  WalletManager,
  WalletManagerConfig,
  WalletState,
} from '../types';
import { WalletError } from '../types';

/**
 * Central wallet manager for coordinating Bitcoin wallet connections.
 * Manages multiple wallet adapters, handles connection state, and provides
 * a unified interface for wallet operations.
 *
 * @example
 * ```typescript
 * import { BTCWalletManager } from '@btc-connect/core';
 *
 * // Create manager with callbacks
 * const manager = new BTCWalletManager({
 *   onStateChange: (state) => console.log('State:', state),
 *   onError: (error) => console.error('Error:', error)
 * });
 *
 * // Initialize adapters for installed wallets
 * manager.initializeAdapters();
 *
 * // Get available wallets
 * const wallets = manager.getAvailableWallets();
 * console.log('Available:', wallets);
 *
 * // Connect to a wallet
 * const accounts = await manager.connect('unisat');
 * console.log('Connected:', accounts);
 *
 * // Get current state
 * const state = manager.getState();
 *
 * // Listen to events
 * manager.on('accountChange', (accounts) => {
 *   console.log('Account changed:', accounts);
 * });
 *
 * // Disconnect
 * await manager.disconnect();
 *
 * // Clean up
 * manager.destroy();
 * ```
 */
export class BTCWalletManager implements WalletManager {
  public config: WalletManagerConfig;
  private adapters: Map<string, BTCWalletAdapter> = new Map();
  private currentAdapter: BTCWalletAdapter | null = null;
  private eventManager: WalletEventManager = new WalletEventManager();
  private isDestroyed = false;

  /**
   * Creates a new BTCWalletManager instance.
   *
   * @param config - Manager configuration including callbacks
   *
   * @example
   * ```typescript
   * const manager = new BTCWalletManager({
   *   onStateChange: (state) => console.log('State changed:', state),
   *   onError: (error) => console.error('Error:', error)
   * });
   * ```
   */
  constructor(config: WalletManagerConfig = {}) {
    this.config = { ...config };
  }

  /**
   * Initializes adapters for all installed wallets.
   * Automatically detects and registers available wallet adapters.
   *
   * @example
   * ```typescript
   * const manager = new BTCWalletManager();
   * manager.initializeAdapters();
   * // Now adapters for UniSat, OKX, etc. are registered
   * ```
   */
  public initializeAdapters(): void {
    console.log('[BTC-Connect:Core] Initializing adapters...');
    const availableAdapters = getAvailableAdapters();

    for (const adapter of availableAdapters) {
      console.log(`[BTC-Connect:Core] Registering adapter: ${adapter.id}`);
      this.register(adapter);
    }
  }

  /**
   * Registers a wallet adapter with the manager.
   *
   * @param adapter - The wallet adapter to register
   * @throws {Error} If the manager has been destroyed
   *
   * @example
   * ```typescript
   * import { UniSatAdapter } from '@btc-connect/core';
   *
   * const manager = new BTCWalletManager();
   * manager.register(new UniSatAdapter());
   * ```
   */
  register(adapter: BTCWalletAdapter): void {
    if (this.isDestroyed) {
      throw new Error('WalletManager has been destroyed');
    }

    const existingAdapter = this.adapters.get(adapter.id);
    if (existingAdapter) {
      // 如果已存在，先销毁旧的适配器
      if (existingAdapter instanceof BaseWalletAdapter) {
        existingAdapter.destroy();
      }
    }

    this.adapters.set(adapter.id, adapter);

    // 监听适配器事件
    this.setupAdapterListeners(adapter);
  }

  /**
   * Unregisters and destroys a wallet adapter.
   *
   * @param walletId - The ID of the wallet adapter to unregister
   *
   * @example
   * ```typescript
   * manager.unregister('unisat');
   * ```
   */
  unregister(walletId: string): void {
    const adapter = this.adapters.get(walletId);
    if (adapter) {
      // 如果是当前适配器，先断开连接
      if (this.currentAdapter === adapter) {
        this.disconnect().catch(() => {
          // 忽略断开连接的错误
        });
      }

      // 销毁适配器
      if (adapter instanceof BaseWalletAdapter) {
        adapter.destroy();
      }

      this.adapters.delete(walletId);
    }
  }

  /**
   * Gets a specific wallet adapter by ID.
   *
   * @param walletId - The wallet ID to look up
   * @returns The adapter instance, or null if not found
   *
   * @example
   * ```typescript
   * const adapter = manager.getAdapter('unisat');
   * if (adapter) {
   *   console.log('Adapter found:', adapter.name);
   * }
   * ```
   */
  getAdapter(walletId: string): BTCWalletAdapter | null {
    return this.adapters.get(walletId) || null;
  }

  /**
   * Gets all registered wallet adapters.
   *
   * @returns Array of all registered adapters
   *
   * @example
   * ```typescript
   * const adapters = manager.getAllAdapters();
   * console.log('Registered wallets:', adapters.map(a => a.id));
   * ```
   */
  getAllAdapters(): BTCWalletAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Gets list of installed and ready wallets.
   *
   * @returns Array of wallet info objects for available wallets
   *
   * @example
   * ```typescript
   * const wallets = manager.getAvailableWallets();
   * wallets.forEach(w => console.log(`${w.name}: ${w.id}`));
   * ```
   */
  getAvailableWallets(): WalletInfo[] {
    console.log('=== getAvailableWallets Debug ===');
    const allAdapters = this.getAllAdapters();
    const availableWallets = allAdapters.filter((adapter) => {
      const isReady = adapter.isReady();
      console.log(`Adapter ${adapter.id}: isReady = ${isReady}`);
      return isReady;
    });

    const walletInfos = availableWallets.map((adapter) => ({
      id: adapter.id,
      name: adapter.name,
      icon: adapter.icon,
    }));

    console.log('Available wallet infos:', walletInfos);
    return walletInfos;
  }

  /**
   * Connects to a specific wallet.
   *
   * @param walletId - The ID of the wallet to connect
   * @returns Promise resolving to connected account info
   * @throws {Error} If manager is destroyed or wallet not found
   *
   * @example
   * ```typescript
   * try {
   *   const accounts = await manager.connect('unisat');
   *   console.log('Connected:', accounts[0].address);
   * } catch (error) {
   *   console.error('Connection failed:', error);
   * }
   * ```
   */
  async connect(walletId: string): Promise<AccountInfo[]> {
    if (this.isDestroyed) {
      throw new Error('WalletManager has been destroyed');
    }

    const adapter = this.getAdapter(walletId);
    if (!adapter) {
      throw new Error(`Wallet ${walletId} not found`);
    }

    // 如果已经有连接的适配器，先断开
    if (this.currentAdapter && this.currentAdapter !== adapter) {
      await this.disconnect();
    }

    try {
      console.log(`[BTC-Connect:Core] Connecting to wallet: ${walletId}`);
      // 连接钱包（由外层控制超时/交互）
      const accounts = await adapter.connect();

      this.currentAdapter = adapter;
      console.log(`[BTC-Connect:Core] Successfully connected to ${walletId}`, accounts);

      // 发射连接事件
      this.eventManager.emitConnect(walletId, accounts);

      // 调用状态变化回调
      if (this.config.onStateChange) {
        this.config.onStateChange(this.getState());
      }

      return accounts;
    } catch (error) {
      // 调用错误处理回调
      if (this.config.onError) {
        this.config.onError(
          error instanceof Error ? error : new Error(String(error)),
        );
      }

      // 发射错误事件
      const walletError =
        error instanceof WalletError
          ? error
          : new WalletError(
            error instanceof Error ? error.message : String(error),
            'UNKNOWN_ERROR',
            {},
            error instanceof Error ? error : undefined,
          );
      this.eventManager.emitError(this.currentAdapter?.id ?? 'unknown', walletError);

      throw error;
    }
  }

  /**
   * Adopts an existing authorized session without triggering a new authorization popup.
   * Useful for restoring connections on page reload.
   *
   * @param walletId - The wallet ID to assume connection for
   * @returns Connected account info if successful, null otherwise
   *
   * @example
   * ```typescript
   * // On page reload, try to restore connection
   * const accounts = await manager.assumeConnected('unisat');
   * if (accounts) {
   *   console.log('Restored connection:', accounts[0].address);
   * }
   * ```
   */
  async assumeConnected(walletId: string): Promise<AccountInfo[] | null> {
    const adapter = this.getAdapter(walletId);
    if (!adapter) return null;

    // 如果已经是当前适配器并且有账户，直接返回
    const state = adapter.getState();
    if (this.currentAdapter?.id === walletId && state.accounts.length > 0) {
      return state.accounts;
    }

    try {
      // 尝试静默获取账户
      const accounts = await adapter.getAccounts();
      if (!accounts || accounts.length === 0) return null;

      // 标记为当前适配器并更新为已连接状态
      this.currentAdapter = adapter;

      if (adapter instanceof BaseWalletAdapter) {
        (adapter as any).state = {
          ...(adapter as any).state,
          status: 'connected',
          accounts,
          currentAccount: accounts[0],
        };
        (adapter as any).isConnected = true;
      }

      // 只获取必要的网络信息（更快），移除公钥和余额的自动获取
      try {
        await adapter.getNetwork();
      } catch { }

      this.eventManager.emitConnect(walletId, (adapter as any).state.accounts);
      if (this.config.onStateChange) {
        this.config.onStateChange(this.getState());
      }
      return accounts;
    } catch {
      return null;
    }
  }

  /**
   * Disconnects from the currently connected wallet.
   *
   * @example
   * ```typescript
   * await manager.disconnect();
   * console.log('Disconnected');
   * ```
   */
  async disconnect(): Promise<void> {
    if (this.currentAdapter) {
      const adapterId = this.currentAdapter.id;
      try {
        await this.currentAdapter.disconnect();
      } catch (error) {
        // 忽略断开连接的错误
        console.warn('Error disconnecting wallet:', error);
      } finally {
        console.log(`[BTC-Connect:Core] Disconnected from ${adapterId}`);
        this.currentAdapter = null;
        this.eventManager.emitDisconnect(adapterId);

        // 调用状态变化回调
        if (this.config.onStateChange) {
          this.config.onStateChange(this.getState());
        }
      }
    }
  }

  /**
   * Switches to a different wallet.
   * Disconnects current wallet and connects to the new one.
   *
   * @param walletId - The wallet ID to switch to
   * @returns Promise resolving to connected account info
   *
   * @example
   * ```typescript
   * const accounts = await manager.switchWallet('okx');
   * console.log('Switched to OKX:', accounts[0].address);
   * ```
   */
  async switchWallet(walletId: string): Promise<AccountInfo[]> {
    return await this.connect(walletId);
  }

  /**
   * Gets the current wallet connection state.
   *
   * @returns Current wallet state including status, accounts, and network
   *
   * @example
   * ```typescript
   * const state = manager.getState();
   * console.log('Status:', state.status);
   * console.log('Accounts:', state.accounts);
   * console.log('Network:', state.network);
   * ```
   */
  getState(): WalletState {
    if (this.currentAdapter) {
      return this.currentAdapter.getState();
    }

    return {
      status: 'disconnected',
      accounts: [],
      currentAccount: undefined,
      network: undefined,
      error: undefined,
    };
  }

  /**
   * Gets the currently active wallet adapter.
   *
   * @returns The current adapter, or null if not connected
   *
   * @example
   * ```typescript
   * const adapter = manager.getCurrentAdapter();
   * if (adapter) {
   *   const balance = await adapter.getBalance();
   * }
   * ```
   */
  getCurrentAdapter(): BTCWalletAdapter | null {
    return this.currentAdapter;
  }

  /**
   * Gets information about the currently connected wallet.
   *
   * @returns Wallet info object, or null if not connected
   *
   * @example
   * ```typescript
   * const wallet = manager.getCurrentWallet();
   * if (wallet) {
   *   console.log('Connected to:', wallet.name);
   * }
   * ```
   */
  getCurrentWallet(): WalletInfo | null {
    if (!this.currentAdapter) {
      return null;
    }

    return {
      id: this.currentAdapter.id,
      name: this.currentAdapter.name,
      icon: this.currentAdapter.icon,
    };
  }

  /**
   * Registers an event listener for wallet events.
   *
   * @template T - The event type
   * @param event - The event name to listen for
   * @param handler - The callback function
   *
   * @example
   * ```typescript
   * manager.on('connect', (walletId, accounts) => {
   *   console.log('Connected:', walletId);
   * });
   * manager.on('accountChange', (walletId, accounts) => {
   *   console.log('Account changed');
   * });
   * ```
   */
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
    this.eventManager.on(event, handler);
  }

  /**
   * Removes a previously registered event listener.
   *
   * @template T - The event type
   * @param event - The event name
   * @param handler - The callback function to remove
   *
   * @example
   * ```typescript
   * const handler = (walletId, accounts) => console.log(accounts);
   * manager.on('accountChange', handler);
   * manager.off('accountChange', handler);
   * ```
   */
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
    this.eventManager.off(event, handler);
  }

  /**
   * Switches the connected wallet to a different network.
   *
   * @param network - The target network ('mainnet', 'testnet', 'regtest')
   * @throws {Error} If no wallet connected or network switching not supported
   *
   * @example
   * ```typescript
   * await manager.switchNetwork('testnet');
   * console.log('Switched to testnet');
   * ```
   */
  async switchNetwork(network: string): Promise<void> {
    if (this.isDestroyed) {
      throw new Error('WalletManager has been destroyed');
    }

    if (!this.currentAdapter) {
      throw new Error('No wallet connected');
    }

    if (!this.currentAdapter.switchNetwork) {
      throw new Error('Network switching not supported by current wallet');
    }

    try {
      await this.currentAdapter.switchNetwork(network as any);

      // 发射网络变化事件
      this.eventManager.emitNetworkChange(
        this.currentAdapter!.id,
        network as any,
      );

      // 调用状态变化回调
      if (this.config.onStateChange) {
        this.config.onStateChange(this.getState());
      }
    } catch (error) {
      // 调用错误处理回调
      if (this.config.onError) {
        this.config.onError(
          error instanceof Error ? error : new Error(String(error)),
        );
      }

      // 发射错误事件
      const walletError =
        error instanceof WalletError
          ? error
          : new WalletError(
            error instanceof Error ? error.message : String(error),
            'UNKNOWN_ERROR',
            {},
            error instanceof Error ? error : undefined,
          );
      this.eventManager.emitError(this.currentAdapter?.id ?? 'unknown', walletError);

      throw error;
    }
  }

  /**
   * Destroys the manager and cleans up all resources.
   * Disconnects all wallets and removes all event listeners.
   *
   * @example
   * ```typescript
   * manager.destroy();
   * // Manager is no longer usable
   * ```
   */
  destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // 断开所有连接
    this.disconnect().catch(() => {
      // 忽略断开连接的错误
    });

    // 销毁所有适配器
    for (const adapter of this.adapters.values()) {
      if (adapter instanceof BaseWalletAdapter) {
        adapter.destroy();
      }
    }

    // 清理适配器映射
    this.adapters.clear();

    // 销毁事件管理器
    this.eventManager.destroy();

    this.currentAdapter = null;
  }

  /**
   * 设置适配器事件监听器
   */
  private setupAdapterListeners(adapter: BTCWalletAdapter): void {
    // 监听适配器的所有事件并转发
    const events: WalletEvent[] = [
      'connect',
      'disconnect',
      'accountChange',
      'networkChange',
      'error',
    ];

    for (const event of events) {
      adapter.on(event, (...args: any[]) => {
        // 如果不是当前适配器，不转发事件
        if (adapter !== this.currentAdapter) return;

        // 转发事件
        this.eventManager.emit(event, ...args);

        // 如果是状态变化事件，调用回调
        if (
          (event === 'accountChange' || event === 'networkChange') &&
          this.config.onStateChange
        ) {
          this.config.onStateChange(this.getState());
        }

        // 如果是错误事件，调用错误处理回调
        if (event === 'error' && this.config.onError) {
          const error = args[0] as Error;
          this.config.onError(error);
        }
      });
    }
  }
}
