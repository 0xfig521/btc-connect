// 核心 Hooks
// 保持向后兼容的导出
export {
  useAccount,
  useBalance,
  useConnectWallet,
  useNetwork,
  useRefreshAccountInfo, // 已弃用，功能已集成到 useWallet
  useWallet,
  useWalletEvent,
} from './hooks';

// useWalletModal 从独立文件导出（增强版）
export { useWalletModal } from './useWalletModal';
// 功能 Hooks
export { useSignature } from './useSignature';
export { useTransactions } from './useTransactions';
export { useWalletDetection } from './useWalletDetection';
// 新增 Hooks
export { useWalletManager } from './useWalletManager';

// useAutoConnect 是内部使用的 Hook，不对外导出
export { useAutoConnect } from './useAutoConnect';
