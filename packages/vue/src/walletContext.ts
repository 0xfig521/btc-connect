import {
  type AccountInfo,
  type BalanceDetail,
  BTCWalletManager,
  type ConnectionStatus,
  type ModalConfig,
  type Network,
  type WalletInfo,
  type WalletState,
} from '@btc-connect/core';
import type { App } from 'vue';
import { type ComputedRef, computed, inject, nextTick, type Ref, ref } from 'vue';
import { storage, WalletDetectionManager } from './utils';

/**
 * Wallet context interface
 *
 * Provides access to wallet manager, state, and operations.
 * This is the core context used by all wallet composables.
 */
export interface WalletContext {
  manager: Ref<BTCWalletManager | null>;
  state: ComputedRef<WalletState>;
  currentWallet: ComputedRef<WalletInfo | null>;
  availableWallets: Ref<WalletInfo[]>;
  isConnected: ComputedRef<boolean>;
  isConnecting: ComputedRef<boolean>;
  isModalOpen: Ref<boolean>;

  // 钱包检测管理器
  detectionManager: Ref<WalletDetectionManager | null>;
  isDetecting: ComputedRef<boolean>;

  // 操作方法
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;

  // 钱包检测方法
  startWalletDetection: (options?: {
    autoConnect?: boolean;
    connectTimeout?: number;
  }) => Promise<void>;
  stopWalletDetection: () => void;

  // 内部状态更新trigger (仅供内部使用)
  _stateUpdateTrigger: Ref<number>;
}

// Injection key - use Symbol for uniqueness
const BTC_WALLET_CONTEXT_KEY = Symbol('btc-wallet-context');

// For backward compatibility, keep global state (but no longer recommended)
let globalContext: WalletContext | null = null;

/**
 * Get wallet context - recommended to use Vue provide/inject system
 *
 * @returns Wallet context containing manager, state, and operations
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWalletContext } from '@btc-connect/vue';
 *
 * const ctx = useWalletContext();
 *
 * // Access wallet state
 * console.log('Connected:', ctx.isConnected.value);
 * console.log('Address:', ctx.state.value.currentAccount?.address);
 * </script>
 * ```
 */
export function useWalletContext(): WalletContext {
  // 尝试从 Vue 的注入系统中获取上下文
  const injectedContext = inject<WalletContext | null>(
    BTC_WALLET_CONTEXT_KEY,
    null,
  );

  if (injectedContext) {
    return injectedContext;
  }

  // 回退到全局状态（向后兼容）
  // SSR 环境检查：如果在服务器端，返回一个空的上下文
  if (typeof window === 'undefined') {
    return createEmptyContext();
  }

  if (!globalContext) {
    globalContext = createWalletContext();
  }

  // 确保上下文是响应式的
  const context = globalContext;

  // 添加全局状态监听器，定期检查状态变化
  if (typeof window !== 'undefined') {
    setInterval(() => {
      // 使用全局状态监听器，但要先确保它存在
      if (context?.manager?.value) {
        const currentState = context.manager.value.getState();
        if (currentState.status === 'connected') {
        }
      }
    }, 3000); // 每3秒检查一次
  }

  return context;
}

/**
 * Get context directly from Vue inject system (recommended)
 *
 * This function ensures the context is provided by BTCWalletPlugin.
 * Use this when you want strict type safety and explicit plugin requirement.
 *
 * @returns Wallet context
 * @throws Error if used outside of BTCWalletPlugin
 *
 * @example
 * ```vue
 * <script setup>
 * import { useProvidedWalletContext } from '@btc-connect/vue';
 *
 * // This will throw if BTCWalletPlugin is not installed
 * const ctx = useProvidedWalletContext();
 * </script>
 * ```
 */
export function useProvidedWalletContext(): WalletContext {
  const context = inject<WalletContext>(BTC_WALLET_CONTEXT_KEY);

  if (!context) {
    throw new Error(
      'useProvidedWalletContext must be used within a BTCWalletPlugin. ' +
      'Make sure you have installed BTCWalletPlugin in your app.',
    );
  }

  return context;
}

// Create wallet context (internal function, not exported)
function createWalletContext(): WalletContext {
  // SSR protection: only initialize manager on client
  const manager = ref<BTCWalletManager | null>(null);

  // Modal state
  const isModalOpen = ref(false);

  // Connection state
  const isConnectingValue = ref(false);

  // Available wallets list
  const availableWallets = ref<WalletInfo[]>([]);

  // Wallet detection manager
  const detectionManager = ref<WalletDetectionManager | null>(null);

  // Force update trigger
  const stateUpdateTrigger = ref(0);

  // Computed properties - depend on trigger for forced updates
  const state = computed(() => {
    const managerState = manager.value?.getState() || {
      status: 'disconnected' as ConnectionStatus,
      accounts: [],
      currentAccount: undefined,
      network: 'livenet' as Network,
      error: undefined,
    };

    if (manager.value) {
      return manager.value.getState();
    }

    return managerState;
  });

  const currentWallet = computed(
    () => manager.value?.getCurrentWallet() || null,
  );
  const isConnected = computed(() => state.value.status === 'connected');
  const isConnecting = computed(
    () => isConnectingValue.value || state.value.status === 'connecting',
  );
  const isDetecting = computed(
    () => detectionManager.value?.isActive() || false,
  );

  // Connect method
  const connect = async (walletId: string): Promise<AccountInfo[]> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    try {
      isConnectingValue.value = true;
      const accounts = await manager.value.connect(walletId);

      if (accounts.length > 0) {
        storage.set('btc-connect:last-wallet-id', walletId);
        console.log(`💾 [walletContext] Saved wallet ID: ${walletId}`);
      }

      return accounts;
    } catch (error) {
      console.error('❌ [walletContext] Failed to connect wallet:', error);
      throw error;
    } finally {
      isConnectingValue.value = false;
    }
  };

  const disconnect = async (): Promise<void> => {
    if (!manager.value) return;

    try {
      await manager.value.disconnect();
      storage.remove('btc-connect:last-wallet-id');
      console.log('🗑️ [walletContext] Cleared saved wallet ID');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const switchWallet = async (walletId: string): Promise<AccountInfo[]> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    try {
      isConnectingValue.value = true;
      const accounts = await manager.value.connect(walletId);
      return accounts;
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      throw error;
    } finally {
      isConnectingValue.value = false;
    }
  };

  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const toggleModal = () => {
    isModalOpen.value = !isModalOpen.value;
  };

  // Wallet detection methods
  const startWalletDetection = async (options?: {
    autoConnect?: boolean;
    connectTimeout?: number;
  }): Promise<void> => {
    if (!manager.value) return;

    const {
      autoConnect: enableAutoConnect = false,
      connectTimeout: timeout = 5000,
    } = options || {};

    detectionManager.value = new WalletDetectionManager({
      timeout: 20000,
      interval: 10000,
      immediateInterval: 1000,
      maxImmediateChecks: 5,
    }) as WalletDetectionManager;

    detectionManager.value.on('walletDetected', (params) => {
      console.log(`🆕 [walletContext] New wallet detected: ${params.walletId}`);
      const currentWallets = context.availableWallets.value;
      const walletExists = currentWallets.some((w) => w.id === params.walletId);
      if (!walletExists) {
        context.availableWallets.value = [...currentWallets, params.walletInfo];
      }
      if (enableAutoConnect) {
        const lastWalletId = storage.get<string>('btc-connect:last-wallet-id');
        if (lastWalletId === params.walletId) {
          console.log(
            `🎯 [walletContext] Detected last connected wallet ${params.walletId}, attempting auto-connect`,
          );
          setTimeout(() => {
            if (manager.value && manager.value instanceof BTCWalletManager) {
              attemptAutoConnect(manager.value, timeout);
            }
          }, 100);
        }
      }
    });

    detectionManager.value.on('availableWallets', (params) => {
      console.log(
        `📱 [walletContext] Available wallets updated: ${params.wallets.length} wallets`,
      );
      context.availableWallets.value = params.wallets;
      context._stateUpdateTrigger.value++;
    });

    detectionManager.value.on('walletDetectionComplete', (params) => {
      console.log(
        `🏁 [walletContext] Wallet detection complete: ${params.wallets.length} wallets (${params.elapsedTime}ms)`,
      );
      const walletInfos = params.adapters.map((adapter) => ({
        id: adapter.id,
        name: adapter.name,
        icon: adapter.icon,
      }));
      context.availableWallets.value = walletInfos;
      context._stateUpdateTrigger.value++;
    });

    await detectionManager.value.startDetection();
  };

  const stopWalletDetection = (): void => {
    if (detectionManager.value) {
      detectionManager.value.stopDetection();
      detectionManager.value = null;
    }
  };

  const context: WalletContext = {
    manager: manager as Ref<BTCWalletManager | null>,
    state,
    currentWallet,
    availableWallets,
    isConnected,
    isConnecting,
    isModalOpen,
    detectionManager: detectionManager as Ref<WalletDetectionManager | null>,
    isDetecting,
    connect,
    disconnect,
    switchWallet,
    openModal,
    closeModal,
    toggleModal,
    startWalletDetection,
    stopWalletDetection,
    _stateUpdateTrigger: stateUpdateTrigger,
  };

  return context;
}

// Create empty context (for SSR)
function createEmptyContext(): WalletContext {
  const emptyRef = ref([]);
  const emptyComputed = computed(() => ({
    status: 'disconnected' as ConnectionStatus,
    accounts: [],
    currentAccount: undefined,
    network: 'livenet' as Network,
    error: undefined,
  }));

  return {
    manager: ref(null),
    state: emptyComputed,
    currentWallet: computed(() => null),
    availableWallets: emptyRef,
    isConnected: computed(() => false),
    isConnecting: computed(() => false),
    isModalOpen: ref(false),
    detectionManager: ref(null),
    isDetecting: computed(() => false),
    connect: async () => {
      throw new Error('Wallet context not initialized in SSR');
    },
    disconnect: async () => { },
    switchWallet: async () => {
      throw new Error('Wallet context not initialized in SSR');
    },
    openModal: () => { },
    closeModal: () => { },
    toggleModal: () => { },
    startWalletDetection: async () => { },
    stopWalletDetection: () => { },
    _stateUpdateTrigger: ref(0),
  };
}

/**
 * Vue plugin options interface
 */
export interface BTCWalletPluginOptions {
  autoConnect?: boolean;
  connectTimeout?: number;
  // modal配置
  modalConfig?: ModalConfig;
  // 钱包管理器配置
  config?: Omit<
    import('@btc-connect/core').WalletManagerConfig,
    'modalConfig'
  > & {
    modalConfig?: ModalConfig;
  };
}

/**
 * BTC Wallet Vue Plugin
 *
 * Vue 3 plugin that provides wallet functionality to the entire application.
 * Must be installed before using any wallet composables.
 *
 * @param app - Vue application instance
 * @param options - Plugin configuration options
 * @param options.autoConnect - Enable automatic wallet reconnection (default: true)
 * @param options.connectTimeout - Connection timeout in ms (default: 5000)
 * @param options.modalConfig - Modal configuration
 * @param options.config - Wallet manager configuration
 *
 * @example
 * ```typescript
 * // main.ts
 * import { createApp } from 'vue';
 * import { BTCWalletPlugin } from '@btc-connect/vue';
 * import App from './App.vue';
 *
 * const app = createApp(App);
 *
 * app.use(BTCWalletPlugin, {
 *   autoConnect: true,
 *   connectTimeout: 10000,
 *   theme: 'light',
 *   config: {
 *     wallets: {
 *       order: ['unisat', 'okx', 'xverse'],
 *       featured: ['unisat', 'okx']
 *     }
 *   }
 * });
 *
 * app.mount('#app');
 * ```
 *
 * @example
 * ```typescript
 * // Nuxt 3 plugin
 * // plugins/btc-connect.client.ts
 * import { BTCWalletPlugin } from '@btc-connect/vue';
 *
 * export default defineNuxtPlugin((nuxtApp) => {
 *   nuxtApp.vueApp.use(BTCWalletPlugin, {
 *     autoConnect: true,
 *     theme: 'auto'
 *   });
 * });
 * ```
 */
export const BTCWalletPlugin = {
  install(app: App, options: BTCWalletPluginOptions = {}) {
    const {
      autoConnect = true,
      connectTimeout = 5000,
      modalConfig,
      config,
    } = options;

    // 创建钱包上下文
    const context = createWalletContext();

    // 立即 provide，不等待 window 对象
    app.provide(BTC_WALLET_CONTEXT_KEY, context);

    // 提供全局属性（向后兼容）
    app.config.globalProperties.$btc = context;
    app.provide('btc', context);

    // 在客户端初始化钱包管理器
    if (typeof window !== 'undefined') {
      // 合并配置
      const finalConfig = {
        ...config,
        modalConfig: modalConfig || config?.modalConfig,
        onStateChange: (state: WalletState) => {
          context._stateUpdateTrigger.value++;

          if (state.status === 'connected' && state.currentAccount) {
            setTimeout(() => {
              fetchAccountDetails(walletManager);
            }, 100);
          }
        },
        onError: (error: Error) => {
          console.error('❌ [walletContext] Wallet error:', error);
        },
      };

      // 初始化钱包管理器
      const walletManager = new BTCWalletManager(
        finalConfig,
      ) as BTCWalletManager;

      context.manager.value = walletManager as BTCWalletManager;

      // 初始化适配器 - 这是关键步骤！
      walletManager.initializeAdapters();

      // 🚀 立即获取基础钱包列表，确保组件能立即显示钱包
      const initialWallets = walletManager.getAvailableWallets();
      context.availableWallets.value = initialWallets;
      console.log(
        `📱 [walletContext] 初始钱包列表 (${initialWallets.length}个):`,
        initialWallets.map((w) => w.name),
      );

      // 强制触发响应式更新，确保组件能立即看到初始钱包
      context._stateUpdateTrigger.value++;

      // 开始新的基于事件驱动的钱包检测
      context
        .startWalletDetection({
          autoConnect: autoConnect,
          connectTimeout: connectTimeout,
        })
        .catch((error) => {
          console.error('❌ [walletContext] 启动钱包检测失败:', error);
        });

      // 监听钱包连接事件，在连接成功后获取账户详情
      const handleConnect = () => {
        fetchAccountDetails(walletManager);
      };

      // 监听账户变化事件，用于UI更新和重新获取详情
      const handleAccountChange = () => {
        fetchAccountDetails(walletManager);
      };

      // 监听网络变化事件，用于UI更新和重新获取详情
      const handleNetworkChange = () => {
        fetchAccountDetails(walletManager);
      };

      // 监听页面可见性变化，当用户回到页面时重新检测
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          context.startWalletDetection({
            autoConnect: autoConnect,
            connectTimeout: connectTimeout,
          });
        }
      };

      // 注册钱包事件监听器
      walletManager.on('connect', handleConnect);
      walletManager.on('accountChange', handleAccountChange);
      walletManager.on('networkChange', handleNetworkChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 返回清理函数
      return () => {
        walletManager.off('connect', handleConnect);
        walletManager.off('accountChange', handleAccountChange);
        walletManager.off('networkChange', handleNetworkChange);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );

        // 销毁检测管理器
        context.stopWalletDetection();
      };
    }

    // 重置全局上下文，确保使用最新的客户端实例（向后兼容）
    globalContext = context;
  },
};

// 获取账户详细信息的函数 - 与React包保持一致
async function fetchAccountDetails(manager: BTCWalletManager): Promise<void> {
  try {
    const adapter = manager.getCurrentAdapter() as any;
    if (!adapter) return;

    const updatePayload: {
      publicKey?: string;
      balance?: BalanceDetail;
    } = {};

    try {
      const pk = await adapter.getPublicKey?.();
      if (pk) {
        updatePayload.publicKey = pk;
      }
    } catch (_error) {
      // 静默处理
    }

    try {
      const bal = await adapter.getBalance?.();
      const detail: BalanceDetail | null =
        bal &&
          typeof bal === 'object' &&
          typeof bal.confirmed === 'number' &&
          typeof bal.unconfirmed === 'number' &&
          typeof bal.total === 'number'
          ? {
            confirmed: bal.confirmed,
            unconfirmed: bal.unconfirmed,
            total: bal.total,
          }
          : null;
      if (detail) {
        updatePayload.balance = detail;
      }
    } catch (_error) {
      // 静默处理
    }

    if ((adapter as any).state?.currentAccount) {
      if (updatePayload.publicKey) {
        (adapter as any).state.currentAccount.publicKey =
          updatePayload.publicKey;
      }
      if (updatePayload.balance) {
        (adapter as any).state.currentAccount.balance = updatePayload.balance;
      }
    }
  } catch (error) {
    console.warn('[BTC-Connect] Vue: 获取账户详情失败:', error);
  }
}

// 尝试自动连接的辅助函数 - 与React包保持一致的逻辑
async function attemptAutoConnect(
  manager: BTCWalletManager,
  connectTimeout: number = 5000,
) {
  try {
    // 使用storage工具获取上次连接的钱包ID（与React包保持一致）
    const lastWalletId = storage.get<string>('btc-connect:last-wallet-id');

    if (!lastWalletId) {
      console.log(
        '📝 [attemptAutoConnect] No previous wallet connection found',
      );
      return;
    }

    console.log(
      `🔄 [attemptAutoConnect] Attempting to restore connection to: ${lastWalletId}`,
    );

    // 检查钱包是否可用
    const availableWallets = manager.getAvailableWallets();
    const isWalletAvailable = availableWallets.some(
      (w) => w.id === lastWalletId,
    );

    if (!isWalletAvailable) {
      console.warn(
        `⚠️ [attemptAutoConnect] Wallet ${lastWalletId} is not available`,
      );
      storage.remove('btc-connect:last-wallet-id');
      return;
    }

    // 添加超时处理，与React包保持一致
    const withTimeout = <T>(p: Promise<T>, ms: number) =>
      new Promise<T>((resolve, reject) => {
        const t = setTimeout(
          () => reject(new Error('autoConnect timeout')),
          ms,
        );
        p.then((v) => {
          clearTimeout(t);
          resolve(v);
        }).catch((e) => {
          clearTimeout(t);
          reject(e);
        });
      });

    // 尝试静默恢复连接，使用assumeConnected方法
    const result = await withTimeout(
      manager.assumeConnected(lastWalletId),
      connectTimeout,
    );

    if (result && result.length > 0) {
      console.log(
        `✅ [attemptAutoConnect] Successfully restored connection to ${lastWalletId}:`,
        result,
      );
      // 确保记录last wallet（与React包保持一致）
      storage.set('btc-connect:last-wallet-id', lastWalletId);
    } else {
      console.log(
        `❌ [attemptAutoConnect] No active session found for ${lastWalletId}`,
      );
      // 如果没有活跃会话，不清除存储，等待下次手动连接
    }
  } catch (error) {
    console.error(
      '❌ [attemptAutoConnect] Failed to restore wallet connection:',
      error,
    );
    // 超时或失败，忽略，不清除存储
  }
}

// 导出类型
export type { WalletState, WalletInfo, AccountInfo, Network };
