/**
 * 基础类型定义
 * 包含网络类型、连接状态、钱包信息等基础类型
 */

/** 网络类型 */
export type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet';

/** 钱包连接状态 */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

/** 钱包信息 */
export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  description?: string;
  homepage?: string;
}

/** 余额详情 */
export interface BalanceDetail {
  confirmed: number; // 已确认余额（聪）
  unconfirmed: number; // 未确认余额（聪）
  total: number; // 总余额（聪）
}

/** 账户信息 */
export interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: BalanceDetail;
  network?: Network;
}

/** 钱包状态 */
export interface WalletState {
  status: ConnectionStatus;
  accounts: AccountInfo[];
  currentAccount?: AccountInfo;
  network?: Network;
  error?: Error;
}
