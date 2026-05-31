import { computed } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * Account information Composable
 *
 * Provides reactive access to wallet account information including addresses,
 * balances, and public keys.
 *
 * @returns Account state and information
 * @returns {ComputedRef<AccountInfo[]>} returns.accounts - All connected accounts
 * @returns {ComputedRef<AccountInfo | undefined>} returns.currentAccount - Current active account
 * @returns {ComputedRef<boolean>} returns.hasAccounts - Whether any accounts are connected
 * @returns {ComputedRef<BalanceDetail | null>} returns.balance - Current account balance
 * @returns {ComputedRef<Error | null>} returns.error - Any account-related error
 * @returns {ComputedRef<string | null>} returns.address - Current account address
 * @returns {ComputedRef<string | null>} returns.publicKey - Current account public key
 * @returns {ComputedRef<boolean>} returns.hasAddress - Whether current account has an address
 * @returns {ComputedRef<boolean>} returns.hasPublicKey - Whether current account has a public key
 *
 * @example
 * ```vue
 * <script setup>
 * import { useAccount } from '@btc-connect/vue';
 *
 * const { address, balance, publicKey, hasAccounts } = useAccount();
 * </script>
 *
 * <template>
 *   <div v-if="hasAccounts">
 *     <p>Address: {{ address }}</p>
 *     <p>Balance: {{ balance?.total }} satoshis</p>
 *     <p>Public Key: {{ publicKey }}</p>
 *   </div>
 * </template>
 * ```
 */

/**
 * Use account information Composable
 */
export function useAccount() {
  const ctx = useWalletContext();

  return {
    accounts: computed(() => ctx.state.value.accounts),
    currentAccount: computed(() => ctx.state.value.currentAccount),
    hasAccounts: computed(() => ctx.state.value.accounts.length > 0),
    balance: computed(() => ctx.state.value.currentAccount?.balance || null),
    error: computed(() => ctx.state.value.error || null),
    // 添加address和publicKey的响应式访问
    address: computed(() => ctx.state.value.currentAccount?.address || null),
    publicKey: computed(
      () => ctx.state.value.currentAccount?.publicKey || null,
    ),
    hasAddress: computed(() => !!ctx.state.value.currentAccount?.address),
    hasPublicKey: computed(() => !!ctx.state.value.currentAccount?.publicKey),
  };
}
