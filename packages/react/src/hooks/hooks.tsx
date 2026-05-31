import type { EventHandler } from '@btc-connect/core';
import { useCallback, useEffect, useState } from 'react';
import { useWalletContext } from '../context/provider';
import type { Network, WalletEvent } from '../types';
import { formatAddressShort, normalizeBalance } from '../utils';

/**
 * 使用钱包状态的Hook - 增强版本，统一访问点
 *
 * 提供所有钱包相关功能的统一访问入口，包括：
 * - 基础钱包状态和账户信息
 * - 连接和断开操作
 * - 网络管理功能
 * - 事件监听功能
 * - 模态框控制功能
 * - 签名和交易功能
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const wallet = useWallet();
 *
 *   // 基础状态
 *   console.log('连接状态:', wallet.status);
 *   console.log('当前地址:', wallet.address);
 *
 *   // 连接操作
 *   const handleConnect = () => wallet.connect?.('unisat');
 *
 *   // 网络切换
 *   const handleSwitchNetwork = async () => {
 *     try {
 *       await wallet.switchNetwork?.('mainnet');
 *     } catch (error) {
 *       console.error('网络切换失败:', error.message);
 *     }
 *   };
 *
 *   // 事件监听
 *   wallet.useWalletEvent?.('accountChange', (accounts) => {
 *     console.log('账户变化:', accounts);
 *   });
 *
 *   return (
 *     <div>
 *       <p>状态: {wallet.status}</p>
 *       <p>地址: {wallet.address}</p>
 *       <button onClick={handleConnect}>连接钱包</button>
 *       <button onClick={handleSwitchNetwork}>切换网络</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWallet() {
  const context = useWalletContext();
  const {
    state,
    currentWallet,
    isConnected,
    isConnecting,
    disconnect,
    connect,
    switchWallet,
    availableWallets,
    manager,
    isModalOpen,
    openModal,
    closeModal,
    toggleModal,
  } = context;

  // 使用选择器避免不必要的重渲染
  const status = state.status;
  const accounts = state.accounts;
  const currentAccount = state.currentAccount;
  const network = state.network;
  const error = state.error;

  // 计算属性
  const address = currentAccount?.address || null;
  const balance = normalizeBalance(currentAccount?.balance);
  const publicKey = currentAccount?.publicKey || null;

  // 网络切换功能
  const switchNetwork = useCallback(
    async (targetNetwork: Network) => {
      if (!manager) {
        throw new Error('钱包管理器未初始化');
      }

      const currentWallet = manager.getCurrentWallet();
      if (!currentWallet) {
        throw new Error('没有连接的钱包，请先连接钱包');
      }

      try {
        return await manager.switchNetwork(targetNetwork);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('No wallet connected')) {
            throw new Error('没有连接的钱包，请先连接钱包');
          }
          if (error.message.includes('Network switching not supported')) {
            throw new Error(
              `当前钱包 ${currentWallet.name} 不支持网络切换，请手动在钱包中切换网络`,
            );
          }
          throw error;
        }
        throw new Error('网络切换失败');
      }
    },
    [manager],
  );

  // 事件监听功能
  const useWalletEvent = <T extends WalletEvent>(
    event: T,
    handler: EventHandler<T>,
  ) => {
    useEffect(() => {
      if (!manager) return;

      manager.on(event, handler);
      return () => {
        manager.off(event, handler);
      };
    }, [event, handler]);
  };

  // 签名功能
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!manager) {
        throw new Error('Wallet manager not initialized');
      }
      const adapter = manager.getCurrentAdapter();
      if (!adapter || !adapter.signMessage) {
        throw new Error('Sign message is not supported by current wallet');
      }
      return await adapter.signMessage(message);
    },
    [manager],
  );

  const signPsbt = useCallback(
    async (psbt: string): Promise<string> => {
      if (!manager) {
        throw new Error('Wallet manager not initialized');
      }
      const adapter = manager.getCurrentAdapter();
      if (!adapter || !adapter.signPsbt) {
        throw new Error('Sign PSBT is not supported by current wallet');
      }
      return await adapter.signPsbt(psbt);
    },
    [manager],
  );

  // 交易功能
  const sendBitcoin = useCallback(
    async (to: string, amount: number): Promise<string> => {
      if (!manager) {
        throw new Error('Wallet manager not initialized');
      }
      const adapter = manager.getCurrentAdapter();
      if (!adapter || !adapter.sendBitcoin) {
        throw new Error('Send Bitcoin is not supported by current wallet');
      }
      return await adapter.sendBitcoin(to, amount);
    },
    [manager],
  );

  // 获取当前适配器
  const currentAdapter = manager?.getCurrentAdapter() || null;

  // 获取所有适配器
  const allAdapters = manager?.getAllAdapters() || [];

  return {
    // === 基础状态 ===
    status,
    accounts,
    currentAccount,
    network,
    error,
    currentWallet,
    isConnected,
    isConnecting,
    address,
    balance,
    publicKey,

    // === 连接操作 ===
    connect,
    disconnect,
    switchWallet,
    availableWallets,

    // === 网络管理 ===
    switchNetwork,

    // === 事件监听功能 ===
    useWalletEvent,

    // === 模态框控制 ===
    walletModal: {
      isModalOpen,
      openModal,
      closeModal,
      toggleModal,
    },

    // === 钱包管理器功能 ===
    currentAdapter,
    allAdapters,
    manager,

    // === 签名功能 ===
    signMessage,
    signPsbt,

    // === 交易功能 ===
    sendBitcoin,

    // === 工具函数快捷访问 ===
    utils: {
      formatAddress: (address: string, options?: any) => {
        // 动态导入以避免循环依赖
        return import('../utils').then((m) =>
          m.formatAddress(address, options),
        );
      },
      formatBalance: (satoshis: number, options?: any) => {
        return import('../utils').then((m) =>
          m.formatBalance(satoshis, options),
        );
      },
    },
  };
}

/**
 * Hook for wallet connection operations.
 * Provides methods for connecting, disconnecting, and switching wallets.
 *
 * @returns Object with connection methods and available wallets
 * @returns {Function} connect - Connect to a wallet by ID
 * @returns {Function} disconnect - Disconnect current wallet
 * @returns {Function} switchWallet - Switch to a different wallet
 * @returns {WalletInfo[]} availableWallets - List of available wallets
 *
 * @example
 * ```tsx
 * import { useConnectWallet } from '@btc-connect/react';
 *
 * function ConnectButton() {
 *   const { connect, disconnect, availableWallets } = useConnectWallet();
 *   return <button onClick={() => connect('unisat')}>Connect</button>;
 * }
 * ```
 */
export function useConnectWallet() {
  const { connect, disconnect, switchWallet, availableWallets } =
    useWalletContext();

  return {
    connect,
    disconnect,
    switchWallet,
    availableWallets,
  };
}

/**
 * Hook for listening to wallet events with automatic cleanup.
 * Automatically manages event listener lifecycle - removes listener on unmount.
 *
 * @param event - The wallet event type to listen for
 * @param handler - Callback function to handle the event
 *
 * @example
 * ```tsx
 * import { useWalletEvent } from '@btc-connect/react';
 *
 * function MyComponent() {
 *   useWalletEvent('connect', (accounts) => {
 *     console.log('Wallet connected:', accounts);
 *   });
 *   return <div>Listening...</div>;
 * }
 * ```
 */
export function useWalletEvent(
  event: WalletEvent,
  handler: (...args: any[]) => void,
) {
  const { manager } = useWalletContext();

  useEffect(() => {
    if (!manager) return;

    manager.on(event, handler);
    return () => {
      manager.off(event, handler);
    };
  }, [manager, event, handler]);
}

/**
 * Hook for network management and switching.
 *
 * Provides current network state and method to switch networks.
 *
 * @returns An object containing network state and switching method
 * @returns {Network} returns.network - Current network (e.g., 'mainnet', 'testnet')
 * @returns {Function} returns.switchNetwork - Switch to a different network
 *
 * @example
 * ```tsx
 * import { useNetwork } from '@btc-connect/react';
 *
 * function NetworkSwitcher() {
 *   const { network, switchNetwork } = useNetwork();
 *
 *   const handleSwitch = async () => {
 *     try {
 *       await switchNetwork('testnet');
 *       console.log('Switched to testnet');
 *     } catch (error) {
 *       console.error('Failed to switch network:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <p>Current Network: {network}</p>
 *       <button onClick={handleSwitch}>Switch to Testnet</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useNetwork() {
  const { state, manager } = useWalletContext();

  // 使用 useState 避免不必要的重渲染
  const [network, setNetwork] = useState(state.network);

  useEffect(() => {
    if (!manager) return;

    const handleNetworkChange = (params: { network: Network }) => {
      setNetwork(params.network);
    };

    manager.on('networkChange', handleNetworkChange);
    return () => {
      manager.off('networkChange', handleNetworkChange);
    };
  }, [manager]);

  // 同步初始网络状态
  useEffect(() => {
    if (manager) {
      const currentNetwork = state.network;
      if (currentNetwork) {
        setNetwork(currentNetwork);
      }
    }
  }, [manager, state.network]);

  // 使用 useCallback 优化函数引用
  const switchNetwork = useCallback(
    async (targetNetwork: Network) => {
      if (!manager) {
        throw new Error('钱包管理器未初始化');
      }

      // 检查是否有连接的钱包
      const currentWallet = manager.getCurrentWallet();
      if (!currentWallet) {
        throw new Error('没有连接的钱包，请先连接钱包');
      }

      try {
        return await manager.switchNetwork(targetNetwork);
      } catch (error) {
        // 根据不同的错误类型提供更友好的错误消息
        if (error instanceof Error) {
          if (error.message.includes('No wallet connected')) {
            throw new Error('没有连接的钱包，请先连接钱包');
          }
          if (error.message.includes('Network switching not supported')) {
            throw new Error(
              `当前钱包 ${currentWallet.name} 不支持网络切换，请手动在钱包中切换网络`,
            );
          }
          // 重新抛出原始错误
          throw error;
        }
        throw new Error('网络切换失败');
      }
    },
    [manager],
  );

  return {
    network,
    switchNetwork,
  };
}


/**
 * Hook for accessing account information.
 * Provides access to connected wallet accounts and current account details.
 *
 * @returns Object with account information
 * @returns {AccountInfo[]} accounts - List of all connected accounts
 * @returns {AccountInfo|null} currentAccount - Currently selected account
 * @returns {boolean} hasAccounts - Whether any accounts are connected
 *
 * @example
 * ```tsx
 * import { useAccount } from '@btc-connect/react';
 *
 * function AccountInfo() {
 *   const { accounts, currentAccount, hasAccounts } = useAccount();
 *   if (!hasAccounts) return <p>No accounts</p>;
 *   return <p>Address: {currentAccount?.address}</p>;
 * }
 * ```
 */
export function useAccount() {
  const { state } = useWalletContext();

  return {
    accounts: state.accounts,
    currentAccount: state.currentAccount,
    hasAccounts: state.accounts.length > 0,
  };
}

/**
 * Hook for accessing balance information.
 * Provides balance details including confirmed, unconfirmed, and total balance.
 *
 * @returns Object with balance information
 * @returns {BalanceDetail|null} balance - Full balance details
 * @returns {number} confirmedBalance - Confirmed balance in satoshis
 * @returns {number} unconfirmedBalance - Unconfirmed balance in satoshis
 * @returns {number} totalBalance - Total balance in satoshis
 *
 * @example
 * ```tsx
 * import { useBalance } from '@btc-connect/react';
 *
 * function BalanceDisplay() {
 *   const { totalBalance, confirmedBalance } = useBalance();
 *   return <p>Balance: {totalBalance} sats</p>;
 * }
 * ```
 */
export function useBalance() {
  const { state } = useWalletContext();

  const balance = normalizeBalance(state.currentAccount?.balance);

  return {
    balance,
    confirmedBalance: balance?.confirmed || 0,
    unconfirmedBalance: balance?.unconfirmed || 0,
    totalBalance: balance?.total || 0,
  };
}

/**
 * Hook for accessing wallet information.
 * Provides information about the current wallet and available wallets.
 *
 * @returns Object with wallet information
 * @returns {WalletInfo|null} currentWallet - Currently connected wallet
 * @returns {WalletInfo[]} availableWallets - List of available wallets
 * @returns {boolean} hasWallets - Whether any wallets are available
 *
 * @example
 * ```tsx
 * import { useWalletInfo } from '@btc-connect/react';
 *
 * function WalletList() {
 *   const { currentWallet, availableWallets } = useWalletInfo();
 *   return (
 *     <ul>
 *       {availableWallets.map((w) => (
 *         <li key={w.id}>{w.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useWalletInfo() {
  const { currentWallet, availableWallets } = useWalletContext();

  return {
    currentWallet,
    availableWallets,
    hasWallets: availableWallets.length > 0,
  };
}

/**
 * Hook for refreshing account information.
 *
 * @deprecated This functionality is now integrated into useWallet.
 * Provides a method to manually refresh account information.
 *
 * @returns An object containing the refresh method
 * @returns {Function} returns.refreshAccountInfo - Refresh account details
 *
 * @example
 * ```tsx
 * import { useRefreshAccountInfo } from '@btc-connect/react';
 *
 * function RefreshButton() {
 *   const { refreshAccountInfo } = useRefreshAccountInfo();
 *
 *   return (
 *     <button onClick={refreshAccountInfo}>
 *       Refresh Account Info
 *     </button>
 *   );
 * }
 * ```
 */
export function useRefreshAccountInfo() {
  const { refreshAccountInfo } = useWalletContext();

  return {
    refreshAccountInfo,
  };
}
