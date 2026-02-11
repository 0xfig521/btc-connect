/**
 * @btc-connect/core 类型定义
 *
 * 此模块已拆分为多个子模块：
 * - base: 基础类型定义 (Network, WalletState, AccountInfo 等)
 * - events: 事件系统类型 (WalletEvent, EventHandler 等)
 * - errors: 错误处理类型 (WalletError, ErrorCode 等)
 * - adapter: 适配器接口 (BTCWalletAdapter, WalletManager 等)
 * - transactions: 交易相关类型 (TransactionInput, PSBTInfo 等)
 *
 * 为了向后兼容，所有类型仍从此模块导出
 */

// ===== 基础类型 =====
export type {
  Network,
  ConnectionStatus,
  WalletInfo,
  BalanceDetail,
  AccountInfo,
  WalletState,
} from './base';

// ===== 事件系统 =====
export type {
  WalletEvent,
  ConnectEventParams,
  DisconnectEventParams,
  AccountChangeEventParams,
  NetworkChangeEventParams,
  ErrorEventParams,
  AvailableWalletsEventParams,
  WalletDetectedEventParams,
  WalletDetectionCompleteEventParams,
  EventHandlerMap,
  EventHandler,
  LegacyEventHandler,
  EventListener,
} from './events';

// ===== 错误处理 =====
export {
  ErrorSeverity,
  ErrorCode,
  WalletError,
  WalletNotInstalledError,
  WalletConnectionError,
  WalletDisconnectedError,
  NetworkError,
  SignatureError,
  TransactionError,
  TimeoutError,
  ConfigurationError,
  ErrorHandlerManager,
} from './errors';
export type { ErrorContext, ErrorHandler } from './errors';

// ===== 适配器接口 =====
export type {
  BTCWalletAdapter,
  WalletManager,
  WalletManagerConfig,
  CacheConfig,
  ModalConfig,
  ZIndexStrategy,
  ZIndexValue,
} from './adapter';
export { DEFAULT_CACHE_CONFIG } from './adapter';

// ===== 交易相关 =====
export type {
  TransactionInput,
  TransactionOutput,
  BitcoinTransaction,
  PSBTInput,
  PSBTOutput,
  PSBTInfo,
  UniSatInscription,
  UniSatInscriptionsResponse,
  UniSatBalance,
  UniSatChainInfo,
  UniSatSignPsbtOptions,
  UniSatSignInput,
  UniSatSendBitcoinOptions,
  UniSatSendRunesOptions,
  UniSatSendInscriptionOptions,
  SignMessageOptions,
  SendBitcoinOptions,
  SendInscriptionOptions,
  GetInscriptionsOptions,
  InscriptionInfo,
  InscriptionsResponse,
  BalanceInfo,
  PushTxOptions,
} from './transactions';

// ===== 统一接口（React/Vue 共享）=====
export type {
  ThemeMode,
  ThemeConfig,
  Theme,
  WalletEventRecord,
  UseWalletEventReturn,
  UseWalletManagerReturn,
  ModalState,
  UseWalletModalReturn,
  UseWalletBaseReturn,
  UseWalletEnhancedReturn,
  UseBalanceReturn,
  UseNetworkReturn,
  UseAccountReturn,
  UseSignatureReturn,
  UseTransactionsReturn,
  UseThemeReturn,
  FormatAddressOptions,
  FormatBalanceOptions,
  WalletDetectionOptions,
  WalletDetectionResult,
  UnifiedConfig,
  ComponentBaseProps,
  ConnectButtonProps,
  WalletModalProps,
  UtilsInterface,
} from './unified';
