import { CacheKeyBuilder, CacheManager, type MemoryCache } from '../cache';
import { WalletEventManager } from '../events';
import type {
  AccountInfo,
  BalanceInfo,
  BTCWalletAdapter,
  ErrorContext,
  EventHandler,
  GetInscriptionsOptions,
  InscriptionsResponse,
  Network,
  PushTxOptions,
  SendBitcoinOptions,
  SendInscriptionOptions,
  SignMessageOptions,
  WalletEvent,
  WalletState,
} from '../types';
import {
  WalletConnectionError,
  WalletDisconnectedError,
  WalletError,
  WalletNotInstalledError,
} from '../types';
import { WalletErrorHandler } from '../utils/error-handler';

/**
 * Abstract base class for Bitcoin wallet adapters.
 * Provides common functionality for wallet connection, state management, caching, and event handling.
 * All concrete wallet adapters (UniSat, OKX, Xverse) must extend this class.
 *
 * @example
 * ```typescript
 * class MyWalletAdapter extends BaseWalletAdapter {
 *   readonly id = 'mywallet';
 *   readonly name = 'My Wallet';
 *   readonly icon = 'https://example.com/icon.png';
 *
 *   protected getWalletInstance() {
 *     return window.mywallet;
 *   }
 *
 *   protected async handleConnect() {
 *     const addresses = await window.mywallet.requestAccounts();
 *     return this.createAccountInfos(addresses);
 *   }
 *   // ... implement other abstract methods
 * }
 * ```
 */
export abstract class BaseWalletAdapter implements BTCWalletAdapter {
  protected eventManager: WalletEventManager = new WalletEventManager();
  protected state: WalletState = {
    status: 'disconnected',
    accounts: [],
  };
  protected isConnected = false;

  // 缓存实例
  protected cacheManager = CacheManager.getInstance();
  protected balanceCache: MemoryCache;
  protected networkCache: MemoryCache;
  protected accountsCache: MemoryCache;
  protected publicKeyCache: MemoryCache;

  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly icon: string;

  constructor() {
    // 初始化不同类型的缓存
    this.balanceCache = this.cacheManager.getCache('balance', {
      ttl: 10000, // 10秒
      maxSize: 100, // 最大100个条目
      enableAutoCleanup: true,
      cleanupInterval: 30000, // 30秒清理一次
    });

    this.networkCache = this.cacheManager.getCache('network', {
      ttl: 60000, // 1分钟
      maxSize: 50,
      enableAutoCleanup: true,
      cleanupInterval: 60000, // 1分钟清理一次
    });

    this.accountsCache = this.cacheManager.getCache('accounts', {
      ttl: 30000, // 30秒
      maxSize: 50,
      enableAutoCleanup: true,
      cleanupInterval: 30000,
    });

    this.publicKeyCache = this.cacheManager.getCache('publicKey', {
      ttl: 30000, // 30秒
      maxSize: 20,
      enableAutoCleanup: true,
      cleanupInterval: 30000,
    });
  }

  /**
   * Gets the wallet instance from the global scope.
   * Subclasses must implement this to return their specific wallet provider.
   *
   * @returns The wallet instance if available, undefined otherwise
   *
   * @example
   * ```typescript
   * protected getWalletInstance() {
   *   return typeof window !== 'undefined' ? window.unisat : undefined;
   * }
   * ```
   */
  protected abstract getWalletInstance(): any;

  /**
   * Checks if the wallet is available in the current environment.
   * Throws an error if the wallet is not installed or not accessible.
   *
   * @throws {Error} If the wallet is not found
   *
   * @example
   * ```typescript
   * this.checkWalletAvailability(); // Throws if wallet not installed
   * const wallet = this.getWalletInstance(); // Safe to use after check
   * ```
   */
  protected checkWalletAvailability(): void {
    if (!this.getWalletInstance()) {
      throw new Error(`${this.name} wallet not found`);
    }
  }

  /**
   * Normalizes network string to standard Network type.
   * Handles various wallet-specific network naming conventions.
   *
   * @param network - The network string from the wallet (e.g., 'livenet', 'mainnet', 'testnet')
   * @returns The normalized Network type
   *
   * @example
   * ```typescript
   * this.normalizeNetwork('livenet');  // Returns 'mainnet'
   * this.normalizeNetwork('testnet');  // Returns 'testnet'
   * this.normalizeNetwork('unknown');  // Returns 'mainnet' (default)
   * ```
   */
  protected normalizeNetwork(network: string): Network {
    switch (network) {
      case 'livenet':
      case 'mainnet':
        return 'mainnet';
      case 'testnet':
        return 'testnet';
      case 'regtest':
        return 'regtest';
      default:
        return 'mainnet'; // 默认主网
    }
  }

  /**
   * Creates an AccountInfo object from wallet data.
   *
   * @param address - The Bitcoin address
   * @param publicKey - Optional public key associated with the address
   * @param network - Optional network the address belongs to
   * @returns A structured AccountInfo object
   *
   * @example
   * ```typescript
   * const account = this.createAccountInfo(
   *   'tb1q...',
   *   '02abc...',
   *   'testnet'
   * );
   * ```
   */
  protected createAccountInfo(
    address: string,
    publicKey?: string,
    network?: Network,
  ): AccountInfo {
    return {
      address,
      publicKey,
      balance: undefined,
      network: network || this.normalizeNetwork('livenet'),
    };
  }

  /**
   * Gets the current connected address for cache key generation.
   *
   * @returns The current address if connected, null otherwise
   *
   * @example
   * ```typescript
   * const address = this.getCurrentAddress();
   * if (address) {
   *   const cacheKey = `balance:${this.id}:${address}`;
   * }
   * ```
   */
  protected getCurrentAddress(): string | null {
    return this.state.currentAccount?.address || null;
  }

  /**
   * Clears cache for a specific type or all caches.
   *
   * @param type - The cache type to clear: 'balance', 'network', 'accounts', 'publicKey', or 'all'
   *
   * @example
   * ```typescript
   * this.clearCache('balance');  // Clear only balance cache
   * this.clearCache('all');      // Clear all caches
   * ```
   */
  protected clearCache(
    type: 'balance' | 'network' | 'accounts' | 'publicKey' | 'all',
  ): void {
    switch (type) {
      case 'balance':
        this.balanceCache.clear();
        break;
      case 'network':
        this.networkCache.clear();
        break;
      case 'accounts':
        this.accountsCache.clear();
        break;
      case 'publicKey':
        this.publicKeyCache.clear();
        break;
      case 'all':
        this.balanceCache.clear();
        this.networkCache.clear();
        this.accountsCache.clear();
        this.publicKeyCache.clear();
        break;
    }
  }

  /**
   * Clears cache entries related to the current account.
   * Called when account changes to ensure fresh data.
   *
   * @example
   * ```typescript
   * // Called internally when account changes
   * this.clearCurrentAccountCache();
   * ```
   */
  protected clearCurrentAccountCache(): void {
    const currentAddress = this.getCurrentAddress();
    if (!currentAddress) return;

    // 清除余额缓存
    const balanceKey = CacheKeyBuilder.balance(this.id, currentAddress);
    this.balanceCache.delete(balanceKey);

    // 清除公钥缓存
    const publicKeyKey = `publicKey:${this.id}`;
    this.publicKeyCache.delete(publicKeyKey);
  }

  /**
   * Clears all caches associated with this wallet adapter.
   *
   * @example
   * ```typescript
   * // Called on disconnect or destroy
   * this.clearWalletCache();
   * ```
   */
  protected clearWalletCache(): void {
    this.clearCache('all');
  }

  /**
   * Creates multiple AccountInfo objects from an array of addresses.
   *
   * @param addresses - Array of Bitcoin addresses
   * @param network - Optional network for all accounts
   * @returns Array of AccountInfo objects
   *
   * @example
   * ```typescript
   * const accounts = this.createAccountInfos(
   *   ['tb1qabc...', 'tb1qdef...'],
   *   'testnet'
   * );
   * ```
   */
  protected createAccountInfos(
    addresses: string[],
    network?: Network,
  ): AccountInfo[] {
    return addresses.map((address) =>
      this.createAccountInfo(address, undefined, network),
    );
  }

  /**
   * Safely executes a wallet operation with error handling.
   * Wraps wallet-specific operations and provides consistent error handling.
   *
   * @template T - The return type of the operation
   * @param operation - The async function to execute with the wallet instance
   * @param _operationName - Name of the operation for error context
   * @param _context - Additional error context information
   * @returns The result of the operation
   * @throws The original wallet error if operation fails
   *
   * @example
   * ```typescript
   * const result = await this.executeWalletOperation(
   *   async (wallet) => await wallet.getBalance(),
   *   'getBalance',
   *   { walletId: this.id }
   * );
   * ```
   */
  protected async executeWalletOperation<T>(
    operation: (wallet: any) => Promise<T>,
    _operationName: string,
    _context?: Partial<ErrorContext>,
  ): Promise<T> {
    const wallet = this.getWalletInstance();
    this.checkWalletAvailability();
    return operation(wallet); // 直接抛出钱包的原始错误
  }

  /**
   * Sets up wallet event listeners using a mapping of events to handlers.
   *
   * @param eventMap - Object mapping event names to handler functions
   *
   * @example
   * ```typescript
   * this.setupWalletEventListeners({
   *   accountsChanged: this.handleAccountsChanged,
   *   networkChanged: this.handleNetworkChanged
   * });
   * ```
   */
  protected setupWalletEventListeners(
    eventMap: Record<string, (...args: any[]) => void>,
  ): void {
    const wallet = this.getWalletInstance();
    if (!wallet || !wallet.on) return;

    Object.entries(eventMap).forEach(([event, handler]) => {
      wallet.on(event, handler);
    });
  }

  /**
   * Removes wallet event listeners that were previously registered.
   *
   * @param eventMap - Object mapping event names to handler functions to remove
   *
   * @example
   * ```typescript
   * this.removeWalletEventListeners({
   *   accountsChanged: this.handleAccountsChanged,
   *   networkChanged: this.handleNetworkChanged
   * });
   * ```
   */
  protected removeWalletEventListeners(
    eventMap: Record<string, (...args: any[]) => void>,
  ): void {
    const wallet = this.getWalletInstance();
    if (!wallet || !wallet.removeListener) return;

    Object.entries(eventMap).forEach(([event, handler]) => {
      wallet.removeListener(event, handler);
    });
  }

  /**
   * Checks if the wallet is ready for use.
   * Verifies that the code is running in a browser environment and the wallet is installed.
   *
   * @returns True if the wallet is available, false otherwise
   *
   * @example
   * ```typescript
   * if (adapter.isReady()) {
   *   await adapter.connect();
   * } else {
   *   console.log('Please install the wallet');
   * }
   * ```
   */
  isReady(): boolean {
    return typeof window !== 'undefined' && !!this.getWalletInstance();
  }

  /**
   * Gets the current wallet state including connection status, accounts, and network.
   *
   * @returns A copy of the current wallet state
   *
   * @example
   * ```typescript
   * const state = adapter.getState();
   * console.log(state.status);     // 'connected' | 'disconnected' | ...
   * console.log(state.accounts);   // AccountInfo[]
   * console.log(state.network);    // 'mainnet' | 'testnet'
   * ```
   */
  getState(): WalletState {
    return { ...this.state };
  }

  /**
   * Connects to the wallet and requests account access.
   * Emits a connect event on successful connection.
   *
   * @returns Array of connected account information
   * @throws {WalletNotInstalledError} If the wallet is not installed
   * @throws {Error} If the user rejects the connection request
   *
   * @example
   * ```typescript
   * try {
   *   const accounts = await adapter.connect();
   *   console.log('Connected:', accounts[0].address);
   * } catch (error) {
   *   console.error('Connection failed:', error);
   * }
   * ```
   */
  async connect(): Promise<AccountInfo[]> {
    if (this.isConnected) {
      return this.state.accounts;
    }

    if (!this.isReady()) {
      throw new WalletNotInstalledError(this.id);
    }

    try {
      this.state.status = 'connecting';
      const accounts = await this.handleConnect();

      this.state.status = 'connected';
      this.state.accounts = accounts;
      this.state.currentAccount = accounts[0];
      this.isConnected = true;

      this.eventManager.emitConnect(this.id, accounts);
      return accounts;
    } catch (error) {
      this.state.status = 'error';
      this.state.error =
        error instanceof Error ? error : new Error(String(error));

      // 直接抛出钱包的原始错误，不做任何封装
      throw error;
    }
  }

  /**
   * Disconnects from the wallet and clears the connection state.
   * Emits a disconnect event on successful disconnection.
   *
   * @throws {Error} If disconnection fails
   *
   * @example
   * ```typescript
   * await adapter.disconnect();
   * console.log('Disconnected');
   * ```
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.handleDisconnect();

      this.state.status = 'disconnected';
      this.state.accounts = [];
      this.state.currentAccount = undefined;
      this.state.network = undefined;
      this.isConnected = false;

      this.eventManager.emitDisconnect(this.id);
    } catch (error) {
      this.state.status = 'error';
      this.state.error =
        error instanceof Error ? error : new Error(String(error));

      // 直接抛出钱包的原始错误，不做任何封装
      throw error;
    }
  }

  /**
   * Gets the list of accounts from the wallet without requiring connection.
   * Useful for silent account detection.
   *
   * @returns Array of account information
   *
   * @example
   * ```typescript
   * const accounts = await adapter.getAccounts();
   * console.log('Available accounts:', accounts.length);
   * ```
   */
  async getAccounts(): Promise<AccountInfo[]> {
    // 放开静默探测：未连接也允许调用底层 API 获取账户
    return await this.handleGetAccounts();
  }

  /**
   * Requests account connection, similar to MetaMask's requestAccounts.
   * Falls back to connect() if the wallet doesn't support requestAccounts.
   *
   * @returns Array of connected account information
   * @throws {WalletNotInstalledError} If the wallet is not installed
   *
   * @example
   * ```typescript
   * const accounts = await adapter.requestAccounts();
   * console.log('Connected accounts:', accounts);
   * ```
   */
  async requestAccounts(): Promise<AccountInfo[]> {
    if (!this.isReady()) {
      throw new WalletNotInstalledError(this.id);
    }

    if (this.handleRequestAccounts) {
      return await this.handleRequestAccounts();
    }

    // 如果没有实现 requestAccounts，则使用 connect 方法
    return await this.connect();
  }

  /**
   * Gets the public key for the current account.
   * Results are cached for performance.
   *
   * @returns The public key as a hex string
   * @throws {WalletDisconnectedError} If not connected
   * @throws {Error} If the wallet doesn't support getPublicKey
   *
   * @example
   * ```typescript
   * const publicKey = await adapter.getPublicKey();
   * console.log('Public key:', publicKey);
   * ```
   */
  async getPublicKey(): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleGetPublicKey) {
      // 尝试从缓存获取
      const publicKeyKey = `publicKey:${this.id}`;
      let publicKey = this.publicKeyCache.get(publicKeyKey);
      if (publicKey) {
        return publicKey;
      }

      // 缓存未命中，调用底层API
      publicKey = await this.handleGetPublicKey();

      // 缓存结果（只缓存有效的公钥）
      if (publicKey && typeof publicKey === 'string' && publicKey.length > 0) {
        this.publicKeyCache.set(publicKeyKey, publicKey);
      }

      return publicKey;
    }

    throw new Error(`${this.name} does not support getPublicKey`);
  }

  /**
   * Gets the balance for the current account.
   * Results are cached for performance.
   *
   * @returns Balance information including confirmed, unconfirmed, and total balance
   * @throws {WalletDisconnectedError} If not connected
   * @throws {Error} If the wallet doesn't support getBalance
   *
   * @example
   * ```typescript
   * const balance = await adapter.getBalance();
   * console.log('Total balance:', balance.total);
   * console.log('Confirmed:', balance.confirmed);
   * ```
   */
  async getBalance(): Promise<BalanceInfo> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleGetBalance) {
      const currentAddress = this.getCurrentAddress();
      if (!currentAddress) {
        return await this.handleGetBalance();
      }

      // 尝试从缓存获取
      const balanceKey = CacheKeyBuilder.balance(this.id, currentAddress);
      let balance = this.balanceCache.get(balanceKey);
      if (balance) {
        return balance;
      }

      // 缓存未命中，调用底层API
      balance = await this.handleGetBalance();

      // 缓存结果（只缓存有效的余额数据）
      if (balance && typeof balance === 'object' && 'total' in balance) {
        this.balanceCache.set(balanceKey, balance);
      }

      return balance;
    }

    throw new Error(`${this.name} does not support getBalance`);
  }

  /**
   * Signs a message with advanced options including signature type.
   * Falls back to basic signMessage() if not supported by the wallet.
   *
   * @param message - The message to sign
   * @param options - Signing options including signature type (ecdsa, bip322-simple)
   * @returns The signature as a hex string
   * @throws {WalletDisconnectedError} If not connected
   *
   * @example
   * ```typescript
   * const signature = await adapter.signMessageAdvanced('Hello', {
   *   type: 'bip322-simple'
   * });
   * ```
   */
  async signMessageAdvanced(
    message: string,
    options?: SignMessageOptions,
  ): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleSignMessageAdvanced) {
      return await this.handleSignMessageAdvanced(message, options);
    }

    // 回退到基础签名方法
    return await this.signMessage(message);
  }

  /**
   * Sends Bitcoin with advanced options including fee rate and memo.
   * Falls back to basic sendBitcoin() if not supported by the wallet.
   *
   * @param toAddress - The recipient Bitcoin address
   * @param amount - The amount to send in satoshis
   * @param options - Transaction options including feeRate and memo
   * @returns The transaction ID
   * @throws {WalletDisconnectedError} If not connected
   *
   * @example
   * ```typescript
   * const txId = await adapter.sendBitcoinAdvanced(
   *   'tb1q...',
   *   10000,
   *   { feeRate: 10, memo: 'Payment' }
   * );
   * ```
   */
  async sendBitcoinAdvanced(
    toAddress: string,
    amount: number,
    options?: SendBitcoinOptions,
  ): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleSendBitcoinAdvanced) {
      return await this.handleSendBitcoinAdvanced(toAddress, amount, options);
    }

    // 回退到基础发送方法
    return await this.sendBitcoin(toAddress, amount);
  }

  /**
   * Sends an inscription to a specified address.
   *
   * @param address - The recipient address
   * @param inscriptionId - The inscription ID to send
   * @param options - Transaction options including feeRate
   * @returns The transaction ID
   * @throws {WalletDisconnectedError} If not connected
   * @throws {Error} If the wallet doesn't support sendInscription
   *
   * @example
   * ```typescript
   * const txId = await adapter.sendInscription(
   *   'tb1q...',
   *   'abc123...',
   *   { feeRate: 5 }
   * );
   * ```
   */
  async sendInscription(
    address: string,
    inscriptionId: string,
    options?: SendInscriptionOptions,
  ): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleSendInscription) {
      return await this.handleSendInscription(address, inscriptionId, options);
    }

    throw new Error(`${this.name} does not support sendInscription`);
  }

  /**
   * Pushes a raw transaction to the network.
   *
   * @param options - Options containing the raw transaction hex
   * @returns The transaction ID
   * @throws {WalletDisconnectedError} If not connected
   * @throws {Error} If the wallet doesn't support pushTx
   *
   * @example
   * ```typescript
   * const txId = await adapter.pushTx({ rawTx: '020000...' });
   * ```
   */
  async pushTx(options: PushTxOptions): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handlePushTx) {
      return await this.handlePushTx(options);
    }

    throw new Error(`${this.name} does not support pushTx`);
  }

  /**
   * Gets inscriptions owned by the current account.
   *
   * @param options - Pagination options including cursor and size
   * @returns Inscriptions response with total count and list
   * @throws {WalletDisconnectedError} If not connected
   * @throws {Error} If the wallet doesn't support getInscriptions
   *
   * @example
   * ```typescript
   * const result = await adapter.getInscriptions({ cursor: 0, size: 10 });
   * console.log('Total inscriptions:', result.total);
   * result.list.forEach(ins => console.log(ins.inscriptionId));
   * ```
   */
  async getInscriptions(
    options?: GetInscriptionsOptions,
  ): Promise<InscriptionsResponse> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    if (this.handleGetInscriptions) {
      return await this.handleGetInscriptions(options || {});
    }

    throw new Error(`${this.name} does not support getInscriptions`);
  }

  /**
   * Gets the currently active account.
   *
   * @returns The current account info, or null if not connected
   *
   * @example
   * ```typescript
   * const account = await adapter.getCurrentAccount();
   * if (account) {
   *   console.log('Current address:', account.address);
   * }
   * ```
   */
  async getCurrentAccount(): Promise<AccountInfo | null> {
    if (!this.isConnected) {
      return null;
    }
    return this.state.currentAccount || null;
  }

  /**
   * Gets the current network the wallet is connected to.
   * Results are cached for performance.
   *
   * @returns The current network (mainnet, testnet, or regtest)
   *
   * @example
   * ```typescript
   * const network = await adapter.getNetwork();
   * console.log('Current network:', network); // 'mainnet' | 'testnet'
   * ```
   */
  async getNetwork(): Promise<Network> {
    // 放开静默探测：未连接也允许调用底层 API 获取网络
    const networkKey = CacheKeyBuilder.network(this.id);

    // 尝试从缓存获取
    let network = this.networkCache.get(networkKey);
    if (network) {
      this.state.network = network;
      return network;
    }

    // 缓存未命中，调用底层API
    network = await this.handleGetNetwork();
    this.state.network = network;

    // 缓存结果
    this.networkCache.set(networkKey, network);

    return network;
  }

  /**
   * Switches the wallet to a different network.
   * Clears relevant caches after switching.
   *
   * @param network - The target network to switch to
   * @throws {WalletDisconnectedError} If not connected
   *
   * @example
   * ```typescript
   * await adapter.switchNetwork('testnet');
   * console.log('Switched to testnet');
   * ```
   */
  async switchNetwork(network: Network): Promise<void> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }

    await this.handleSwitchNetwork(network);

    // 清除网络相关缓存
    const networkKey = CacheKeyBuilder.network(this.id);
    this.networkCache.delete(networkKey);

    // 清除账户缓存（因为不同网络的账户可能不同）
    this.accountsCache.clear();

    // 更新状态中的网络信息
    this.state.network = network;

    // 发射网络变化事件
    this.eventManager.emitNetworkChange(this.id, network);
  }

  /**
   * Signs a message using the connected account.
   *
   * @param message - The message to sign
   * @returns The signature as a hex string
   * @throws {WalletDisconnectedError} If not connected
   *
   * @example
   * ```typescript
   * const signature = await adapter.signMessage('Hello World');
   * console.log('Signature:', signature);
   * ```
   */
  async signMessage(message: string): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }
    return await this.handleSignMessage(message);
  }

  /**
   * Signs a Partially Signed Bitcoin Transaction (PSBT).
   *
   * @param psbt - The PSBT hex string to sign
   * @returns The signed PSBT hex string
   * @throws {WalletDisconnectedError} If not connected
   *
   * @example
   * ```typescript
   * const signedPsbt = await adapter.signPsbt('70736274...');
   * console.log('Signed PSBT:', signedPsbt);
   * ```
   */
  async signPsbt(psbt: string): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }
    return await this.handleSignPsbt(psbt);
  }

  /**
   * Sends Bitcoin to a specified address.
   *
   * @param toAddress - The recipient Bitcoin address
   * @param amount - The amount to send in satoshis
   * @returns The transaction ID
   * @throws {WalletDisconnectedError} If not connected
   *
   * @example
   * ```typescript
   * const txId = await adapter.sendBitcoin('tb1q...', 10000);
   * console.log('Transaction ID:', txId);
   * ```
   */
  async sendBitcoin(toAddress: string, amount: number): Promise<string> {
    if (!this.isConnected) {
      throw new WalletDisconnectedError(this.id);
    }
    return await this.handleSendBitcoin(toAddress, amount);
  }

  /**
   * Registers an event listener for wallet events.
   *
   * @template T - The event type
   * @param event - The event name to listen for
   * @param handler - The callback function to execute when the event fires
   *
   * @example
   * ```typescript
   * adapter.on('accountChanged', (accounts) => {
   *   console.log('Account changed:', accounts);
   * });
   * adapter.on('networkChanged', (network) => {
   *   console.log('Network changed:', network);
   * });
   * ```
   */
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
    this.eventManager.on(event, handler);
  }

  /**
   * Removes a previously registered event listener.
   *
   * @template T - The event type
   * @param event - The event name
   * @param handler - The callback function to remove
   *
   * @example
   * ```typescript
   * const handler = (accounts) => console.log(accounts);
   * adapter.on('accountChanged', handler);
   * // Later, remove the listener
   * adapter.off('accountChanged', handler);
   * ```
   */
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void {
    this.eventManager.off(event, handler);
  }

  /**
   * Abstract methods that subclasses must implement.
   * These handle the wallet-specific implementation details.
   */
  protected abstract handleConnect(): Promise<AccountInfo[]>;
  protected abstract handleDisconnect(): Promise<void>;
  protected abstract handleGetAccounts(): Promise<AccountInfo[]>;
  protected abstract handleGetNetwork(): Promise<Network>;
  protected abstract handleSwitchNetwork(network: Network): Promise<void>;
  protected abstract handleSignMessage(message: string): Promise<string>;
  protected abstract handleSignPsbt(psbt: string): Promise<string>;
  protected abstract handleSendBitcoin(
    toAddress: string,
    amount: number,
  ): Promise<string>;

  /**
   * Optional advanced methods that subclasses can implement.
   * These provide extended functionality for wallets that support them.
   */
  protected handleRequestAccounts?(): Promise<AccountInfo[]>;
  protected handleGetPublicKey?(): Promise<string>;
  protected handleGetBalance?(): Promise<BalanceInfo>;
  protected handleSignMessageAdvanced?(
    message: string,
    options?: SignMessageOptions,
  ): Promise<string>;
  protected handleSendBitcoinAdvanced?(
    toAddress: string,
    amount: number,
    options?: SendBitcoinOptions,
  ): Promise<string>;
  protected handleSendInscription?(
    address: string,
    inscriptionId: string,
    options?: SendInscriptionOptions,
  ): Promise<string>;
  protected handlePushTx?(options: PushTxOptions): Promise<string>;
  protected handleGetInscriptions?(
    options: GetInscriptionsOptions,
  ): Promise<InscriptionsResponse>;

  /**
   * Updates the account list and emits an account change event.
   * Clears relevant caches when accounts change.
   *
   * @param accounts - The new list of accounts
   */
  protected updateAccounts(accounts: AccountInfo[]): void {
    this.state.accounts = accounts;
    this.state.currentAccount = accounts[0] || undefined;

    // 清除当前账户相关的缓存（因为账户发生了变化）
    this.clearCurrentAccountCache();

    // 清除账户缓存
    this.accountsCache.clear();

    this.eventManager.emitAccountChange(this.id, accounts);
  }

  /**
   * Updates the network and emits a network change event.
   * Clears relevant caches when network changes.
   *
   * @param network - The new network
   */
  protected updateNetwork(network: Network): void {
    this.state.network = network;

    // 清除网络相关缓存
    const networkKey = CacheKeyBuilder.network(this.id);
    this.networkCache.delete(networkKey);

    // 清除账户缓存（因为不同网络的账户可能不同）
    this.accountsCache.clear();

    this.eventManager.emitNetworkChange(this.id, network);
  }

  /**
   * Cleans up resources and resets the adapter state.
   * Should be called when the adapter is no longer needed.
   *
   * @example
   * ```typescript
   * // Clean up when component unmounts
   * adapter.destroy();
   * ```
   */
  destroy(): void {
    this.eventManager.destroy();

    // 清除所有缓存
    this.clearWalletCache();

    this.state = {
      status: 'disconnected',
      accounts: [],
    };
    this.isConnected = false;
  }
}
