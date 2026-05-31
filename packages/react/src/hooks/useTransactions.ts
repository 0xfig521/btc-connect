import { useWalletContext } from '../context/provider';

/**
 * Hook for transaction operations.
 * Provides method for sending Bitcoin transactions.
 *
 * @returns Object with transaction methods
 * @returns {Function} sendBitcoin - Send Bitcoin to an address
 *
 * @example
 * ```tsx
 * import { useTransactions } from '@btc-connect/react';
 *
 * function SendButton() {
 *   const { sendBitcoin } = useTransactions();
 *
 *   const handleSend = async () => {
 *     const txId = await sendBitcoin('tb1q...', 1000);
 *     console.log('Transaction ID:', txId);
 *   };
 *
 *   return <button onClick={handleSend}>Send 1000 sats</button>;
 * }
 * ```
 */
export function useTransactions() {
  const { manager } = useWalletContext();

  const sendBitcoin = async (to: string, amount: number): Promise<string> => {
    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }
    const adapter = manager.getCurrentAdapter();
    if (!adapter || !adapter.sendBitcoin) {
      throw new Error('Send Bitcoin is not supported by current wallet');
    }
    return await adapter.sendBitcoin(to, amount);
  };

  return {
    sendBitcoin,
  };
}
