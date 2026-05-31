import { useCallback, useEffect, useRef, useState } from 'react';
import { useWalletContext } from '../context';
import type {
  AvailableWalletsEventParams,
  WalletDetectedEventParams,
  WalletDetectionCompleteEventParams,
} from '../types';

// 钱包检测统计类型
interface WalletDetectionStats {
  totalScans: number;
  successfulDetections: number;
  lastScanDuration: number;
  averageScanDuration: number;
  detectedWalletCount: number;
}

/**
 * Hook for real-time wallet detection with event-based updates.
 * Provides comprehensive wallet detection status management and event listening.
 *
 * @returns Object with detection state and methods
 * @returns {boolean} isDetecting - Whether detection is in progress
 * @returns {DetectedWallet[]} detectedWallets - List of detected wallets
 * @returns {boolean} detectionComplete - Whether detection is complete
 * @returns {WalletDetectionStats} stats - Detection statistics
 * @returns {Function} detectWallets - Manually trigger detection
 * @returns {Function} onWalletDetected - Register wallet detected callback
 * @returns {Function} onDetectionComplete - Register detection complete callback
 *
 * @example
 * ```tsx
 * import { useWalletDetection } from '@btc-connect/react';
 *
 * function DetectionStatus() {
 *   const { isDetecting, detectedWallets, stats } = useWalletDetection();
 *
 *   return (
 *     <div>
 *       <p>Status: {isDetecting ? 'Detecting...' : 'Complete'}</p>
 *       <p>Found: {detectedWallets.length} wallets</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWalletDetection() {
  const ctx = useWalletContext();
  const manager = ctx.manager;

  // 检测状态
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState<any[]>([]);
  const [detectionComplete, setDetectionComplete] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState<number | null>(
    null,
  );

  // 检测统计
  const [stats, setStats] = useState<WalletDetectionStats>({
    totalScans: 0,
    successfulDetections: 0,
    lastScanDuration: 0,
    averageScanDuration: 0,
    detectedWalletCount: 0,
  });

  // 事件监听器引用
  const eventListenersRef = useRef<{
    onWalletDetected?: (result: any) => void;
    onDetectionComplete?: (results: any[]) => void;
    onAvailableWallets?: (wallets: string[]) => void;
  }>({});

  // 检测开始时间
  const detectionStartTimeRef = useRef<number>(0);

  // 更新统计信息
  const updateStats = useCallback((duration: number, walletCount: number) => {
    setStats((prev) => {
      const newTotalScans = prev.totalScans + 1;
      const newSuccessfulDetections =
        walletCount > 0
          ? prev.successfulDetections + 1
          : prev.successfulDetections;
      const newAverageScanDuration =
        prev.averageScanDuration === 0
          ? duration
          : (prev.averageScanDuration * (newTotalScans - 1) + duration) /
            newTotalScans;

      return {
        totalScans: newTotalScans,
        successfulDetections: newSuccessfulDetections,
        lastScanDuration: duration,
        averageScanDuration: newAverageScanDuration,
        detectedWalletCount: walletCount,
      };
    });
  }, []);

  // 手动触发钱包检测
  const detectWallets = useCallback(async () => {
    if (!manager || isDetecting) return;

    setIsDetecting(true);
    setDetectionComplete(false);
    detectionStartTimeRef.current = Date.now();

    try {
      // 使用当前可用的钱包列表
      const availableWallets = ctx.availableWallets;
      const results = availableWallets.map((w) => ({
        walletId: w.id,
        name: w.name,
        isAvailable: true,
      }));

      const duration = Date.now() - detectionStartTimeRef.current;
      setDetectedWallets(results);
      setLastDetectionTime(Date.now());
      setDetectionComplete(true);
      updateStats(duration, results.length);

      return results;
    } catch (error) {
      console.error('Wallet detection failed:', error);
      const duration = Date.now() - detectionStartTimeRef.current;
      updateStats(duration, 0);
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [manager, isDetecting, updateStats, ctx.availableWallets]);

  // 监听钱包检测事件
  useEffect(() => {
    if (!manager) return;

    // 钱包检测事件处理
    const handleWalletDetected = (params: WalletDetectedEventParams) => {
      console.log(
        `🔍 [useWalletDetection] Wallet detected: ${params.walletId} (${params.walletInfo.name})`,
      );

      const result = {
        walletId: params.walletId,
        name: params.walletInfo.name,
        isAvailable: true,
      };

      setDetectedWallets((prev) => {
        const existing = prev.findIndex((w) => w.walletId === params.walletId);
        if (existing >= 0) {
          // 更新现有钱包信息
          const updated = [...prev];
          updated[existing] = result;
          return updated;
        } else {
          // 添加新检测到的钱包
          return [...prev, result];
        }
      });

      // 调用外部监听器
      eventListenersRef.current.onWalletDetected?.(result);
    };

    // 检测完成事件处理
    const handleDetectionComplete = (
      params: WalletDetectionCompleteEventParams,
    ) => {
      console.log(
        `✅ [useWalletDetection] Detection complete: ${params.wallets.length} wallets found`,
      );

      const duration = Date.now() - detectionStartTimeRef.current;
      const results = params.wallets.map((walletId: string) => ({
        walletId,
        name: walletId, // 可以通过适配器获取真实名称
        isAvailable: true,
      }));

      setDetectedWallets(results);
      setLastDetectionTime(Date.now());
      setDetectionComplete(true);
      setIsDetecting(false);
      updateStats(duration, results.length);

      // 调用外部监听器
      eventListenersRef.current.onDetectionComplete?.(results);
    };

    // 可用钱包列表更新事件处理
    const handleAvailableWallets = (params: AvailableWalletsEventParams) => {
      console.log(
        `📋 [useWalletDetection] Available wallets updated: ${params.wallets.map((w: any) => w.id).join(', ')}`,
      );

      const wallets = params.wallets.map((w: any) => w.id);
      // 调用外部监听器
      eventListenersRef.current.onAvailableWallets?.(wallets);
    };

    // 注册事件监听器
    manager.on('walletDetected', handleWalletDetected);
    manager.on('walletDetectionComplete', handleDetectionComplete);
    manager.on('availableWallets', handleAvailableWallets);

    // 清理函数
    return () => {
      manager.off('walletDetected', handleWalletDetected);
      manager.off('walletDetectionComplete', handleDetectionComplete);
      manager.off('availableWallets', handleAvailableWallets);
    };
  }, [manager, updateStats]);

  // 注册自定义事件监听器
  const onWalletDetected = useCallback((callback: (result: any) => void) => {
    eventListenersRef.current.onWalletDetected = callback;
  }, []);

  const onDetectionComplete = useCallback(
    (callback: (results: any[]) => void) => {
      eventListenersRef.current.onDetectionComplete = callback;
    },
    [],
  );

  const onAvailableWallets = useCallback(
    (callback: (wallets: string[]) => void) => {
      eventListenersRef.current.onAvailableWallets = callback;
    },
    [],
  );

  // 移除事件监听器
  const removeAllListeners = useCallback(() => {
    eventListenersRef.current = {};
  }, []);

  // 重置检测状态
  const resetDetectionState = useCallback(() => {
    setDetectedWallets([]);
    setDetectionComplete(false);
    setLastDetectionTime(null);
    setIsDetecting(false);
  }, []);

  // 获取特定钱包的检测信息
  const getWalletInfo = useCallback(
    (walletId: string) => {
      return detectedWallets.find((w) => w.walletId === walletId) || null;
    },
    [detectedWallets],
  );

  // 检查特定钱包是否可用
  const isWalletAvailable = useCallback(
    (walletId: string) => {
      const wallet = getWalletInfo(walletId);
      return wallet?.isAvailable || false;
    },
    [getWalletInfo],
  );

  // 获取所有可用钱包列表
  const getAvailableWallets = useCallback(() => {
    return detectedWallets.filter((w) => w.isAvailable).map((w) => w.walletId);
  }, [detectedWallets]);

  // 自动检测定时器
  useEffect(() => {
    if (!manager) return;

    // 启动时进行一次检测
    const timer = setTimeout(() => {
      detectWallets();
    }, 100); // 延迟100ms确保管理器已初始化

    return () => clearTimeout(timer);
  }, [manager, detectWallets]);

  return {
    // 状态
    isDetecting,
    detectedWallets,
    detectionComplete,
    lastDetectionTime,
    stats,

    // 方法
    detectWallets,
    resetDetectionState,
    getWalletInfo,
    isWalletAvailable,
    getAvailableWallets,

    // 事件监听器
    onWalletDetected,
    onDetectionComplete,
    onAvailableWallets,
    removeAllListeners,
  };
}
