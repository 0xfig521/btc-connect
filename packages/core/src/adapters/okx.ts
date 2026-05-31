import type {
  AccountInfo,
  BalanceInfo,
  GetInscriptionsOptions,
  InscriptionsResponse,
  Network,
  PushTxOptions,
  SendBitcoinOptions,
  SendInscriptionOptions,
  SignMessageOptions,
} from '../types';
import { WalletErrorHandler } from '../utils/error-handler';
import { BaseWalletAdapter } from './base';

declare global {
  interface Window {
    okxwallet?: {
      bitcoin: {
        // 连接方法
        connect(): Promise<{ address: string; publicKey: string }>;
        requestAccounts(): Promise<string[]>;
        disconnect(): Promise<void>;

        // 账户信息
        getAccounts(): Promise<string[]>;
        getPublicKey(): Promise<string>;
        getBalance(): Promise<{
          confirmed: number;
          unconfirmed: number;
          total: number;
        }>;

        // 网络管理
        getNetwork(): Promise<string>;

        // Inscriptions
        getInscriptions(
          cursor?: number,
          size?: number,
        ): Promise<{
          total: number;
          list: Array<{
            inscriptionId: string;
            inscriptionNumber: string;
            address: string;
            outputValue: string;
            contentLength: string;
            contentType: number;
            timestamp: number;
            offset: number;
            output: string;
            genesisTransaction: string;
            location: string;
          }>;
        }>;

        // 交易相关
        sendBitcoin(
          toAddress: string,
          satoshis: number,
          options?: {
            feeRate?: number;
          },
        ): Promise<string>;

        send({
          from,
          to,
          value,
          satBytes,
          memo,
          memoPos,
        }: {
          from: string;
          to: string;
          value: string;
          satBytes?: string;
          memo?: string;
          memoPos?: number;
        }): Promise<{ txhash: string }>;

        sendInscription(
          address: string,
          inscriptionId: string,
          options?: {
            feeRate?: number;
          },
        ): Promise<string>;

        // NFT 相关
        transferNft(data: {
          from: string;
          to: string;
          data: any;
        }): Promise<{ txhash: string }>;

        // PSBT 相关
        signPsbt(psbt: string, options?: any): Promise<string>;
        signPsbts(psbtHexs: string[], options?: any): Promise<string[]>;
        pushPsbt(psbtHex: string): Promise<string>;
        sendPsbt(txs: any[], from: string): Promise<string[]>;

        // UTXO 管理
        splitUtxo(data: { from: string; amount?: number }): Promise<{
          utxos: any[];
        }>;

        // 铭文操作
        inscribe(data: {
          type: string;
          from: string;
          tick?: string;
        }): Promise<string>;

        mint(data: {
          type: string;
          from: string;
          inscriptions: any[];
        }): Promise<{
          txId: string;
          inscriptionId: string;
          body: string;
          contentLength: string;
          contentType: string;
          timestamp: number;
        }>;

        // 签名相关
        signMessage(
          signStr: string,
          type?: 'ecdsa' | 'bip322-simple',
        ): Promise<string>;

        // 交易推送
        pushTx(rawTx: string): Promise<string>;

        // 事件监听
        on(event: string, callback: (...args: any[]) => void): void;
        off(event: string, callback: (...args: any[]) => void): void;
      };
    };
  }
}

/**
 * OKX wallet adapter implementing the OKX Bitcoin API.
 * Provides comprehensive support for Bitcoin wallet operations including
 * inscriptions, NFT transfers, UTXO management, and PSBT signing.
 *
 * @example
 * ```typescript
 * import { OKXAdapter } from '@btc-connect/core';
 *
 * const adapter = new OKXAdapter();
 *
 * // Check if OKX is installed
 * if (adapter.isReady()) {
 *   // Connect to wallet
 *   const accounts = await adapter.connect();
 *   console.log('Connected:', accounts[0].address);
 *
 *   // Get balance
 *   const balance = await adapter.getBalance();
 *   console.log('Balance:', balance.total);
 *
 *   // Sign message
 *   const signature = await adapter.signMessage('Hello');
 *
 *   // Send Bitcoin
 *   const txId = await adapter.sendBitcoin('tb1q...', 10000);
 *
 *   // Get inscriptions
 *   const inscriptions = await adapter.getInscriptions({ cursor: 0, size: 10 });
 *
 *   // Transfer NFT
 *   const result = await adapter.transferNft({
 *     from: 'tb1q...',
 *     to: 'tb1q...',
 *     data: { tokenId: 'abc123' }
 *   });
 * }
 * ```
 */
export class OKXAdapter extends BaseWalletAdapter {
  readonly id = 'okx';
  readonly name = 'OKX Wallet';
  readonly icon =
    'https://web3.okx.com/cdn/assets/imgs/254/5678AFAB27871136.png';

  protected getWalletInstance() {
    if (typeof window === 'undefined') return undefined;

    // 多种方式检测 OKX 钱包
    const okxwallet = window.okxwallet;

    if (!okxwallet || !okxwallet.bitcoin) return undefined;

    const wallet = okxwallet.bitcoin;

    // 确保钱包有必要的接口
    if (
      typeof wallet.connect === 'function' ||
      typeof wallet.requestAccounts === 'function'
    ) {
      return wallet;
    }

    return undefined;
  }

  protected async handleConnect(): Promise<AccountInfo[]> {
    return this.executeWalletOperation(
      async (wallet) => {
        const account = await wallet.connect();

        const accounts: AccountInfo[] = [
          this.createAccountInfo(account.address, account.publicKey),
        ];

        // 设置事件监听
        this.setupEventListeners();

        return accounts;
      },
      'Failed to connect OKX wallet',
      {
        operation: 'connect',
        walletId: this.id,
        suggestion: 'Please ensure OKX wallet is installed and unlocked',
      },
    );
  }

  protected async handleDisconnect(): Promise<void> {
    return this.executeWalletOperation(
      async (wallet) => {
        await wallet.disconnect();
        // 清理事件监听器
        this.removeEventListeners();
      },
      'Failed to disconnect OKX wallet',
      {
        operation: 'disconnect',
        walletId: this.id,
      },
    );
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    if (!window.okxwallet?.bitcoin) return;

    // 由于 OKX 钱包 API 限制，无法直接移除特定事件监听器
    // 这里仅作为接口完整性的占位符
    // 实际清理在适配器销毁时进行
  }

  protected async handleGetAccounts(): Promise<AccountInfo[]> {
    return this.executeWalletOperation(
      async (wallet) => {
        const addresses = await wallet.getAccounts();
        return this.createAccountInfos(addresses);
      },
      'Failed to get accounts from OKX wallet',
      {
        operation: 'getAccounts',
        walletId: this.id,
      },
    );
  }

  protected async handleGetNetwork(): Promise<Network> {
    return this.executeWalletOperation(
      async (wallet) => {
        const network = await wallet.getNetwork();
        return this.normalizeNetwork(network);
      },
      'Failed to get network from OKX wallet',
      {
        operation: 'getNetwork',
        walletId: this.id,
      },
    );
  }

  protected async handleSwitchNetwork(_network: Network): Promise<void> {
    throw WalletErrorHandler.createConnectionError(
      this.id,
      'OKX wallet does not support network switching',
      undefined,
      {
        operation: 'switchNetwork',
        walletId: this.id,
        network: _network,
        suggestion:
          'Network switching is not supported by OKX wallet. Please switch networks manually in the wallet.',
      },
    );
  }

  protected async handleSignMessage(message: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signMessage(message),
      'Failed to sign message with OKX wallet',
      {
        operation: 'signMessage',
        walletId: this.id,
      },
    );
  }

  protected async handleSignPsbt(psbt: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signPsbt(psbt),
      'Failed to sign PSBT with OKX wallet',
      {
        operation: 'signPsbt',
        walletId: this.id,
      },
    );
  }

  protected async handleSendBitcoin(
    toAddress: string,
    amount: number,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.sendBitcoin(toAddress, amount),
      'Failed to send bitcoin with OKX wallet',
      {
        operation: 'sendBitcoin',
        walletId: this.id,
        address: toAddress,
      },
    );
  }

  private setupEventListeners(): void {
    if (!window.okxwallet?.bitcoin) return;

    // 监听账户变化（兼容旧版本）
    window.okxwallet.bitcoin.on('accountsChanged', (accounts: string[]) => {
      const accountInfos: AccountInfo[] = accounts.map((address) => ({
        address,
        publicKey: undefined,
        balance: undefined,
        network: this.normalizeNetwork('livenet'),
      }));
      this.updateAccounts(accountInfos);
    });

    // 监听单个账户变化（新版本支持）
    window.okxwallet.bitcoin.on(
      'accountChanged',
      (account: { address: string; publicKey?: string }) => {
        const accountInfo: AccountInfo = {
          address: account.address,
          publicKey: account.publicKey,
          balance: undefined,
          network: this.normalizeNetwork('livenet'),
        };
        this.updateAccounts([accountInfo]);
      },
    );

    // 监听网络变化
    window.okxwallet.bitcoin.on('networkChanged', (network: string) => {
      const normalizedNetwork = this.normalizeNetwork(network);
      this.updateNetwork(normalizedNetwork);
    });

    // 监听连接状态变化
    window.okxwallet.bitcoin.on(
      'connect',
      (account: { address: string; publicKey?: string }) => {
        const accountInfo: AccountInfo = {
          address: account.address,
          publicKey: account.publicKey,
          balance: undefined,
          network: this.normalizeNetwork('livenet'),
        };
        this.updateAccounts([accountInfo]);
      },
    );

    // 监听断开连接事件
    window.okxwallet.bitcoin.on('disconnect', () => {
      this.updateAccounts([]);
    });
  }

  // 新增的 OKX 特有方法

  /**
   * 请求账户连接
   */
  protected override async handleRequestAccounts(): Promise<AccountInfo[]> {
    return this.executeWalletOperation(
      async (wallet) => {
        const addresses = await wallet.requestAccounts();
        const accounts = this.createAccountInfos(addresses);

        // 设置事件监听
        this.setupEventListeners();

        return accounts;
      },
      'Failed to request accounts from OKX wallet',
      {
        operation: 'requestAccounts',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取公钥
   */
  protected override async handleGetPublicKey(): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.getPublicKey(),
      'Failed to get public key from OKX wallet',
      {
        operation: 'getPublicKey',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取余额
   */
  protected override async handleGetBalance(): Promise<BalanceInfo> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.getBalance(),
      'Failed to get balance from OKX wallet',
      {
        operation: 'getBalance',
        walletId: this.id,
      },
    );
  }

  /**
   * 高级签名消息（支持多种签名类型）
   */
  protected override async handleSignMessageAdvanced(
    message: string,
    options?: SignMessageOptions,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signMessage(message, options?.type),
      'Failed to sign advanced message with OKX wallet',
      {
        operation: 'signMessageAdvanced',
        walletId: this.id,
      },
    );
  }

  /**
   * 发送比特币（支持选项）
   */
  protected override async handleSendBitcoinAdvanced(
    toAddress: string,
    amount: number,
    options?: SendBitcoinOptions,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.sendBitcoin(toAddress, amount, options),
      'Failed to send advanced bitcoin transaction with OKX wallet',
      {
        operation: 'sendBitcoinAdvanced',
        walletId: this.id,
        address: toAddress,
      },
    );
  }

  /**
   * 发送铭文
   */
  protected override async handleSendInscription(
    address: string,
    inscriptionId: string,
    options?: SendInscriptionOptions,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) =>
        await wallet.sendInscription(address, inscriptionId, options),
      'Failed to send inscription with OKX wallet',
      {
        operation: 'sendInscription',
        walletId: this.id,
        address,
      },
    );
  }

  /**
   * 推送交易
   */
  protected override async handlePushTx(
    options: PushTxOptions,
  ): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.pushTx(options.rawTx),
      'Failed to push transaction with OKX wallet',
      {
        operation: 'pushTx',
        walletId: this.id,
      },
    );
  }

  /**
   * 获取铭文列表
   */
  protected override async handleGetInscriptions(
    options: GetInscriptionsOptions,
  ): Promise<InscriptionsResponse> {
    return this.executeWalletOperation(
      async (wallet) => {
        const result = await wallet.getInscriptions(
          options.cursor,
          options.size,
        );
        // 转换为统一格式
        return {
          total: result.total,
          list: result.list.map((item: any) => ({
            inscriptionId: item.inscriptionId,
            inscriptionNumber: item.inscriptionNumber,
            address: item.address,
            outputValue: item.outputValue,
            contentLength: item.contentLength,
            contentType: item.contentType, // OKX 可能返回数字
            timestamp: item.timestamp,
            offset: item.offset,
            genesisTransaction: item.genesisTransaction,
            location: item.location,
            output: item.output,
            // OKX 没有 content 和 preview 字段
          })),
        };
      },
      'Failed to get inscriptions from OKX wallet',
      {
        operation: 'getInscriptions',
        walletId: this.id,
      },
    );
  }

  /**
   * 使用 send 方法发送交易
   */
  async send(options: {
    from: string;
    to: string;
    value: string;
    satBytes?: string;
    memo?: string;
    memoPos?: number;
  }): Promise<{ txhash: string }> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.send(options),
      'Failed to send transaction with OKX wallet',
      {
        operation: 'send',
        walletId: this.id,
        address: options.to,
      },
    );
  }

  // === 新增的 OKX 特有方法 ===

  /**
   * 批量 PSBT 签名
   */
  async signPsbts(psbtHexs: string[], options?: any): Promise<string[]> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.signPsbts(psbtHexs, options),
      `Failed to sign ${psbtHexs.length} PSBTs with OKX wallet`,
      {
        operation: 'signPsbts',
        walletId: this.id,
        suggestion: `Tried to sign ${psbtHexs.length} PSBTs. Please check each PSBT is valid.`,
      },
    );
  }

  /**
   * 推送 PSBT 交易
   */
  async pushPsbt(psbtHex: string): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.pushPsbt(psbtHex),
      'Failed to push PSBT with OKX wallet',
      {
        operation: 'pushPsbt',
        walletId: this.id,
      },
    );
  }

  /**
   * 发送 PSBT 交易数组
   */
  async sendPsbt(txs: any[], from: string): Promise<string[]> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.sendPsbt(txs, from),
      `Failed to send ${txs.length} PSBT transactions with OKX wallet`,
      {
        operation: 'sendPsbt',
        walletId: this.id,
        address: from,
        suggestion: `Tried to send ${txs.length} transactions. Please check each transaction is valid.`,
      },
    );
  }

  /**
   * NFT 转账
   */
  async transferNft(data: {
    from: string;
    to: string;
    data: any;
  }): Promise<{ txhash: string }> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.transferNft(data),
      'Failed to transfer NFT with OKX wallet',
      {
        operation: 'transferNft',
        walletId: this.id,
        address: data.to,
      },
    );
  }

  /**
   * 分割 UTXO
   */
  async splitUtxo(data: { from: string; amount?: number }): Promise<{
    utxos: any[];
  }> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.splitUtxo(data),
      'Failed to split UTXO with OKX wallet',
      {
        operation: 'splitUtxo',
        walletId: this.id,
        address: data.from,
      },
    );
  }

  /**
   * 创建铭文
   */
  async inscribe(data: {
    type: string;
    from: string;
    tick?: string;
  }): Promise<string> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.inscribe(data),
      'Failed to create inscription with OKX wallet',
      {
        operation: 'inscribe',
        walletId: this.id,
        address: data.from,
      },
    );
  }

  /**
   * 铸造铭文
   */
  async mint(data: {
    type: string;
    from: string;
    inscriptions: any[];
  }): Promise<{
    txId: string;
    inscriptionId: string;
    body: string;
    contentLength: string;
    contentType: string;
    timestamp: number;
  }> {
    return this.executeWalletOperation(
      async (wallet) => await wallet.mint(data),
      'Failed to mint inscription with OKX wallet',
      {
        operation: 'mint',
        walletId: this.id,
        address: data.from,
      },
    );
  }
}
