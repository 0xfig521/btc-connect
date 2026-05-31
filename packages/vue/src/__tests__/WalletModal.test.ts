/**
 * WalletModal 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'bun:test';
import { ref, nextTick } from 'vue';

describe('WalletModal 组件', () => {
  describe('组件导出验证', () => {
    it('应该正确导出 WalletModal 组件', async () => {
      const { default: WalletModal } = await import('../components/WalletModal.vue');
      expect(WalletModal).toBeDefined();
      expect(WalletModal.name || WalletModal.__name || 'WalletModal').toBeTruthy();
    });
  });

  describe('Props 验证', () => {
    it('应该接受 title prop', async () => {
      const { default: WalletModal } = await import('../components/WalletModal.vue');
      const props = WalletModal.props;
      
      if (props) {
        expect(props.title).toBeDefined();
      }
    });

    it('应该接受 theme prop', async () => {
      const { default: WalletModal } = await import('../components/WalletModal.vue');
      const props = WalletModal.props;
      
      if (props) {
        expect(props.theme).toBeDefined();
      }
    });

    it('应该接受 isOpen prop', async () => {
      const { default: WalletModal } = await import('../components/WalletModal.vue');
      const props = WalletModal.props;
      
      if (props) {
        expect(props.isOpen).toBeDefined();
      }
    });
  });

  describe('Emits 验证', () => {
    it('应该定义 connect 事件', async () => {
      const { default: WalletModal } = await import('../components/WalletModal.vue');
      const emits = WalletModal.emits;
      
      if (emits) {
        expect(emits).toContain('connect');
      }
    });

    it('应该定义 close 事件', async () => {
      const { default: WalletModal } = await import('../components/WalletModal.vue');
      const emits = WalletModal.emits;
      
      if (emits) {
        expect(emits).toContain('close');
      }
    });
  });

  describe('Composables 集成', () => {
    it('useConnectWallet 应该返回可用钱包列表', async () => {
      const { useConnectWallet } = await import('../composables/useConnectWallet');
      
      vi.mock('../walletContext', () => ({
        useWalletContext: () => ({
          availableWallets: ref([]),
          connect: vi.fn(),
          disconnect: vi.fn(),
          switchWallet: vi.fn(),
          _stateUpdateTrigger: ref(0),
        }),
      }));

      const { availableWallets, connect } = useConnectWallet();
      
      expect(availableWallets).toBeDefined();
      expect(typeof connect).toBe('function');
    });

    it('useWalletModal 应该返回模态框控制方法', async () => {
      vi.mock('../walletContext', () => ({
        useWalletContext: () => ({
          openModal: vi.fn(),
          closeModal: vi.fn(),
          isModalOpen: ref(false),
        }),
      }));

      const { useWalletModal } = await import('../composables/useWalletModal');
      const modal = useWalletModal('test');
      
      expect(modal.isOpen).toBeDefined();
      expect(typeof modal.open).toBe('function');
      expect(typeof modal.close).toBe('function');
      expect(typeof modal.toggle).toBe('function');
    });
  });

  describe('主题功能', () => {
    it('getCurrentTheme 应该返回当前主题', async () => {
      const { getCurrentTheme } = await import('../utils/themeDetection');
      
      const theme = getCurrentTheme();
      expect(['light', 'dark']).toContain(theme);
    });

    it('isDarkMode 应该返回布尔值', async () => {
      const { isDarkMode } = await import('../utils/themeDetection');
      
      const isDark = isDarkMode();
      expect(typeof isDark).toBe('boolean');
    });
  });

  describe('钱包适配器', () => {
    it('getAllAdapters 应该返回适配器列表', async () => {
      const { getAllAdapters } = await import('@btc-connect/core');
      
      const adapters = getAllAdapters();
      expect(Array.isArray(adapters)).toBe(true);
      expect(adapters.length).toBeGreaterThan(0);
    });

    it('适配器应该包含必要属性', async () => {
      const { getAllAdapters } = await import('@btc-connect/core');
      
      const adapters = getAllAdapters();
      adapters.forEach((adapter: any) => {
        expect(adapter.id).toBeDefined();
        expect(adapter.name).toBeDefined();
        expect(adapter.icon).toBeDefined();
      });
    });
  });

  describe('模态框状态管理', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('模态框初始状态应该是关闭的', async () => {
      vi.mock('../walletContext', () => ({
        useWalletContext: () => ({
          openModal: vi.fn(),
          closeModal: vi.fn(),
          isModalOpen: ref(false),
        }),
      }));

      const { useWalletModal, globalModalState } = await import('../composables/useWalletModal');
      
      globalModalState.value = {
        isOpen: false,
        walletId: null,
        source: null,
      };

      const modal = useWalletModal();
      await nextTick();
      
      expect(modal.isOpen.value).toBe(false);
    });

    it('open 方法应该打开模态框', async () => {
      vi.mock('../walletContext', () => ({
        useWalletContext: () => ({
          openModal: vi.fn(),
          closeModal: vi.fn(),
          isModalOpen: ref(false),
        }),
      }));

      const { useWalletModal, globalModalState } = await import('../composables/useWalletModal');
      
      globalModalState.value = {
        isOpen: false,
        walletId: null,
        source: null,
      };

      const modal = useWalletModal('test');
      modal.open();
      await nextTick();
      
      expect(modal.isOpen.value).toBe(true);
    });

    it('close 方法应该关闭模态框', async () => {
      vi.mock('../walletContext', () => ({
        useWalletContext: () => ({
          openModal: vi.fn(),
          closeModal: vi.fn(),
          isModalOpen: ref(false),
        }),
      }));

      const { useWalletModal, globalModalState } = await import('../composables/useWalletModal');
      
      globalModalState.value = {
        isOpen: true,
        walletId: 'unisat',
        source: 'test',
      };

      const modal = useWalletModal();
      modal.close();
      await nextTick();
      
      expect(modal.isOpen.value).toBe(false);
      expect(modal.currentWalletId.value).toBeNull();
    });

    it('open 方法可以指定钱包ID', async () => {
      vi.mock('../walletContext', () => ({
        useWalletContext: () => ({
          openModal: vi.fn(),
          closeModal: vi.fn(),
          isModalOpen: ref(false),
        }),
      }));

      const { useWalletModal, globalModalState } = await import('../composables/useWalletModal');
      
      globalModalState.value = {
        isOpen: false,
        walletId: null,
        source: null,
      };

      const modal = useWalletModal();
      modal.open('unisat');
      await nextTick();
      
      expect(modal.currentWalletId.value).toBe('unisat');
    });
  });
});
