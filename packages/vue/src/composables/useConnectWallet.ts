import { watch } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * Wallet connection operations Composable
 *
 * Provides wallet connection, disconnection, and switching functionality.
 *
 * @returns Connection methods and available wallets
 * @returns {(walletId: string) => Promise<AccountInfo[]>} returns.connect - Connect to a wallet
 * @returns {() => Promise<void>} returns.disconnect - Disconnect current wallet
 * @returns {(walletId: string) => Promise<AccountInfo[]>} returns.switchWallet - Switch to another wallet
 * @returns {Ref<WalletInfo[]>} returns.availableWallets - List of available wallets
 *
 * @example
 * ```vue
 * <script setup>
 * import { useConnectWallet } from '@btc-connect/vue';
 *
 * const { connect, disconnect, switchWallet, availableWallets } = useConnectWallet();
 *
 * const handleConnect = async (walletId: string) => {
 *   const accounts = await connect(walletId);
 *   console.log('Connected:', accounts);
 * };
 * </script>
 *
 * <template>
 *   <div>
 *     <button v-for="wallet in availableWallets" :key="wallet.id" @click="handleConnect(wallet.id)">
 *       Connect {{ wallet.name }}
 *     </button>
 *   </div>
 * </template>
 * ```
 */

/**
 * Use connection functionality Composable
 */
export function useConnectWallet() {
  const ctx = useWalletContext();

  // 直接返回响应式引用，不要用 computed 包装
  const availableWallets = ctx.availableWallets;

  // 监听钱包列表变化
  watch(
    availableWallets,
    (newWallets, oldWallets) => {
      // 强制触发响应式更新
      if (newWallets?.length !== oldWallets?.length) {
        ctx._stateUpdateTrigger.value++;
      }
    },
    { immediate: true, deep: true },
  );

  return {
    connect: ctx.connect,
    disconnect: ctx.disconnect,
    switchWallet: ctx.switchWallet,
    availableWallets,
  };
}
