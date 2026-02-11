/**
 * 交易相关类型定义
 * 包含交易输入输出、PSBT、铭文等类型
 */

/** 交易输入 */
export interface TransactionInput {
  txid: string;
  vout: number;
  scriptSig?: string;
  scriptPubKey?: string;
  sequence?: number;
  address?: string;
  value?: number;
}

/** 交易输出 */
export interface TransactionOutput {
  scriptPubKey: string;
  address?: string;
  value: number;
}

/** 比特币交易 */
export interface BitcoinTransaction {
  txid: string;
  raw: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  fee: number;
  size?: number;
  version?: number;
  locktime?: number;
}

/** PSBT 输入 */
export interface PSBTInput {
  txid: string;
  vout: number;
  scriptSig?: string;
  redeemScript?: string;
  witnessScript?: string;
  sighashType?: number;
  partialSig?: {
    pubkey: string;
    signature: string;
  }[];
}

/** PSBT 输出 */
export interface PSBTOutput {
  scriptPubKey: string;
  redeemScript?: string;
  witnessScript?: string;
}

/** PSBT 信息 */
export interface PSBTInfo {
  psbt: string;
  inputs: PSBTInput[];
  outputs: PSBTOutput[];
  fee: number;
  version?: number;
  locktime?: number;
  txVersion?: number;
}

/** 铭文信息（统一格式） */
export interface InscriptionInfo {
  inscriptionId: string;
  inscriptionNumber: string;
  address: string;
  outputValue: string;
  content?: string; // UniSat 特有
  contentLength: string;
  contentType: string | number; // OKX 可能返回数字
  preview?: string; // UniSat 特有
  timestamp: number;
  offset: number;
  genesisTransaction: string;
  location: string;
  output: string;
}

/** 铭文列表响应 */
export interface InscriptionsResponse {
  total: number;
  list: InscriptionInfo[];
}

/** 余额信息（统一格式） */
export interface BalanceInfo {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

/** 推送交易选项 */
export interface PushTxOptions {
  rawTx: string; // 统一使用这个格式
}

/** 签名消息选项 */
export interface SignMessageOptions {
  type?: 'ecdsa' | 'bip322-simple';
}

/** 发送比特币选项 */
export interface SendBitcoinOptions {
  feeRate?: number;
  memo?: string;
  memos?: string[];
}

/** 发送铭文选项 */
export interface SendInscriptionOptions {
  feeRate?: number;
}

/** 获取铭文列表选项 */
export interface GetInscriptionsOptions {
  cursor?: number;
  size?: number;
}

// === UniSat 特定类型 ===

/** UniSat 铭文 */
export interface UniSatInscription {
  inscriptionId: string;
  inscriptionNumber: string;
  address: string;
  outputValue: string;
  content: string;
  contentLength: string;
  contentType: string;
  preview: string;
  timestamp: number;
  offset: number;
  genesisTransaction: string;
  location: string;
  output: string;
}

/** UniSat 铭文响应 */
export interface UniSatInscriptionsResponse {
  total: number;
  list: UniSatInscription[];
}

/** UniSat 余额 */
export interface UniSatBalance {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

/** UniSat 链信息 */
export interface UniSatChainInfo {
  enum: string;
  name: string;
  network: string;
}

/** UniSat PSBT 签名选项 */
export interface UniSatSignPsbtOptions {
  autoFinalized?: boolean;
  toSignInputs?: UniSatSignInput[];
}

/** UniSat 签名输入 */
export interface UniSatSignInput {
  index: number;
  address?: string;
  publicKey?: string;
  sighashTypes?: number[];
  disableTweakSigner?: boolean;
  useTweakedSigner?: boolean;
}

/** UniSat 发送比特币选项 */
export interface UniSatSendBitcoinOptions {
  feeRate?: number;
  memo?: string;
  memos?: string[];
}

/** UniSat 发送符文选项 */
export interface UniSatSendRunesOptions {
  feeRate?: number;
}

/** UniSat 发送铭文选项 */
export interface UniSatSendInscriptionOptions {
  feeRate?: number;
}
