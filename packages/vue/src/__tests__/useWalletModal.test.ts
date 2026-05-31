/**
 * useWalletModal Composable 测试
 *
 * 测试钱包模态框管理功能
 */

import { describe, it, expect, beforeEach, vi } from 'bun:test';
import { nextTick } from 'vue';
import { useWalletModal, globalModalState, useGlobalModal } from '../composables/useWalletModal';
import type { UseWalletModalReturn } from '../types';

// Mock useWalletContext
vi.mock('../walletContext', () => ({
  useWalletContext: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: { value: false },
  }),
}));

describe('useWalletModal', () => {
  // 每个测试前重置全局状态
  beforeEach(() => {
    globalModalState.value = {
      isOpen: false,
      walletId: null,
      source: null,
    };
    vi.clearAllMocks();
  });

  describe('基础功能', () => {
    it('应该返回所有必要的属性和方法', () => {
      const modal = useWalletModal('test-source');

      expect(modal.isOpen).toBeDefined();
      expect(modal.open).toBeDefined();
      expect(modal.close).toBeDefined();
      expect(modal.toggle).toBeDefined();
      expect(modal.forceClose).toBeDefined();
      expect(modal.currentWalletId).toBeDefined();
      expect(modal.modalSource).toBeDefined();
    });

    it('初始状态应该是关闭的', () => {
      const modal = useWalletModal();

      expect(modal.isOpen.value).toBe(false);
      expect(modal.currentWalletId.value).toBeNull();
      expect(modal.modalSource.value).toBeNull();
    });
  });

  describe('open/close/toggle 功能', () => {
    it('open() 应该打开模态框', async () => {
      const modal = useWalletModal('test-source');

      modal.open();

      await nextTick();

      expect(modal.isOpen.value).toBe(true);
    });

    it('open(walletId) 应该设置当前钱包ID', async () => {
      const modal = useWalletModal();

      modal.open('unisat');

      await nextTick();

      expect(modal.currentWalletId.value).toBe('unisat');
    });

    it('close() 应该关闭模态框并重置状态', async () => {
      const modal = useWalletModal();

      modal.open('unisat');
      await nextTick();

      modal.close();
      await nextTick();

      expect(modal.isOpen.value).toBe(false);
      expect(modal.currentWalletId.value).toBeNull();
      expect(modal.modalSource.value).toBeNull();
    });

    it('toggle() 应该切换模态框状态', async () => {
      const modal = useWalletModal();

      // 初始关闭状态
      expect(modal.isOpen.value).toBe(false);

      // 切换为打开
      modal.toggle();
      await nextTick();
      expect(modal.isOpen.value).toBe(true);

      // 再次切换为关闭
      modal.toggle();
      await nextTick();
      expect(modal.isOpen.value).toBe(false);
    });
  });

  describe('isOpen 状态', () => {
    it('isOpen 应该是响应式的', async () => {
      const modal = useWalletModal();

      expect(modal.isOpen.value).toBe(false);

      globalModalState.value.isOpen = true;
      await nextTick();

      expect(modal.isOpen.value).toBe(true);
    });

    it('设置 isOpen 应该同步更新全局状态', async () => {
      const modal = useWalletModal('setter-test');

      modal.isOpen.value = true;
      await nextTick();

      expect(globalModalState.value.isOpen).toBe(true);
      expect(globalModalState.value.source).toBe('setter-test');
    });
  });

  describe('currentWalletId 管理', () => {
    it('open() 不传参数时 walletId 应该为 null', async () => {
      const modal = useWalletModal();

      modal.open();
      await nextTick();

      expect(modal.currentWalletId.value).toBeNull();
    });

    it('open(walletId) 应该正确设置 walletId', async () => {
      const modal = useWalletModal();

      modal.open('okx');
      await nextTick();

      expect(modal.currentWalletId.value).toBe('okx');
    });

    it('close() 应该清除 walletId', async () => {
      const modal = useWalletModal();

      modal.open('unisat');
      await nextTick();
      expect(modal.currentWalletId.value).toBe('unisat');

      modal.close();
      await nextTick();

      expect(modal.currentWalletId.value).toBeNull();
    });
  });

  describe('modalSource 追踪', () => {
    it('open() 应该记录来源', async () => {
      const modal = useWalletModal('header-button');

      modal.open();
      await nextTick();

      expect(modal.modalSource.value).toBe('header-button');
    });

    it('open() 不传 source 时应该使用默认值', async () => {
      const modal = useWalletModal();

      modal.open();
      await nextTick();

      expect(modal.modalSource.value).toBe('unknown');
    });

    it('close() 应该清除 source', async () => {
      const modal = useWalletModal('test-source');

      modal.open();
      await nextTick();
      expect(modal.modalSource.value).toBe('test-source');

      modal.close();
      await nextTick();

      expect(modal.modalSource.value).toBeNull();
    });
  });

  describe('状态重置', () => {
    it('forceClose() 应该强制关闭并重置所有状态', async () => {
      const modal = useWalletModal('force-test');

      modal.open('unisat');
      await nextTick();

      modal.forceClose();
      await nextTick();

      expect(modal.isOpen.value).toBe(false);
      expect(modal.currentWalletId.value).toBeNull();
      expect(modal.modalSource.value).toBeNull();
    });

    it('多次调用 close() 不应该报错', async () => {
      const modal = useWalletModal();

      modal.open();
      await nextTick();

      expect(() => {
        modal.close();
        modal.close();
        modal.close();
      }).not.toThrow();
    });
  });

  describe('全局状态共享', () => {
    it('多个 useWalletModal 实例应该共享同一状态', async () => {
      const modal1 = useWalletModal('instance-1');
      const modal2 = useWalletModal('instance-2');

      modal1.open('unisat');
      await nextTick();

      // 两个实例应该看到相同的状态
      expect(modal1.isOpen.value).toBe(true);
      expect(modal2.isOpen.value).toBe(true);
      expect(modal1.currentWalletId.value).toBe('unisat');
      expect(modal2.currentWalletId.value).toBe('unisat');
    });

    it('一个实例关闭应该影响其他实例', async () => {
      const modal1 = useWalletModal();
      const modal2 = useWalletModal();

      modal1.open();
      await nextTick();

      modal2.close();
      await nextTick();

      expect(modal1.isOpen.value).toBe(false);
      expect(modal2.isOpen.value).toBe(false);
    });
  });
});

describe('useGlobalModal', () => {
  beforeEach(() => {
    globalModalState.value = {
      isOpen: false,
      walletId: null,
      source: null,
    };
  });

  it('应该提供 open, close, getState 方法', () => {
    const globalModal = useGlobalModal();

    expect(globalModal.open).toBeDefined();
    expect(globalModal.close).toBeDefined();
    expect(globalModal.getState).toBeDefined();
    expect(globalModal.state).toBeDefined();
  });

  it('open() 应该打开全局模态框', async () => {
    const globalModal = useGlobalModal();

    globalModal.open('global-test');
    await nextTick();

    expect(globalModalState.value.isOpen).toBe(true);
    expect(globalModalState.value.source).toBe('global-test');
  });

  it('close() 应该关闭全局模态框', async () => {
    const globalModal = useGlobalModal();

    globalModal.open();
    await nextTick();

    globalModal.close();
    await nextTick();

    expect(globalModalState.value.isOpen).toBe(false);
    expect(globalModalState.value.walletId).toBeNull();
    expect(globalModalState.value.source).toBeNull();
  });

  it('getState() 应该返回当前状态的副本', () => {
    const globalModal = useGlobalModal();

    globalModalState.value = {
      isOpen: true,
      walletId: 'test-wallet',
      source: 'test-source',
    };

    const state = globalModal.getState();

    expect(state.isOpen).toBe(true);
    expect(state.walletId).toBe('test-wallet');
    expect(state.source).toBe('test-source');

    // 修改返回的状态不应该影响原始状态
    state.isOpen = false;
    expect(globalModalState.value.isOpen).toBe(true);
  });
});
