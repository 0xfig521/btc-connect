import { computed } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * Wallet information Composable
 *
 * Provides access to current wallet and available wallets information.
 *
 * @returns Wallet information
 * @returns {ComputedRef<WalletInfo | null>} returns.currentWallet - Current connected wallet info
 * @returns {ComputedRef<WalletInfo[]>} returns.availableWallets - List of available wallets
 * @returns {ComputedRef<boolean>} returns.hasWallets - Whether any wallets are available
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWalletInfo } from '@btc-connect/vue';
 *
 * const { currentWallet, availableWallets, hasWallets } = useWalletInfo();
 * </script>
 *
 * <template>
 *   <div>
 *     <p v-if="currentWallet">Connected to: {{ currentWallet.name }}</p>
 *     <p v-if="hasWallets">Available wallets: {{ availableWallets.length }}</p>
 *   </div>
 * </template>
 * ```
 */
export function useWalletInfo() {
  const ctx = useWalletContext();

  return {
    currentWallet: ctx.currentWallet,
    availableWallets: ctx.availableWallets,
    hasWallets: computed(() => ctx.availableWallets.value.length > 0),
  };
}
