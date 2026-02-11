/**
 * 适配器接口类型定义
 * 包含钱包适配器、管理器接口、配置类型等
 */

import type {
  AccountInfo,
  Network,
  WalletInfo,
  WalletState,
} from './base';
import type { WalletEvent, EventHandler } from './events';
import type { WalletError } from './errors';
import type {
  BalanceInfo,
  GetInscriptionsOptions,
  InscriptionsResponse,
  PushTxOptions,
  SendBitcoinOptions,
  SendInscriptionOptions,
  SignMessageOptions,
} from './transactions';

/** 缓存配置 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // 缓存时间（毫秒）
  maxSize: number; // 最大缓存条目数
}

/** 默认缓存配置 */
export const DEFAULT_CACHE_CONFIG: Record<
  string,
  Omit<CacheConfig, 'enabled'>
> = {
  balance: { ttl: 10000, maxSize: 100 }, // 10秒
  network: { ttl: 60000, maxSize: 50 }, // 1分钟
  accounts: { ttl: 30000, maxSize: 50 }, // 30秒
  walletState: { ttl: 5000, maxSize: 20 }, // 5秒
};

/** Modal配置接口 */
export interface ModalConfig {
  // z-index值配置
  zIndex?: number | 'auto' | 'max';
  // z-index策略
  strategy?: 'fixed' | 'dynamic' | 'custom';
}

/** z-index策略类型 */
export type ZIndexStrategy = 'fixed' | 'dynamic' | 'custom';
export type ZIndexValue = number | 'auto' | 'max';

/** 钱包管理器配置 */
export interface WalletManagerConfig {
  // 错误处理
  onError?: (error: Error) => void;
  // 状态变化回调
  onStateChange?: (state: WalletState) => void;
  // 缓存配置
  cache?: Partial<
    Record<
      keyof typeof DEFAULT_CACHE_CONFIG,
      Partial<Omit<CacheConfig, 'enabled'>>
    >
  >;
  // 是否启用缓存
  enableCache?: boolean;
  // Modal配置
  modalConfig?: ModalConfig;
}

/**
 * 钱包适配器接口
 * 所有钱包适配器必须实现此接口
 */
export interface BTCWalletAdapter {
  // 基本信息
  readonly id: string;
  readonly name: string;
  readonly icon: string;

  // 状态检查
  isReady(): boolean;
  getState(): WalletState;

  // 连接管理
  connect(): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;

  // 账户管理
  getAccounts(): Promise<AccountInfo[]>;
  getCurrentAccount(): Promise<AccountInfo | null>;

  // 网络管理
  getNetwork(): Promise<Network>;
  switchNetwork(network: Network): Promise<void>;

  // 事件监听 - 使用泛型确保类型安全
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;

  // 签名相关
  signMessage(message: string): Promise<string>;
  signPsbt(psbt: string): Promise<string>;
  sendBitcoin(toAddress: string, amount: number): Promise<string>;
}

/** 钱包管理器接口 */
export interface WalletManager {
  // 配置
  config: WalletManagerConfig;

  // 钱包管理
  register(adapter: BTCWalletAdapter): void;
  unregister(walletId: string): void;
  getAdapter(walletId: string): BTCWalletAdapter | null;
  getAllAdapters(): BTCWalletAdapter[];
  getAvailableWallets(): WalletInfo[];

  // 连接管理
  connect(walletId: string): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;
  switchWallet(walletId: string): Promise<AccountInfo[]>;
  // 网络管理
  switchNetwork(network: string): Promise<void>;
  // 采纳已授权会话为已连接（不触发授权弹窗）
  assumeConnected(walletId: string): Promise<AccountInfo[] | null>;

  // 状态获取
  getState(): WalletState;
  getCurrentAdapter(): BTCWalletAdapter | null;
  getCurrentWallet(): WalletInfo | null;

  // 事件监听 - 使用泛型确保类型安全
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;

  // 销毁
  destroy(): void;
}
