/**
 * useWalletEvent Composable 测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'bun:test';
import { ref } from 'vue';
import type {
  WalletEvent,
  ConnectEventParams,
  AccountChangeEventParams,
} from '@btc-connect/core';

// Mock BTCWalletManager
interface MockManager {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
}

// 创建 mock manager
function createMockManager(): MockManager {
  const listeners = new Map<string, Set<Function>>();

  return {
    on: vi.fn((event: string, handler: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);
    }),
    off: vi.fn((event: string, handler: Function) => {
      listeners.get(event)?.delete(handler);
    }),
    emit: vi.fn((event: string, data: any) => {
      listeners.get(event)?.forEach((handler) => handler(data));
    }),
  };
}

// Mock walletContext
const mockManager = ref<MockManager | null>(null);
const mockContext = {
  manager: mockManager,
  state: ref({
    status: 'disconnected' as const,
    accounts: [],
    currentAccount: undefined,
    network: 'livenet' as const,
    error: undefined,
  }),
  currentWallet: ref(null),
  availableWallets: ref([]),
  isConnected: ref(false),
  isConnecting: ref(false),
  isModalOpen: ref(false),
  detectionManager: ref(null),
  isDetecting: ref(false),
  connect: vi.fn(),
  disconnect: vi.fn(),
  switchWallet: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  toggleModal: vi.fn(),
  startWalletDetection: vi.fn(),
  stopWalletDetection: vi.fn(),
  _stateUpdateTrigger: ref(0),
};

// Mock walletContext 模块
vi.mock('../walletContext', () => ({
  useWalletContext: () => mockContext,
}));

// 导入被测模块
const { useWalletEvent, useWalletEventAdvanced } = await import(
  '../composables/useWalletEvent'
);

describe('useWalletEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockManager.value = createMockManager();
  });

  afterEach(() => {
    mockManager.value = null;
    vi.restoreAllMocks();
  });

  describe('事件监听注册', () => {
    it('应该正确注册事件监听器', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', handler);

      expect(mockManager.value!.on).toHaveBeenCalledWith('connect', handler);
      expect(result).toBeDefined();
      expect(result.event).toBe('connect');
    });

    it('应该在没有 manager 时安全处理', () => {
      mockManager.value = null;

      const handler = vi.fn();
      const result = useWalletEvent('connect', handler);

      expect(result).toBeDefined();
    });

    it('应该返回正确的 API 接口', () => {
      const handler = vi.fn();
      const result = useWalletEvent('disconnect', handler);

      expect(typeof result.on).toBe('function');
      expect(typeof result.once).toBe('function');
      expect(typeof result.off).toBe('function');
      expect(typeof result.clear).toBe('function');
      expect(typeof result.clearHistory).toBe('function');
      expect(typeof result.removeAllListeners).toBe('function');
      expect(Array.isArray(result.eventHistory)).toBe(true);
    });
  });

  describe('事件触发', () => {
    it('应该在事件触发时调用处理器', async () => {
      const handler = vi.fn();
      useWalletEvent('connect', handler);

      const connectParams: ConnectEventParams = {
        walletId: 'unisat',
        accounts: [{ address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' }],
      };

      mockManager.value!.emit('connect', connectParams);

      expect(handler).toHaveBeenCalledWith(connectParams);
    });

    it('应该能够监听多个事件', () => {
      const connectHandler = vi.fn();
      const disconnectHandler = vi.fn();

      useWalletEvent('connect', connectHandler);
      useWalletEvent('disconnect', disconnectHandler);

      expect(mockManager.value!.on).toHaveBeenCalledWith(
        'connect',
        connectHandler,
      );
      expect(mockManager.value!.on).toHaveBeenCalledWith(
        'disconnect',
        disconnectHandler,
      );
    });

    it('应该能够监听 accountChange 事件', () => {
      const handler = vi.fn();
      useWalletEvent('accountChange', handler);

      const accountParams: AccountChangeEventParams = {
        walletId: 'unisat',
        accounts: [{ address: 'bc1qnewaddress' }],
      };

      mockManager.value!.emit('accountChange', accountParams);

      expect(handler).toHaveBeenCalledWith(accountParams);
    });

    it('应该能够监听 networkChange 事件', () => {
      const handler = vi.fn();
      useWalletEvent('networkChange', handler);

      const networkParams = {
        walletId: 'unisat',
        network: 'testnet' as const,
      };

      mockManager.value!.emit('networkChange', networkParams);

      expect(handler).toHaveBeenCalledWith(networkParams);
    });
  });

  describe('事件清理', () => {
    it('clear 方法应该移除事件监听器', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', handler);

      result.clear();

      expect(mockManager.value!.off).toHaveBeenCalledWith('connect', handler);
    });
  });

  describe('once 功能', () => {
    it('once 方法应该注册事件监听器', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', vi.fn());

      result.once('disconnect', handler);

      expect(mockManager.value!.on).toHaveBeenCalledWith('disconnect', handler);
    });

    it('once 方法应该返回取消函数', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', vi.fn());

      const unsubscribe = result.once('disconnect', handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('once 返回的取消函数应该移除监听器', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', vi.fn());

      const unsubscribe = result.once('disconnect', handler);
      unsubscribe();

      expect(mockManager.value!.off).toHaveBeenCalledWith('disconnect', handler);
    });
  });

  describe('eventHistory 记录', () => {
    it('应该返回 eventHistory 数组', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', handler);

      expect(Array.isArray(result.eventHistory)).toBe(true);
    });

    it('clearHistory 方法应该可以调用', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', handler);

      expect(() => result.clearHistory()).not.toThrow();
    });
  });

  describe('多事件监听', () => {
    it('应该支持同时监听多个不同事件', () => {
      const handlers = {
        connect: vi.fn(),
        disconnect: vi.fn(),
        accountChange: vi.fn(),
        networkChange: vi.fn(),
        error: vi.fn(),
      };

      Object.entries(handlers).forEach(([event, handler]) => {
        useWalletEvent(event as WalletEvent, handler);
      });

      expect(mockManager.value!.on).toHaveBeenCalledTimes(5);
    });

    it('on 方法应该能够添加额外的事件监听器', () => {
      const initialHandler = vi.fn();
      const additionalHandler = vi.fn();

      const result = useWalletEvent('connect', initialHandler);

      const unsubscribe = result.on('disconnect', additionalHandler);

      expect(mockManager.value!.on).toHaveBeenCalledWith(
        'disconnect',
        additionalHandler,
      );
      expect(typeof unsubscribe).toBe('function');
    });

    it('off 方法应该能够移除事件监听器', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', vi.fn());

      result.off('connect', handler);

      expect(mockManager.value!.off).toHaveBeenCalledWith('connect', handler);
    });

    it('removeAllListeners 方法应该可以调用', () => {
      const handler = vi.fn();
      const result = useWalletEvent('connect', handler);

      expect(() => result.removeAllListeners()).not.toThrow();
    });
  });
});

describe('useWalletEventAdvanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockManager.value = createMockManager();
  });

  afterEach(() => {
    mockManager.value = null;
    vi.restoreAllMocks();
  });

  it('应该返回正确的 API', () => {
    const result = useWalletEventAdvanced();

    expect(typeof result.addListener).toBe('function');
    expect(typeof result.removeListener).toBe('function');
    expect(typeof result.clearAllListeners).toBe('function');
    expect(Array.isArray(result.listeners.value)).toBe(true);
  });

  it('addListener 应该添加事件监听器', () => {
    const result = useWalletEventAdvanced();
    const handler = vi.fn();

    const listenerRef = result.addListener('connect', handler);

    expect(listenerRef).not.toBeNull();
    expect(mockManager.value!.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(result.listeners.value.length).toBe(1);
  });

  it('addListener 应该在 manager 为 null 时返回 null', () => {
    mockManager.value = null;

    const result = useWalletEventAdvanced();
    const handler = vi.fn();

    const listenerRef = result.addListener('connect', handler);

    expect(listenerRef).toBeNull();
  });

  it('removeListener 应该移除事件监听器', () => {
    const result = useWalletEventAdvanced();
    const handler = vi.fn();

    const listenerRef = result.addListener('connect', handler);
    result.removeListener(listenerRef);

    expect(mockManager.value!.off).toHaveBeenCalled();
    expect(result.listeners.value.length).toBe(0);
  });

  it('clearAllListeners 应该移除所有监听器', () => {
    const result = useWalletEventAdvanced();

    result.addListener('connect', vi.fn());
    result.addListener('disconnect', vi.fn());
    result.addListener('accountChange', vi.fn());

    expect(result.listeners.value.length).toBe(3);

    result.clearAllListeners();

    expect(result.listeners.value.length).toBe(0);
    expect(mockManager.value!.off).toHaveBeenCalledTimes(3);
  });

  it('once 选项应该创建一次性监听器', () => {
    const result = useWalletEventAdvanced();
    const handler = vi.fn();

    result.addListener('connect', handler, { once: true });

    expect(result.listeners.value.length).toBe(1);
  });

  it('condition 选项应该创建条件监听器', () => {
    const result = useWalletEventAdvanced();
    const handler = vi.fn();
    const condition = vi.fn(() => true);

    result.addListener('connect', handler, { condition });

    expect(result.listeners.value.length).toBe(1);
  });
});
