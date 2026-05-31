import { ref, computed } from 'vue';
import { useWalletContext } from '../walletContext';
import type {
  SendBitcoinOptions,
  BalanceInfo,
  TransactionInput
} from '@btc-connect/core';

/**
 * Transaction state interface
 */
export interface TransactionState {
  isLoading: boolean;
  isSigning: boolean;
  isBroadcasting: boolean;
  error: string | null;
}

/**
 * PSBT options interface
 */
export interface PsbtOptions {
  autoFinalize?: boolean;
  broadcast?: boolean;
  feeRate?: number;
}

/**
 * Transaction result interface
 */
export interface TransactionResult {
  txid: string;
  rawTx?: string;
  psbtHex?: string;
}

/**
 * Transaction operations Composable
 *
 * Provides comprehensive Bitcoin transaction functionality including sending,
 * signing PSBTs, and transaction history management.
 *
 * @returns Transaction methods and state
 * @returns {Ref<TransactionState>} returns.transactionState - Current transaction state
 * @returns {Ref<BalanceInfo | null>} returns.balance - Current balance info
 * @returns {Ref<any[]>} returns.utxos - Available UTXOs
 * @returns {Ref<TransactionInput[]>} returns.transactions - Transaction history
 * @returns {ComputedRef<boolean>} returns.isSending - Whether a transaction is in progress
 * @returns {ComputedRef<string | null>} returns.error - Transaction error message
 * @returns {(toAddress: string, amount: number) => Promise<string>} returns.sendBitcoin - Send Bitcoin to an address
 * @returns {(psbt: string) => Promise<string>} returns.sendTransaction - Send transaction (compatibility method)
 * @returns {(toAddress: string, satoshis: number, options?: SendBitcoinOptions) => Promise<string>} returns.sendBitcoinAdvanced - Advanced Bitcoin sending
 * @returns {(psbtHex: string, options?: PsbtOptions) => Promise<TransactionResult>} returns.signPsbt - Sign a PSBT
 * @returns {(psbtHexs: string[], options?: PsbtOptions) => Promise<TransactionResult[]>} returns.signPsbts - Sign multiple PSBTs
 * @returns {(rawTx: string) => Promise<string>} returns.broadcastTransaction - Broadcast a raw transaction
 * @returns {() => Promise<BalanceInfo | null>} returns.fetchBalance - Fetch current balance
 * @returns {() => Promise<any[]>} returns.fetchUtxos - Fetch available UTXOs
 * @returns {() => Promise<TransactionInput[]>} returns.fetchTransactionHistory - Fetch transaction history
 * @returns {(toAddress: string, amount: number, feeRate?: number) => Promise<number>} returns.estimateFee - Estimate transaction fee
 * @returns {() => void} returns.resetState - Reset transaction state
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTransactions } from '@btc-connect/vue';
 *
 * const { sendBitcoin, isSending, error, estimateFee } = useTransactions();
 *
 * const handleSend = async () => {
 *   try {
 *     const fee = await estimateFee('recipientAddress', 10000);
 *     console.log('Estimated fee:', fee);
 *
 *     const txid = await sendBitcoin('recipientAddress', 10000);
 *     console.log('Transaction sent:', txid);
 *   } catch (err) {
 *     console.error('Send failed:', error.value);
 *   }
 * };
 * </script>
 *
 * <template>
 *   <button @click="handleSend" :disabled="isSending">
 *     {{ isSending ? 'Sending...' : 'Send Bitcoin' }}
 *   </button>
 * </template>
 * ```
 */

/**
 * Use transaction functionality Composable
 */
export function useTransactions() {
  const { manager } = useWalletContext();

  // 状态管理
  const transactionState = ref<TransactionState>({
    isLoading: false,
    isSigning: false,
    isBroadcasting: false,
    error: null,
  });

  const balance = ref<BalanceInfo | null>(null);
  const utxos = ref<any[]>([]);
  const transactions = ref<TransactionInput[]>([]);

  // 计算属性
  const isSending = computed(() =>
    transactionState.value.isLoading ||
    transactionState.value.isSigning ||
    transactionState.value.isBroadcasting
  );

  const error = computed(() => transactionState.value.error);

  /**
   * Basic Bitcoin transfer
   */
  const sendBitcoin = async (
    toAddress: string,
    amount: number,
  ): Promise<string> => {
    console.log('🚀 [Vue useTransactions] sendBitcoin called', {
      toAddress,
      amount,
    });

    if (!manager.value) {
      console.error('❌ [Vue useTransactions] Manager not initialized');
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    console.log(
      '🔍 [Vue useTransactions] Current adapter:',
      adapter?.name,
      'has sendBitcoin:',
      !!adapter?.sendBitcoin,
    );

    if (!adapter || !adapter.sendBitcoin) {
      console.error(
        '❌ [Vue useTransactions] Adapter or sendBitcoin method not available',
      );
      throw new Error('Send Bitcoin is not supported by current wallet');
    }

    try {
      console.log('📤 [Vue useTransactions] Calling adapter.sendBitcoin...');
      transactionState.value.isLoading = true;
      transactionState.value.error = null;

      const result = await adapter.sendBitcoin(toAddress, amount);
      console.log('✅ [Vue useTransactions] sendBitcoin success:', result);

      // 重新获取余额和交易历史
      await Promise.all([
        fetchBalance(),
        fetchTransactionHistory()
      ]);

      return result;
    } catch (error) {
      console.error('❌ [Vue useTransactions] sendBitcoin failed:', error);
      transactionState.value.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      transactionState.value.isLoading = false;
    }
  };

  /**
   * Advanced Bitcoin transfer (with more options)
   */
  const sendBitcoinAdvanced = async (
    toAddress: string,
    satoshis: number,
    options?: SendBitcoinOptions,
  ): Promise<string> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !('sendBitcoinAdvanced' in adapter)) {
      throw new Error('Advanced Bitcoin sending is not supported by current wallet');
    }

    try {
      transactionState.value.isLoading = true;
      transactionState.value.error = null;

      const result = await (adapter as any).sendBitcoinAdvanced(toAddress, satoshis, options);

      // 重新获取余额和交易历史
      await Promise.all([
        fetchBalance(),
        fetchTransactionHistory()
      ]);

      return result;
    } catch (error) {
      transactionState.value.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      transactionState.value.isLoading = false;
    }
  };

  /**
   * Sign PSBT
   */
  const signPsbt = async (
    psbtHex: string,
    options?: PsbtOptions
  ): Promise<TransactionResult> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !adapter.signPsbt) {
      throw new Error('PSBT signing is not supported by current wallet');
    }

    try {
      transactionState.value.isSigning = true;
      transactionState.value.error = null;

      let signedPsbt: string;

      // 尝试使用高级签名方法
      if ('signPsbtAdvanced' in adapter) {
        // 使用统一接口，选项根据适配器类型动态构建
        const signOptions: any = {
          autoFinalize: options?.autoFinalize ?? true,
        };
        signedPsbt = await (adapter as any).signPsbtAdvanced(psbtHex, signOptions);
      } else {
        signedPsbt = await adapter.signPsbt(psbtHex);
      }

      const result: TransactionResult = {
        txid: '', // 需要从PSBT中提取或广播后获取
        psbtHex: signedPsbt,
      };

      // 如果设置了自动广播
      if (options?.broadcast && 'pushPsbt' in adapter) {
        transactionState.value.isBroadcasting = true;
        result.txid = await (adapter as any).pushPsbt(signedPsbt);
      }

      return result;
    } catch (error) {
      transactionState.value.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      transactionState.value.isSigning = false;
      transactionState.value.isBroadcasting = false;
    }
  };

  /**
   * Batch sign PSBTs
   */
  const signPsbts = async (
    psbtHexs: string[],
    options?: PsbtOptions
  ): Promise<TransactionResult[]> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !('signPsbts' in adapter)) {
      throw new Error('Batch PSBT signing is not supported by current wallet');
    }

    try {
      transactionState.value.isSigning = true;
      transactionState.value.error = null;

      const signOptions: any = {
        autoFinalize: options?.autoFinalize ?? true,
        broadcast: options?.broadcast ?? false,
      };

      const signedPsbts = await (adapter as any).signPsbts(psbtHexs, signOptions);

      const results: TransactionResult[] = signedPsbts.map((psbt: string, index: number) => ({
        txid: '', // 需要从PSBT中提取或广播后获取
        psbtHex: psbt,
      }));

      // 如果设置了自动广播
      if (options?.broadcast && 'pushPsbt' in adapter) {
        transactionState.value.isBroadcasting = true;
        for (let i = 0; i < results.length; i++) {
          results[i].txid = await (adapter as any).pushPsbt(results[i].psbtHex!);
        }
      }

      return results;
    } catch (error) {
      transactionState.value.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      transactionState.value.isSigning = false;
      transactionState.value.isBroadcasting = false;
    }
  };

  /**
   * Broadcast raw transaction
   */
  const broadcastTransaction = async (rawTx: string): Promise<string> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !('pushTx' in adapter)) {
      throw new Error('Transaction broadcasting is not supported by current wallet');
    }

    try {
      transactionState.value.isBroadcasting = true;
      transactionState.value.error = null;

      const txid = await (adapter as any).pushTx(rawTx);

      // 重新获取交易历史
      await fetchTransactionHistory();

      return txid;
    } catch (error) {
      transactionState.value.error = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      transactionState.value.isBroadcasting = false;
    }
  };

  /**
   * Fetch balance
   */
  const fetchBalance = async (): Promise<BalanceInfo | null> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !('getBalance' in adapter)) {
      console.warn('Balance fetching is not supported by current wallet');
      return null;
    }

    try {
      const balanceData = await (adapter as any).getBalance();
      balance.value = balanceData;
      return balanceData;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      return null;
    }
  };

  /**
   * Fetch UTXOs
   */
  const fetchUtxos = async (): Promise<any[]> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !('getUtxos' in adapter)) {
      console.warn('UTXO fetching is not supported by current wallet');
      return [];
    }

    try {
      const utxoData = await (adapter as any).getUtxos();
      utxos.value = utxoData;
      return utxoData;
    } catch (error) {
      console.error('Failed to fetch UTXOs:', error);
      return [];
    }
  };

  /**
   * Fetch transaction history
   */
  const fetchTransactionHistory = async (): Promise<TransactionInput[]> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !('getTransactions' in adapter)) {
      console.warn('Transaction history fetching is not supported by current wallet');
      return [];
    }

    try {
      const txHistory = await (adapter as any).getTransactions();
      transactions.value = txHistory;
      return txHistory;
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return [];
    }
  };

  /**
   * Estimate transaction fee
   */
  const estimateFee = async (
    toAddress: string,
    amount: number,
    feeRate?: number
  ): Promise<number> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !('estimateFee' in adapter)) {
      // 如果钱包不支持费用估算，返回默认值
      return Math.max(1000, Math.floor(amount * 0.001)); // 最小1000聪或0.1%
    }

    try {
      const fee = await (adapter as any).estimateFee(toAddress, amount, feeRate);
      return fee;
    } catch (error) {
      console.error('Failed to estimate fee:', error);
      return Math.max(1000, Math.floor(amount * 0.001));
    }
  };

  /**
   * Reset state
   */
  const resetState = (): void => {
    transactionState.value = {
      isLoading: false,
      isSigning: false,
      isBroadcasting: false,
      error: null,
    };
  };

  // 兼容性方法 - 保持向后兼容
  const sendTransaction = async (psbt: string): Promise<string> => {
    const result = await signPsbt(psbt);
    return result.txid || result.psbtHex || '';
  };

  return {
    // 状态
    transactionState,
    balance,
    utxos,
    transactions,
    isSending,
    error,

    // 基础交易方法
    sendBitcoin,
    sendTransaction, // 兼容性方法

    // 高级交易方法
    sendBitcoinAdvanced,
    signPsbt,
    signPsbts,
    broadcastTransaction,

    // 数据获取方法
    fetchBalance,
    fetchUtxos,
    fetchTransactionHistory,
    estimateFee,

    // 工具方法
    resetState,
  };
}
