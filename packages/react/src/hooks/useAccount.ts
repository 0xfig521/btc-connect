import { useWalletContext } from '../context/provider';

/**
 * Hook for accessing account information.
 * Provides address, public key, and account details.
 *
 * @returns Object with account information
 * @returns {string|null} address - Current wallet address
 * @returns {string|null} publicKey - Current wallet public key
 * @returns {AccountInfo|null} currentAccount - Current account details
 * @returns {AccountInfo[]} accounts - All connected accounts
 * @returns {boolean} hasAccounts - Whether accounts exist
 * @returns {boolean} hasPublicKey - Whether public key is available
 * @returns {boolean} hasAddress - Whether address is available
 *
 * @example
 * ```tsx
 * import { useAccount } from '@btc-connect/react';
 *
 * function AccountInfo() {
 *   const { address, publicKey, hasAccounts } = useAccount();
 *   if (!hasAccounts) return <p>No account</p>;
 *   return <p>Address: {address}</p>;
 * }
 * ```
 */
export function useAccount() {
  const { state } = useWalletContext();
  const { accounts, currentAccount } = state;

  const address = currentAccount?.address || null;
  const publicKey = currentAccount?.publicKey || null;

  return {
    address,
    publicKey,
    currentAccount,
    accounts,
    hasAccounts: accounts.length > 0,
    hasPublicKey: !!publicKey,
    hasAddress: !!address,
  };
}
