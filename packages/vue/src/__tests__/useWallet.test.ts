/**
 * useWallet Composable 测试
 */
import { describe, it, expect } from 'bun:test';

describe('useWallet Composable', () => {
  describe('函数导出验证', () => {
    it('应该导出 useWallet 函数', async () => {
      const { useWallet } = await import('../composables/useWallet');
      expect(typeof useWallet).toBe('function');
    });
  });

  describe('返回值结构验证', () => {
    it('应该返回所有必要的属性', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.status).toBeDefined();
      expect(wallet.accounts).toBeDefined();
      expect(wallet.currentAccount).toBeDefined();
      expect(wallet.network).toBeDefined();
      expect(wallet.error).toBeDefined();
      expect(wallet.currentWallet).toBeDefined();
      expect(wallet.isConnected).toBeDefined();
      expect(wallet.isConnecting).toBeDefined();
    });

    it('应该返回账户信息属性', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.address).toBeDefined();
      expect(wallet.balance).toBeDefined();
      expect(wallet.publicKey).toBeDefined();
    });

    it('应该返回连接操作方法', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.connect).toBe('function');
      expect(typeof wallet.disconnect).toBe('function');
      expect(typeof wallet.switchWallet).toBe('function');
      expect(wallet.availableWallets).toBeDefined();
    });

    it('应该返回网络管理方法', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.switchNetwork).toBe('function');
    });

    it('应该返回模态框控制对象', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.walletModal).toBeDefined();
      expect(wallet.walletModal.isOpen).toBeDefined();
      expect(typeof wallet.walletModal.open).toBe('function');
      expect(typeof wallet.walletModal.close).toBe('function');
      expect(typeof wallet.walletModal.toggle).toBe('function');
    });

    it('应该返回签名功能方法', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.signMessage).toBe('function');
      expect(typeof wallet.signPsbt).toBe('function');
    });

    it('应该返回交易功能方法', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.sendBitcoin).toBe('function');
    });

    it('应该返回工具函数对象', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.utils).toBeDefined();
      expect(typeof wallet.utils.formatAddress).toBe('function');
      expect(typeof wallet.utils.formatBalance).toBe('function');
    });

    it('应该返回事件监听功能', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.useWalletEvent).toBeDefined();
      expect(typeof wallet.useWalletEvent).toBe('function');
    });

    it('应该返回管理器相关属性', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.currentAdapter).toBeDefined();
      expect(wallet.allAdapters).toBeDefined();
      expect(wallet.manager).toBeDefined();
    });
  });

  describe('工具函数功能', () => {
    it('formatAddress 应该正确格式化地址', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      const formatted = wallet.utils.formatAddress(address, {
        startChars: 6,
        endChars: 4,
      });

      expect(formatted).toBe('bc1qxy...0wlh');
    });

    it('formatAddress 应该支持自定义分隔符', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      const formatted = wallet.utils.formatAddress(address, {
        startChars: 4,
        endChars: 4,
        separator: '***',
      });

      expect(formatted).toBe('bc1q***0wlh');
    });

    it('formatAddress 没有选项时应该返回原地址', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      const formatted = wallet.utils.formatAddress(address);

      expect(formatted).toBe(address);
    });

    it('formatBalance 应该正确格式化余额', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      const satoshis = 100000000;
      const formatted = wallet.utils.formatBalance(satoshis);

      expect(formatted).toBe('1.00000000 BTC');
    });

    it('formatBalance 应该支持自定义精度', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      const satoshis = 50000000;
      const formatted = wallet.utils.formatBalance(satoshis, { precision: 4 });

      expect(formatted).toBe('0.5000 BTC');
    });

    it('formatBalance 应该正确处理零余额', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      const formatted = wallet.utils.formatBalance(0);

      expect(formatted).toBe('0.00000000 BTC');
    });
  });

  describe('初始状态', () => {
    it('status 应该是 computed ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.status.value).toBeDefined();
    });

    it('accounts 应该是 computed ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(Array.isArray(wallet.accounts.value)).toBe(true);
    });

    it('isConnected 应该是 computed ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.isConnected.value).toBe('boolean');
    });

    it('isConnecting 应该是 computed ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.isConnecting.value).toBe('boolean');
    });

    it('network 应该有默认值', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.network.value).toBeDefined();
    });

    it('address 应该是 computed ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.address.value).toBeDefined();
    });

    it('balance 应该是 computed ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.balance.value).toBeDefined();
    });

    it('publicKey 应该是 computed ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(wallet.publicKey.value).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('没有 manager 时 connect 应该抛出错误', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      await expect(wallet.connect('unisat')).rejects.toThrow();
    });

    it('没有 manager 时 switchNetwork 应该抛出错误', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      await expect(wallet.switchNetwork('testnet')).rejects.toThrow();
    });

    it('没有适配器时 signMessage 应该抛出错误', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      await expect(wallet.signMessage('test')).rejects.toThrow(
        'Message signing not supported',
      );
    });

    it('没有适配器时 signPsbt 应该抛出错误', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      await expect(wallet.signPsbt('test-psbt')).rejects.toThrow(
        'PSBT signing not supported',
      );
    });

    it('没有适配器时 sendBitcoin 应该抛出错误', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      await expect(wallet.sendBitcoin('bc1qtest', 1000)).rejects.toThrow(
        'Bitcoin sending not supported',
      );
    });
  });

  describe('模态框控制', () => {
    it('walletModal.isOpen 应该是 ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.walletModal.isOpen.value).toBe('boolean');
    });

    it('walletModal.open 应该是函数', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.walletModal.open).toBe('function');
    });

    it('walletModal.close 应该是函数', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.walletModal.close).toBe('function');
    });

    it('walletModal.toggle 应该是函数', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.walletModal.toggle).toBe('function');
    });
  });

  describe('availableWallets', () => {
    it('availableWallets 应该是 computed ref', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(Array.isArray(wallet.availableWallets.value)).toBe(true);
    });
  });

  describe('useWalletEvent 功能', () => {
    it('useWalletEvent 应该是函数', async () => {
      const { useWallet } = await import('../composables/useWallet');

      const wallet = useWallet();

      expect(typeof wallet.useWalletEvent).toBe('function');
    });
  });
});
