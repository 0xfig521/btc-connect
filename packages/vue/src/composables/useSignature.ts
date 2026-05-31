import { ref } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * Signature operations Composable
 *
 * Provides message and PSBT signing functionality for Bitcoin wallets.
 *
 * @returns Signature methods and state
 * @returns {(message: string) => Promise<string>} returns.signMessage - Sign a message
 * @returns {(psbt: string) => Promise<string>} returns.signPsbt - Sign a PSBT
 * @returns {Ref<boolean>} returns.isSigning - Whether a signing operation is in progress
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSignature } from '@btc-connect/vue';
 *
 * const { signMessage, signPsbt, isSigning } = useSignature();
 *
 * const handleSignMessage = async () => {
 *   try {
 *     const signature = await signMessage('Hello Bitcoin!');
 *     console.log('Signature:', signature);
 *   } catch (error) {
 *     console.error('Signing failed:', error);
 *   }
 * };
 * </script>
 *
 * <template>
 *   <button @click="handleSignMessage" :disabled="isSigning">
 *     {{ isSigning ? 'Signing...' : 'Sign Message' }}
 *   </button>
 * </template>
 * ```
 */

/**
 * Use signature functionality Composable
 */
export function useSignature() {
  const { manager } = useWalletContext();
  const isSigning = ref(false);

  const signMessage = async (message: string): Promise<string> => {
    console.log('🚀 [Vue useSignature] signMessage called', { message });

    if (!manager.value) {
      console.error('❌ [Vue useSignature] Manager not initialized');
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    console.log(
      '🔍 [Vue useSignature] Current adapter:',
      adapter?.name,
      'has signMessage:',
      !!adapter?.signMessage,
    );

    if (!adapter || !adapter.signMessage) {
      console.error(
        '❌ [Vue useSignature] Adapter or signMessage method not available',
      );
      throw new Error('Sign message is not supported by current wallet');
    }

    try {
      console.log('📝 [Vue useSignature] Calling adapter.signMessage...');
      isSigning.value = true;
      const result = await adapter.signMessage(message);
      console.log('✅ [Vue useSignature] signMessage success:', result);
      return result;
    } catch (error) {
      console.error('❌ [Vue useSignature] signMessage failed:', error);
      throw error;
    } finally {
      isSigning.value = false;
    }
  };

  const signPsbt = async (psbt: string): Promise<string> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !adapter.signPsbt) {
      throw new Error('Sign PSBT is not supported by current wallet');
    }

    try {
      isSigning.value = true;
      return await adapter.signPsbt(psbt);
    } finally {
      isSigning.value = false;
    }
  };

  return {
    signMessage,
    signPsbt,
    isSigning,
  };
}
