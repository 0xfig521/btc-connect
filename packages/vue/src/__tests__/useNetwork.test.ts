/**
 * useNetwork composable 测试
 */
import { describe, it, expect, beforeEach, vi, mock } from 'bun:test';
import { ref, computed, nextTick } from 'vue';
import type { Network, WalletState, BTCWalletManager } from '@btc-connect/core';

// Mock useWalletContext
const mockState = ref<WalletState>({
  status: 'disconnected',
  accounts: [],
  currentAccount: undefined,
  network: 'livenet',
  error: undefined,
});

const mockManager = ref<BTCWalletManager | null>(null);

vi.mock('../walletContext', () => ({
  useWalletContext: () => ({
    state: computed(() => mockState.value),
    manager: mockManager,
  }),
}));

// 导入被测模块（在 mock 之后）
const { useNetwork } = await import('../composables/useNetwork');

describe('useNetwork', () => {
  beforeEach(() => {
    // 重置 mock 状态
    mockState.value = {
      status: 'disconnected',
      accounts: [],
      currentAccount: undefined,
      network: 'livenet',
      error: undefined,
    };
    mockManager.value = null;
  });

  describe('network 状态', () => {
    it('应该返回正确的默认网络状态', async () => {
      const { network } = useNetwork();

      await nextTick();

      expect(network.value.network).toBe('livenet');
      expect(network.value.name).toBe('Mainnet');
      expect(network.value.type).toBe('main');
    });

    it('应该正确映射 testnet 网络', async () => {
      mockState.value = {
        ...mockState.value,
        network: 'testnet',
      };

      const { network } = useNetwork();

      await nextTick();

      expect(network.value.network).toBe('testnet');
      expect(network.value.name).toBe('Testnet');
      expect(network.value.type).toBe('test');
    });

    it('应该正确映射 regtest 网络', async () => {
      mockState.value = {
        ...mockState.value,
        network: 'regtest',
      };

      const { network } = useNetwork();

      await nextTick();

      expect(network.value.network).toBe('regtest');
      expect(network.value.name).toBe('Regtest');
      expect(network.value.type).toBe('regtest');
    });
  });

  describe('switchNetwork 功能', () => {
    it('当 manager 不存在时应该抛出错误', async () => {
      const { switchNetwork } = useNetwork();

      await expect(switchNetwork('testnet')).rejects.toThrow(
        'Network switching not supported or no wallet connected',
      );
    });

    it('当 manager 存在时应该调用 switchNetwork', async () => {
      const mockSwitchNetwork = vi.fn().mockResolvedValue(undefined);
      mockManager.value = {
        switchNetwork: mockSwitchNetwork,
      } as unknown as BTCWalletManager;

      const { switchNetwork } = useNetwork();

      await switchNetwork('testnet');

      expect(mockSwitchNetwork).toHaveBeenCalledWith('testnet');
    });
  });

  describe('getNetworkInfo 工具函数', () => {
    it('应该返回正确的网络信息', () => {
      const { getNetworkInfo } = useNetwork();

      const info = getNetworkInfo('livenet');

      expect(info.name).toBe('Mainnet');
      expect(info.type).toBe('main');
    });

    it('应该处理未知网络', () => {
      const { getNetworkInfo } = useNetwork();

      // @ts-expect-error 测试未知网络
      const info = getNetworkInfo('unknown');

      expect(info.name).toBe('Unknown');
      expect(info.type).toBe('unknown');
    });
  });
});
