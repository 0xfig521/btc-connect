/**
 * 事件系统类型定义
 * 包含钱包事件类型、事件处理器、事件参数等
 */

import type { AccountInfo, Network, WalletInfo } from './base';
import type { WalletError } from './errors';
import type { BTCWalletAdapter } from './adapter';

/** 钱包事件类型 */
export type WalletEvent =
  | 'connect'
  | 'disconnect'
  | 'accountChange'
  | 'networkChange'
  | 'error'
  | 'availableWallets'
  | 'walletDetected'
  | 'walletDetectionComplete';

/** 连接事件参数 */
export interface ConnectEventParams {
  walletId: string;
  accounts: AccountInfo[];
}

/** 断开连接事件参数 */
export interface DisconnectEventParams {
  walletId: string;
}

/** 账户变更事件参数 */
export interface AccountChangeEventParams {
  walletId: string;
  accounts: AccountInfo[];
}

/** 网络变更事件参数 */
export interface NetworkChangeEventParams {
  walletId: string;
  network: Network;
}

/** 错误事件参数 */
export interface ErrorEventParams {
  walletId?: string;
  error: WalletError;
}

/** 可用钱包事件参数 */
export interface AvailableWalletsEventParams {
  wallets: WalletInfo[];
  adapters: BTCWalletAdapter[];
  timestamp: number;
}

/** 钱包检测事件参数 */
export interface WalletDetectedEventParams {
  walletId: string;
  walletInfo: WalletInfo;
  totalDetected: number;
  timestamp: number;
}

/** 钱包检测完成事件参数 */
export interface WalletDetectionCompleteEventParams {
  wallets: string[];
  adapters: BTCWalletAdapter[];
  elapsedTime: number;
  isComplete: boolean;
  timestamp: number;
}

/** 事件处理器类型映射 */
export interface EventHandlerMap {
  connect: (params: ConnectEventParams) => void;
  disconnect: (params: DisconnectEventParams) => void;
  accountChange: (params: AccountChangeEventParams) => void;
  networkChange: (params: NetworkChangeEventParams) => void;
  error: (params: ErrorEventParams) => void;
  availableWallets: (params: AvailableWalletsEventParams) => void;
  walletDetected: (params: WalletDetectedEventParams) => void;
  walletDetectionComplete: (params: WalletDetectionCompleteEventParams) => void;
}

/** 统一的事件处理器类型 */
export type EventHandler<T extends WalletEvent> =
  T extends keyof EventHandlerMap
    ? EventHandlerMap[T]
    : (...args: any[]) => void;

/** 传统事件处理器类型（向后兼容） */
export type LegacyEventHandler = (...args: any[]) => void;

/** 事件监听器接口 */
export interface EventListener {
  event: WalletEvent;
  handler: LegacyEventHandler;
}
