import { useWalletContext } from '../context/provider';

/**
 * Hook for signature operations.
 * Provides methods for signing messages and PSBTs.
 *
 * @returns Object with signature methods
 * @returns {Function} signMessage - Sign a message string
 * @returns {Function} signPsbt - Sign a PSBT (Partially Signed Bitcoin Transaction)
 *
 * @example
 * ```tsx
 * import { useSignature } from '@btc-connect/react';
 *
 * function SignMessageButton() {
 *   const { signMessage, signPsbt } = useSignature();
 *
 *   const handleSign = async () => {
 *     const signature = await signMessage('Hello Bitcoin!');
 *     console.log('Signature:', signature);
 *   };
 *
 *   return <button onClick={handleSign}>Sign Message</button>;
 * }
 * ```
 */
export function useSignature() {
  const { manager } = useWalletContext();

  const signMessage = async (message: string): Promise<string> => {
    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }
    const adapter = manager.getCurrentAdapter();
    if (!adapter || !adapter.signMessage) {
      throw new Error('Sign message is not supported by current wallet');
    }
    return await adapter.signMessage(message);
  };

  const signPsbt = async (psbt: string): Promise<string> => {
    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }
    const adapter = manager.getCurrentAdapter();
    if (!adapter || !adapter.signPsbt) {
      throw new Error('Sign PSBT is not supported by current wallet');
    }
    return await adapter.signPsbt(psbt);
  };

  return {
    signMessage,
    signPsbt,
  };
}
