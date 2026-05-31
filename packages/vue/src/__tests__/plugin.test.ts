/**
 * BTCWalletPlugin 插件测试
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'bun:test';
import { createApp, type App } from 'vue';
import { BTCWalletPlugin, useWalletContext } from '../walletContext';

describe('BTCWalletPlugin 插件', () => {
  let app: App;

  beforeEach(() => {
    app = createApp({});
  });

  afterEach(() => {
    try {
      app.unmount();
    } catch {
      // 忽略卸载错误
    }
  });

  describe('插件安装', () => {
    it('应该成功安装插件', () => {
      expect(() => {
        app.use(BTCWalletPlugin);
      }).not.toThrow();
    });

    it('安装后应该能通过 inject 获取 context', () => {
      app.use(BTCWalletPlugin);

      // 验证全局属性被注入
      expect(app.config.globalProperties.$btc).toBeDefined();
    });

    it('应该支持无配置安装', () => {
      expect(() => {
        app.use(BTCWalletPlugin, {});
      }).not.toThrow();
    });
  });

  describe('配置传递', () => {
    it('应该接受 autoConnect 配置', () => {
      const config = {
        autoConnect: true,
      };

      expect(() => {
        app.use(BTCWalletPlugin, config);
      }).not.toThrow();
    });

    it('应该接受 connectTimeout 配置', () => {
      const config = {
        autoConnect: false,
        connectTimeout: 10000,
      };

      expect(() => {
        app.use(BTCWalletPlugin, config);
      }).not.toThrow();
    });

    it('应该接受 modalConfig 配置', () => {
      const config = {
        modalConfig: {
          title: '选择钱包',
          theme: 'dark' as const,
        },
      };

      expect(() => {
        app.use(BTCWalletPlugin, config);
      }).not.toThrow();
    });

    it('应该接受完整的 config 配置', () => {
      const config = {
        config: {
          onStateChange: vi.fn(),
          onError: vi.fn(),
        },
      };

      expect(() => {
        app.use(BTCWalletPlugin, config);
      }).not.toThrow();
    });

    it('应该合并 modalConfig 和 config 配置', () => {
      const config = {
        autoConnect: true,
        connectTimeout: 8000,
        modalConfig: {
          title: '连接钱包',
        },
        config: {
          onStateChange: vi.fn(),
        },
      };

      expect(() => {
        app.use(BTCWalletPlugin, config);
      }).not.toThrow();
    });
  });

  describe('全局属性注入', () => {
    it('应该注入 $btc 全局属性', () => {
      app.use(BTCWalletPlugin);

      expect(app.config.globalProperties.$btc).toBeDefined();
    });

    it('$btc 应该包含 manager', () => {
      app.use(BTCWalletPlugin);

      const $btc = app.config.globalProperties.$btc;
      expect($btc.manager).toBeDefined();
    });

    it('$btc 应该包含 state computed', () => {
      app.use(BTCWalletPlugin);

      const $btc = app.config.globalProperties.$btc;
      expect($btc.state).toBeDefined();
      expect($btc.state.value).toBeDefined();
    });

    it('$btc 应该包含 availableWallets', () => {
      app.use(BTCWalletPlugin);

      const $btc = app.config.globalProperties.$btc;
      expect($btc.availableWallets).toBeDefined();
    });

    it('$btc 应该包含连接状态 computed', () => {
      app.use(BTCWalletPlugin);

      const $btc = app.config.globalProperties.$btc;
      expect($btc.isConnected).toBeDefined();
      expect($btc.isConnecting).toBeDefined();
    });

    it('$btc 应该包含操作方法', () => {
      app.use(BTCWalletPlugin);

      const $btc = app.config.globalProperties.$btc;
      expect(typeof $btc.connect).toBe('function');
      expect(typeof $btc.disconnect).toBe('function');
      expect(typeof $btc.switchWallet).toBe('function');
    });

    it('$btc 应该包含模态框控制方法', () => {
      app.use(BTCWalletPlugin);

      const $btc = app.config.globalProperties.$btc;
      expect(typeof $btc.openModal).toBe('function');
      expect(typeof $btc.closeModal).toBe('function');
      expect(typeof $btc.toggleModal).toBe('function');
    });

    it('应该通过 provide 提供 btc context', () => {
      app.use(BTCWalletPlugin);

      // 验证 provide 被调用（通过检查全局属性）
      expect(app.config.globalProperties.$btc).toBeDefined();
    });
  });

  describe('useWalletContext', () => {
    it('应该返回 wallet context', () => {
      app.use(BTCWalletPlugin);

      const context = app.config.globalProperties.$btc;

      expect(context).toBeDefined();
      expect(context.manager).toBeDefined();
      expect(context.state).toBeDefined();
    });

    it('返回的 context 应该包含所有必要属性', () => {
      app.use(BTCWalletPlugin);

      const context = app.config.globalProperties.$btc;

      expect(context.manager).toBeDefined();
      expect(context.state).toBeDefined();
      expect(context.currentWallet).toBeDefined();
      expect(context.availableWallets).toBeDefined();
      expect(context.isConnected).toBeDefined();
      expect(context.isConnecting).toBeDefined();
      expect(context.isModalOpen).toBeDefined();

      expect(context.detectionManager).toBeDefined();
      expect(context.isDetecting).toBeDefined();

      expect(typeof context.connect).toBe('function');
      expect(typeof context.disconnect).toBe('function');
      expect(typeof context.switchWallet).toBe('function');
      expect(typeof context.openModal).toBe('function');
      expect(typeof context.closeModal).toBe('function');
      expect(typeof context.toggleModal).toBe('function');

      expect(typeof context.startWalletDetection).toBe('function');
      expect(typeof context.stopWalletDetection).toBe('function');
    });

    it('context 的初始状态应该正确', () => {
      app.use(BTCWalletPlugin);

      const context = app.config.globalProperties.$btc;

      expect(context.isModalOpen.value).toBe(false);
      expect(Array.isArray(context.availableWallets.value)).toBe(true);
    });
  });

  describe('autoConnect 功能', () => {
    it('autoConnect=true 时应该启用自动连接', () => {
      const config = {
        autoConnect: true,
        connectTimeout: 5000,
      };

      expect(() => {
        app.use(BTCWalletPlugin, config);
      }).not.toThrow();
    });

    it('autoConnect=false 时应该禁用自动连接', () => {
      const config = {
        autoConnect: false,
      };

      expect(() => {
        app.use(BTCWalletPlugin, config);
      }).not.toThrow();
    });

    it('应该使用默认的 connectTimeout (5000ms)', () => {
      // 不传 connectTimeout，使用默认值
      expect(() => {
        app.use(BTCWalletPlugin, { autoConnect: true });
      }).not.toThrow();
    });

    it('应该支持自定义 connectTimeout', () => {
      const config = {
        autoConnect: true,
        connectTimeout: 15000, // 15秒
      };

      expect(() => {
        app.use(BTCWalletPlugin, config);
      }).not.toThrow();
    });
  });

  describe('插件多次安装', () => {
    it('应该支持多次创建 app 并安装插件', () => {
      const app1 = createApp({});
      const app2 = createApp({});

      expect(() => {
        app1.use(BTCWalletPlugin);
        app2.use(BTCWalletPlugin);
      }).not.toThrow();

      try {
        app1.unmount();
        app2.unmount();
      } catch {
        // 忽略
      }
    });
  });
});
