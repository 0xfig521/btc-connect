# API 参考文档

本文档提供 btc-connect 所有 API 的详细说明和完整示例代码。

## 目录

- [核心包 API](#核心包-api)
- [React 包 API](#react-包-api)
- [Vue 包 API](#vue-包-api)
- [类型定义](#类型定义)
- [工具函数](#工具函数)
- [事件系统](#事件系统)

## 核心包 API

### BTCWalletManager

核心钱包管理器，提供统一的钱包操作接口。

```typescript
import { BTCWalletManager } from '@btc-connect/core';

const manager = new BTCWalletManager(config?: WalletManagerConfig);
```

#### 构造函数参数

```typescript
interface WalletManagerConfig {
  walletOrder?: string[];           // 钱包优先级顺序
  featuredWallets?: string[];        // 特色钱包列表
  theme?: ThemeMode;                 // 主题模式
  animation?: string;                // 动画效果
  showTestnet?: boolean;             // 是否显示测试网
  showRegtest?: boolean;             // 是否显示回归测试网
  connectionPolicy?: ConnectionPolicy; // 连接策略
}
```

#### 主要方法

##### connect(walletId: string)
连接指定钱包。

```typescript
const accounts = await manager.connect('unisat');
console.log('连接的账户:', accounts);
```

**参数:**
- `walletId: string` - 钱包ID (如 'unisat', 'okx', 'xverse')

**返回值:**
- `Promise<AccountInfo[]>` - 连接的账户信息数组

##### disconnect()
断开当前钱包连接。

```typescript
await manager.disconnect();
console.log('已断开连接');
```

**返回值:**
- `Promise<void>`

##### switchWallet(walletId: string)
切换到指定钱包。

```typescript
const accounts = await manager.switchWallet('okx');
console.log('切换到OKX钱包:', accounts);
```

**参数:**
- `walletId: string` - 目标钱包ID

**返回值:**
- `Promise<AccountInfo[]>` - 新钱包的账户信息数组

##### switchNetwork(network: Network)
切换网络。

```typescript
await manager.switchNetwork('testnet');
console.log('已切换到测试网');
```

**参数:**
- `network: Network` - 目标网络 ('livenet' | 'testnet' | 'regtest' | 'mainnet')

**返回值:**
- `Promise<void>`

##### 事件监听

```typescript
// 监听连接事件
manager.on('connect', (accounts) => {
  console.log('钱包已连接:', accounts);
});

// 监听断开事件
manager.on('disconnect', () => {
  console.log('钱包已断开');
});

// 监听账户变化
manager.on('accountChange', (accounts) => {
  console.log('账户已变化:', accounts);
});

// 监听网络变化
manager.on('networkChange', ({ network }) => {
  console.log('网络已切换到:', network);
});

// 移除事件监听器
manager.off('connect', handler);
```

### 钱包适配器

#### BTCWalletAdapter 接口

所有钱包适配器必须实现的接口。

```typescript
interface BTCWalletAdapter {
  readonly id: string;                    // 钱包唯一标识
  readonly name: string;                  // 钱包名称
  readonly icon: string;                  // 钱包图标URL

  // 状态检查
  isReady(): boolean;                     // 钱包是否就绪
  getState(): WalletState;                // 获取钱包状态

  // 连接管理
  connect(): Promise<AccountInfo[]>;      // 连接钱包
  disconnect(): Promise<void>;            // 断开连接

  // 账户信息
  getAccounts(): Promise<AccountInfo[]>;  // 获取所有账户
  getCurrentAccount(): Promise<AccountInfo | null>; // 获取当前账户

  // 网络管理
  getNetwork(): Promise<Network>;        // 获取当前网络
  switchNetwork(network: Network): Promise<void>; // 切换网络

  // 事件系统
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;

  // 签名功能
  signMessage(message: string): Promise<string>;     // 签名消息
  signPsbt(psbt: string): Promise<string>;           // 签名PSBT
  sendBitcoin(toAddress: string, amount: number): Promise<string>; // 发送比特币
}
```

## React 包 API

### BTCWalletProvider

React Context Provider，为应用提供钱包状态管理。

```typescript
import { BTCWalletProvider } from '@btc-connect/react';

function App() {
  return (
    <BTCWalletProvider
      autoConnect={true}
      connectTimeout={5000}
      theme="auto"
      config={{
        walletOrder: ['unisat', 'okx', 'xverse'],
        featuredWallets: ['unisat', 'okx']
      }}
    >
      <YourApp />
    </BTCWalletProvider>
  );
}
```

#### Provider 属性

```typescript
interface WalletProviderProps {
  children: ReactNode;                    // 子组件
  config?: WalletManagerConfig;            // 钱包管理器配置
  autoConnect?: boolean;                   // 是否自动连接
  connectTimeout?: number;                 // 连接超时时间(ms)
  connectionPolicy?: ConnectionPolicy;     // 连接策略
}
```

### Hooks

#### useWallet - 统一钱包访问点

提供所有钱包功能的统一访问点。

```typescript
import { useWallet } from '@btc-connect/react';

function WalletComponent() {
  const {
    // === 基础状态 ===
    status,              // 连接状态: 'disconnected' | 'connecting' | 'connected' | 'error'
    accounts,            // 账户列表
    currentAccount,      // 当前账户信息
    network,             // 当前网络
    error,               // 错误信息
    currentWallet,       // 当前钱包信息
    isConnected,         // 是否已连接
    isConnecting,        // 是否正在连接
    theme,               // 主题模式
    address,             // 当前地址
    balance,             // 当前余额（聪）
    publicKey,           // 当前公钥

    // === 连接操作 ===
    connect,             // 连接指定钱包
    disconnect,          // 断开当前连接
    switchWallet,        // 切换到指定钱包
    availableWallets,    // 可用钱包列表

    // === 网络管理 ===
    switchNetwork,       // 切换网络

    // === 事件监听功能 ===
    useWalletEvent,      // 事件监听Hook

    // === 模态框控制 ===
    walletModal,         // 模态框控制

    // === 钱包管理器功能 ===
    currentAdapter,      // 当前适配器
    allAdapters,         // 所有适配器
    manager,             // 原始管理器实例

    // === 签名功能 ===
    signMessage,         // 签名消息
    signPsbt,            // 签名PSBT

    // === 交易功能 ===
    sendBitcoin,         // 发送比特币

    // === 工具函数快捷访问 ===
    utils                // 工具函数对象
  } = useWallet();

  // 连接钱包示例
  const handleConnect = async () => {
    try {
      const accounts = await connect('unisat');
      console.log('连接成功:', accounts);
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  // 事件监听示例
  useWalletEvent('accountChange', (accounts) => {
    console.log('账户变化:', accounts);
  });

  // 工具函数使用示例
  const formattedAddress = utils.formatAddress(address || '', {
    startChars: 6,
    endChars: 4
  });
  const formattedBalance = utils.formatBalance(balance || 0, {
    unit: 'BTC'
  });

  return (
    <div>
      {isConnected ? (
        <div>
          <p>钱包: {currentWallet?.name}</p>
          <p>地址: {formattedAddress}</p>
          <p>余额: {formattedBalance}</p>
          <p>网络: {network}</p>
          <button onClick={() => disconnect()}>断开连接</button>
        </div>
      ) : (
        <button onClick={handleConnect}>连接 UniSat</button>
      )}
    </div>
  );
}
```

#### useWalletEvent - 事件监听

提供跨框架的事件监听功能，支持自动清理和事件历史记录。

```typescript
import { useWalletEvent } from '@btc-connect/react';

function EventListener() {
  const { on, once, clear, eventHistory } = useWalletEvent('connect', (accounts) => {
    console.log('钱包连接:', accounts);
  });

  // 添加额外监听器
  const addExtraListener = () => {
    on((accounts) => {
      console.log('额外监听器:', accounts);
    });
  };

  // 一次性监听
  const addOnceListener = () => {
    once('disconnect', () => {
      console.log('钱包断开（仅一次）');
    });
  };

  // 清理所有监听器
  const clearAllListeners = () => {
    clear();
  };

  // 查看事件历史
  console.log('事件历史:', eventHistory);

  return (
    <div>
      <button onClick={addExtraListener}>添加监听器</button>
      <button onClick={addOnceListener}>添加一次性监听</button>
      <button onClick={clearAllListeners}>清理所有监听器</button>
    </div>
  );
}
```

#### useWalletManager - 高级钱包管理器

提供高级钱包管理功能，包括适配器操作和统计信息。

```typescript
import { useWalletManager } from '@btc-connect/react';

function WalletManagerComponent() {
  const {
    currentAdapter,      // 当前激活的适配器
    availableAdapters,   // 所有可用适配器列表
    adapterStates,       // 适配器状态数组
    getAdapter,          // 获取指定钱包的适配器
    addAdapter,          // 添加新适配器
    removeAdapter,       // 移除适配器
    manager,             // 原始管理器实例
    stats                // 管理器统计信息
  } = useWalletManager();

  // 获取特定适配器
  const unisatAdapter = getAdapter('unisat');
  console.log('UniSat适配器:', unisatAdapter);

  // 添加自定义适配器
  const handleAddAdapter = () => {
    const customAdapter = createCustomAdapter();
    addAdapter(customAdapter);
  };

  // 移除适配器
  const handleRemoveAdapter = (walletId: string) => {
    removeAdapter(walletId);
  };

  return (
    <div>
      <h3>钱包管理器状态</h3>
      <p>当前适配器: {currentAdapter?.name || '无'}</p>
      <p>统计: {stats.connectedAdapters}/{stats.totalAdapters} 已连接</p>

      <div>
        <h4>适配器状态</h4>
        {adapterStates.map(state => (
          <div key={state.id}>
            <span>{state.name} - {state.isConnected ? '已连接' : '未连接'}</span>
            <button onClick={() => handleRemoveAdapter(state.id)}>移除</button>
          </div>
        ))}
      </div>

      <button onClick={handleAddAdapter}>添加自定义适配器</button>
    </div>
  );
}
```

#### useTheme - 主题管理

提供完整的主题管理系统，支持亮色/暗色/自动主题切换。

```typescript
import { useTheme } from '@btc-connect/react';

function ThemeSelector() {
  const {
    theme,               // 当前主题模式
    systemTheme,         // 系统主题模式
    effectiveTheme,      // 有效主题（考虑系统设置）
    setTheme,            // 设置主题
    setThemeMode,        // 设置主题模式
    setCustomTheme,      // 设置自定义主题
    resetTheme           // 重置为默认主题
  } = useTheme();

  const handleSetDarkTheme = () => setTheme('dark');
  const handleSetLightTheme = () => setTheme('light');
  const handleSetAutoTheme = () => setThemeMode('auto');

  const handleCustomTheme = () => {
    setCustomTheme({
      colors: {
        primary: '#ff6b35',
        background: '#1a1a1a',
        text: '#ffffff',
        border: '#333333'
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Helvetica, sans-serif'
      }
    });
  };

  return (
    <div>
      <p>当前主题: {theme}</p>
      <p>系统主题: {systemTheme}</p>
      <p>有效主题: {effectiveTheme}</p>

      <button onClick={handleSetLightTheme}>亮色主题</button>
      <button onClick={handleSetDarkTheme}>暗色主题</button>
      <button onClick={handleSetAutoTheme}>自动主题</button>
      <button onClick={handleCustomTheme}>自定义主题</button>
      <button onClick={resetTheme}>重置主题</button>
    </div>
  );
}
```

#### useWalletModalEnhanced - 增强模态框控制

增强的模态框控制功能，支持来源追踪和程序化控制。

```typescript
import { useWalletModalEnhanced } from '@btc-connect/react';

function ModalController() {
  const {
    isModalOpen,          // 模态框是否打开
    theme,                // 模态框主题
    openModal,            // 打开模态框
    closeModal,           // 关闭模态框
    toggleModal,          // 切换模态框状态
    forceClose,           // 强制关闭
    openWithSource,       // 带来源打开
    modalSource           // 模态框来源
  } = useWalletModalEnhanced();

  // 程序化打开模态框
  const openFromButton = () => {
    openWithSource('unisat', 'header-button');
  };

  // 紧急关闭模态框
  const handleForceClose = () => {
    forceClose();
  };

  return (
    <div>
      <p>模态框状态: {isModalOpen ? '打开' : '关闭'}</p>
      <p>来源: {modalSource || '无'}</p>

      <button onClick={openModal}>打开模态框</button>
      <button onClick={toggleModal}>切换状态</button>
      <button onClick={openFromButton}>从按钮打开</button>
      <button onClick={handleForceClose}>强制关闭</button>
      <button onClick={closeModal}>关闭模态框</button>
    </div>
  );
}
```

### 组件

#### ConnectButton

主要连接组件，已内置钱包选择模态框。

```typescript
import { ConnectButton } from '@btc-connect/react';

function App() {
  return (
    <div>
      {/* 基础用法 */}
      <ConnectButton />

      {/* 自定义主题和大小 */}
      <ConnectButton
        theme="dark"
        size="lg"
        variant="button"
        label="连接比特币钱包"
      />

      {/* 带事件处理 */}
      <ConnectButton
        onConnect={(walletId) => console.log('连接到:', walletId)}
        onError={(error) => console.error('连接错误:', error)}
        onDisconnect={() => console.log('已断开连接')}
      />
    </div>
  );
}
```

#### ConnectButton 属性

```typescript
interface ConnectButtonProps {
  theme?: 'light' | 'dark' | 'auto';    // 主题模式
  size?: 'sm' | 'md' | 'lg';             // 按钮大小
  variant?: 'select' | 'button' | 'compact'; // 显示变体
  label?: string;                         // 自定义标签
  disabled?: boolean;                     // 是否禁用
}
```

#### WalletModal

钱包选择模态框组件。

```typescript
import { WalletModal } from '@btc-connect/react';

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>打开钱包选择</button>

      <WalletModal
        isOpen={isOpen}
        theme="auto"
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
```

#### WalletModal 属性

```typescript
interface WalletModalProps {
  isOpen?: boolean;              // 是否打开
  theme?: 'light' | 'dark' | 'auto'; // 主题模式
  onClose?: () => void;          // 关闭回调
}
```

## Vue 包 API

### BTCWalletPlugin

Vue 3 插件，为应用提供钱包功能。

```typescript
// main.ts
import { createApp } from 'vue';
import { BTCWalletPlugin } from '@btc-connect/vue';
import App from './App.vue';

const app = createApp(App);

app.use(BTCWalletPlugin, {
  autoConnect: true,
  theme: 'auto',
  config: {
    walletOrder: ['unisat', 'okx', 'xverse'],
    featuredWallets: ['unisat', 'okx']
  }
});

app.mount('#app');
```

#### 插件配置

```typescript
interface BTCWalletPluginOptions {
  autoConnect?: boolean;                   // 是否自动连接
  connectTimeout?: number;                 // 连接超时时间(ms)
  theme?: ThemeMode;                       // 主题模式
  modalConfig?: ModalConfig;               // 模态框配置
  config?: WalletManagerConfig;            // 钱包管理器配置
}
```

### Composables

#### useWallet - 统一钱包访问点

提供所有钱包功能的统一访问点，返回响应式状态和方法。

```vue
<template>
  <div>
    <div v-if="isConnected">
      <p>钱包: {{ currentWallet?.name }}</p>
      <p>地址: {{ formattedAddress }}</p>
      <p>余额: {{ formattedBalance }}</p>
      <p>网络: {{ network }}</p>
      <button @click="disconnect">断开连接</button>
    </div>
    <div v-else>
      <button @click="handleConnect">连接 UniSat</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useWallet } from '@btc-connect/vue';

const {
  // === 基础状态 (响应式) ===
  status,              // Ref<ConnectionStatus>
  accounts,            // Ref<AccountInfo[]>
  currentAccount,      // Ref<AccountInfo | undefined>
  network,             // Ref<Network>
  error,               // Ref<Error | undefined>
  currentWallet,       // Ref<WalletInfo | null>
  isConnected,         // Ref<boolean>
  isConnecting,        // Ref<boolean>
  theme,               // Ref<ThemeMode>
  address,             // Ref<string | undefined>
  balance,             // Ref<number | undefined>
  publicKey,           // Ref<string | undefined>

  // === 连接操作 ===
  connect,             // (walletId: string) => Promise<AccountInfo[]>
  disconnect,          // () => Promise<void>
  switchWallet,        // (walletId: string) => Promise<AccountInfo[]>
  availableWallets,    // Ref<WalletInfo[]>

  // === 网络管理 ===
  switchNetwork,       // (network: Network) => Promise<void>

  // === 事件监听功能 ===
  useWalletEvent,      // UseWalletEventFunction

  // === 模态框控制 ===
  walletModal,         // UseWalletModalReturn

  // === 钱包管理器功能 ===
  currentAdapter,      // Ref<BTCWalletAdapter | null>
  allAdapters,         // Ref<BTCWalletAdapter[]>
  manager,             // Ref<BTCWalletManager>

  // === 签名功能 ===
  signMessage,         // (message: string) => Promise<string>
  signPsbt,            // (psbt: string) => Promise<string>

  // === 交易功能 ===
  sendBitcoin,         // (toAddress: string, amount: number) => Promise<string>

  // === 工具函数快捷访问 ===
  utils                // UtilsObject
} = useWallet();

// 计算属性
const formattedAddress = computed(() =>
  utils.formatAddress(address.value || '', { startChars: 6, endChars: 4 })
);

const formattedBalance = computed(() =>
  utils.formatBalance(balance.value || 0, { unit: 'BTC' })
);

// 连接钱包
const handleConnect = async () => {
  try {
    const accounts = await connect('unisat');
    console.log('连接成功:', accounts);
  } catch (error) {
    console.error('连接失败:', error);
  }
};

// 事件监听
useWalletEvent('accountChange', (accounts) => {
  console.log('账户变化:', accounts);
});
</script>
```

#### useWalletEvent - 事件监听

提供跨框架的事件监听功能，支持自动清理。

```vue
<template>
  <div>
    <p>事件历史数量: {{ eventHistory.length }}</p>
    <button @click="addListener">添加监听器</button>
    <button @click="addOnceListener">添加一次性监听</button>
    <button @click="clearAll">清理所有监听器</button>
  </div>
</template>

<script setup>
import { useWalletEvent } from '@btc-connect/vue';

const { on, once, clear, eventHistory } = useWalletEvent('connect', (accounts) => {
  console.log('钱包连接:', accounts);
});

// 添加额外监听器
const addListener = () => {
  on((accounts) => {
    console.log('额外监听器:', accounts);
  });
};

// 一次性监听
const addOnceListener = () => {
  once('disconnect', () => {
    console.log('钱包断开（仅一次）');
  });
};

// 清理所有监听器
const clearAll = () => {
  clear();
};
</script>
```

#### useWalletManager - 高级钱包管理器

提供高级钱包管理功能，包括适配器操作和统计信息。

```vue
<template>
  <div>
    <h3>钱包管理器状态</h3>
    <p>当前适配器: {{ currentAdapter?.name || '无' }}</p>
    <p>统计: {{ stats.connectedAdapters }}/{{ stats.totalAdapters }} 已连接</p>

    <div>
      <h4>适配器状态</h4>
      <div v-for="state in adapterStates" :key="state.id">
        <span>{{ state.name }} - {{ state.isConnected ? '已连接' : '未连接' }}</span>
        <button @click="removeAdapter(state.id)">移除</button>
      </div>
    </div>

    <button @click="addCustomAdapter">添加自定义适配器</button>
  </div>
</template>

<script setup>
import { useWalletManager } from '@btc-connect/vue';

const {
  currentAdapter,      // Ref<BTCWalletAdapter | null>
  availableAdapters,   // Ref<BTCWalletAdapter[]>
  adapterStates,       // Ref<AdapterState[]>
  getAdapter,          // (walletId: string) => BTCWalletAdapter | null
  addAdapter,          // (adapter: BTCWalletAdapter) => void
  removeAdapter,       // (walletId: string) => void
  manager,             // Ref<BTCWalletManager>
  stats                // ComputedRef<ManagerStats>
} = useWalletManager();

// 获取特定适配器
const unisatAdapter = getAdapter('unisat');
console.log('UniSat适配器:', unisatAdapter);

// 添加自定义适配器
const addCustomAdapter = () => {
  const customAdapter = createCustomAdapter();
  addAdapter(customAdapter);
};
</script>
```

#### useTheme - 主题管理

提供完整的主题系统，支持亮色/暗色/自动主题切换。

```vue
<template>
  <div>
    <p>当前主题: {{ theme }}</p>
    <p>系统主题: {{ systemTheme }}</p>
    <p>有效主题: {{ effectiveTheme }}</p>

    <button @click="setTheme('light')">亮色主题</button>
    <button @click="setTheme('dark')">暗色主题</button>
    <button @click="setThemeMode('auto')">自动主题</button>
    <button @click="setCustomTheme">自定义主题</button>
    <button @click="resetTheme">重置主题</button>
  </div>
</template>

<script setup>
import { useTheme } from '@btc-connect/vue';

const {
  theme,               // Ref<ThemeMode>
  systemTheme,         // Ref<ThemeMode>
  effectiveTheme,      // ComputedRef<ThemeMode>
  setTheme,            // (theme: ThemeMode) => void
  setThemeMode,        // (mode: ThemeMode) => void
  setCustomTheme,      // (theme: CustomTheme) => void
  resetTheme           // () => void
} = useTheme();

// 设置自定义主题
const setCustomTheme = () => {
  setCustomTheme({
    colors: {
      primary: '#ff6b35',
      background: '#1a1a1a',
      text: '#ffffff',
      border: '#333333'
    },
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Helvetica, sans-serif'
    }
  });
};
</script>
```

#### useWalletModal - 全局模态框控制

全局模态框状态管理，支持来源追踪和程序化控制。

```vue
<template>
  <div>
    <p>模态框状态: {{ isOpen ? '打开' : '关闭' }}</p>
    <p>来源: {{ modalSource || '无' }}</p>

    <button @click="open">打开模态框</button>
    <button @click="toggle">切换状态</button>
    <button @click="openFromButton">从按钮打开</button>
    <button @click="forceClose">强制关闭</button>
    <button @click="close">关闭模态框</button>
  </div>
</template>

<script setup>
import { useWalletModal } from '@btc-connect/vue';

const {
  isOpen,              // Ref<boolean>
  theme,                // ComputedRef<ThemeMode>
  open,                 // (walletId?: string) => void
  close,                // () => void
  toggle,               // () => void
  forceClose,           // () => void
  currentWalletId,      // Ref<string | null>
  modalSource           // Ref<string | null>
} = useWalletModal('CustomComponent');

// 程序化打开模态框
const openFromButton = () => {
  open('unisat'); // 可指定默认钱包
};
</script>
```

### 组件

#### ConnectButton

主要连接组件，已内置钱包选择模态框。

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <ConnectButton />

    <!-- 自定义主题和大小 -->
    <ConnectButton
      theme="dark"
      size="lg"
      variant="button"
      label="连接比特币钱包"
      @connect="handleConnect"
      @error="handleError"
      @disconnect="handleDisconnect"
    />
  </div>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue';

const handleConnect = (walletId) => {
  console.log('连接到:', walletId);
};

const handleError = (error) => {
  console.error('连接错误:', error);
};

const handleDisconnect = () => {
  console.log('已断开连接');
};
</script>
```

#### ConnectButton 属性

```typescript
interface ConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';             // 按钮大小
  variant?: 'select' | 'button' | 'compact'; // 显示变体
  label?: string;                         // 自定义标签
  disabled?: boolean;                     // 是否禁用
  theme?: 'light' | 'dark' | 'auto';    // 主题模式
  showBalance?: boolean;                  // 是否显示余额
  showAddress?: boolean;                  // 是否显示地址
  balancePrecision?: number;              // 余额精度
}
```

## 类型定义

### 核心类型

#### ConnectionStatus
```typescript
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
```

#### Network
```typescript
type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet';
```

#### ThemeMode
```typescript
type ThemeMode = 'light' | 'dark' | 'auto';
```

#### AccountInfo
```typescript
interface AccountInfo {
  address: string;        // 钱包地址
  publicKey?: string;     // 公钥
  name?: string;          // 账户名称
}
```

#### WalletInfo
```typescript
interface WalletInfo {
  id: string;             // 钱包ID
  name: string;           // 钱包名称
  icon: string;           // 钱包图标URL
  isInstalled: boolean;   // 是否已安装
  isReady: boolean;       // 是否就绪
}
```

#### WalletState
```typescript
interface WalletState {
  isConnected: boolean;           // 是否已连接
  isConnecting: boolean;          // 是否正在连接
  accounts: AccountInfo[];        // 账户列表
  currentAccount?: AccountInfo;   // 当前账户
  network: Network;               // 当前网络
  error?: Error;                  // 错误信息
}
```

### 事件类型

#### WalletEvent
```typescript
type WalletEvent = 'connect' | 'disconnect' | 'accountChange' | 'networkChange' | 'error';
```

#### EventHandler
```typescript
type EventHandler<T extends WalletEvent> = (
  ...args: EventHandlerArgs<T>
) => void;
```

#### EventHistoryItem
```typescript
interface EventHistoryItem {
  event: WalletEvent;        // 事件类型
  timestamp: number;          // 时间戳
  data: any;                 // 事件数据
}
```

### 配置类型

#### WalletManagerConfig
```typescript
interface WalletManagerConfig {
  walletOrder?: string[];           // 钱包优先级顺序
  featuredWallets?: string[];        // 特色钱包列表
  theme?: ThemeMode;                 // 主题模式
  animation?: string;                // 动画效果
  showTestnet?: boolean;             // 是否显示测试网
  showRegtest?: boolean;             // 是否显示回归测试网
  connectionPolicy?: ConnectionPolicy; // 连接策略
}
```

#### ConnectionPolicy
```typescript
interface ConnectionPolicy {
  tasks: ConnectionPolicyTask[];              // 连接任务列表
  emitEventsOnAutoConnect?: boolean;          // 自动连接时是否发射事件
}
```

#### ConnectionPolicyTask
```typescript
interface ConnectionPolicyTask {
  run: (context: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>;
  required?: boolean;           // 是否必须成功
  autoBehavior?: 'run' | 'skip'; // 自动连接时的行为
}
```

#### CustomTheme
```typescript
interface CustomTheme {
  colors?: {
    primary?: string;
    background?: string;
    text?: string;
    border?: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
  };
}
```

## 工具函数

### 地址格式化

```typescript
import { formatAddress } from '@btc-connect/core';

const options = {
  startChars: 6,    // 开头显示字符数
  endChars: 4,      // 结尾显示字符数
  separator: '...'  // 分隔符
};

const formatted = formatAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', options);
console.log(formatted); // "bc1qxy2...h0wlh"
```

### 余额格式化

```typescript
import { formatBalance } from '@btc-connect/core';

const options = {
  unit: 'BTC',           // 单位: 'BTC' | 'satoshi' | 'mBTC'
  precision: 8,          // 精度
  showSymbol: true,      // 是否显示符号
  locale: 'en-US'        // 地区设置
};

const formatted = formatBalance(123456789, options);
console.log(formatted); // "1.23456789 BTC"
```

### 复制到剪贴板

```typescript
import { copyToClipboard } from '@btc-connect/core';

const copyAddress = async () => {
  try {
    await copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
    console.log('地址已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
  }
};
```

### 地址验证

```typescript
import { validateAddress } from '@btc-connect/core';

const isValid = validateAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
console.log(isValid); // true

const isInvalid = validateAddress('invalid-address');
console.log(isInvalid); // false
```

### 金额验证

```typescript
import { validateAmount } from '@btc-connect/core';

const options = {
  minAmount: 1000,      // 最小金额（聪）
  maxAmount: 100000000, // 最大金额（聪）
  allowDecimals: false  // 是否允许小数
};

const isValid = validateAmount(50000, options);
console.log(isValid); // true
```

### 获取钱包图标

```typescript
import { getWalletIcon } from '@btc-connect/core';

const unisatIcon = getWalletIcon('unisat');
console.log(unisatIcon); // "https://example.com/icons/unisat.png"
```

### 时间戳格式化

```typescript
import { formatTimestamp } from '@btc-connect/core';

const options = {
  format: 'datetime',    // 格式: 'date' | 'time' | 'datetime'
  locale: 'zh-CN',       // 地区设置
  timezone: 'UTC'        // 时区
};

const formatted = formatTimestamp(Date.now(), options);
console.log(formatted); // "2024/1/1 12:00:00"
```

### 交易ID格式化

```typescript
import { formatTxid } from '@btc-connect/core';

const options = {
  startChars: 8,    // 开头显示字符数
  endChars: 8,      // 结尾显示字符数
  separator: '...'  // 分隔符
};

const formatted = formatTxid('f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16', options);
console.log(formatted); // "f4184fc5...e9e16"
```

### 费率计算

```typescript
import { calculateFeeRate } from '@btc-connect/core';

const feeRate = calculateFeeRate({
  fee: 1000,              // 手续费（聪）
  size: 250,              // 交易大小（字节）
  precision: 2            // 精度
});

console.log(feeRate); // 4.00 sat/byte
```

### 费率格式化

```typescript
import { formatFeeRate } from '@btc-connect/core';

const formatted = formatFeeRate(4.5, {
  unit: 'sat/byte',       // 单位
  precision: 2,           // 精度
  showUnit: true          // 是否显示单位
});

console.log(formatted); // "4.50 sat/byte"
```

## 事件系统

### 支持的事件类型

#### connect - 钱包连接
```typescript
manager.on('connect', (accounts: AccountInfo[]) => {
  console.log('钱包连接成功:', accounts);
});
```

#### disconnect - 钱包断开
```typescript
manager.on('disconnect', () => {
  console.log('钱包已断开连接');
});
```

#### accountChange - 账户变更
```typescript
manager.on('accountChange', (accounts: AccountInfo[]) => {
  console.log('账户已变更:', accounts);
});
```

#### networkChange - 网络变更
```typescript
manager.on('networkChange', (data: { network: Network }) => {
  console.log('网络已切换到:', data.network);
});
```

#### error - 错误发生
```typescript
manager.on('error', (error: Error) => {
  console.error('钱包错误:', error);
});
```

### React 事件监听

```typescript
import { useWalletEvent } from '@btc-connect/react';

function Component() {
  useWalletEvent('connect', (accounts) => {
    console.log('连接事件:', accounts);
  });

  return null;
}
```

### Vue 事件监听

```vue
<script setup>
import { useWalletEvent } from '@btc-connect/vue';

useWalletEvent('connect', (accounts) => {
  console.log('连接事件:', accounts);
});
</script>
```

### 事件历史记录

```typescript
// React
const { eventHistory } = useWalletEvent('connect', handler);
console.log('连接事件历史:', eventHistory);

// Vue
const { eventHistory } = useWalletEvent('connect', handler);
console.log('连接事件历史:', eventHistory.value);
```

## 错误处理

### 统一错误系统

#### UnifiedError

统一错误类，提供结构化的错误信息。

**属性：**
- `code: ErrorCode` - 错误码标识符
- `severity: ErrorSeverity` - 错误严重级别
- `message: string` - 错误消息
- `context: ErrorContext` - 错误上下文信息
- `originalError?: Error` - 原始错误（如果是包装错误）
- `timestamp: number` - 错误发生时间戳

**方法：**
- `getFullMessage(): string` - 获取包含上下文的完整错误消息
- `toJSON(): object` - 序列化错误为 JSON
- `withRetryCount(count: number): UnifiedError` - 创建带重试计数的错误副本
- `canRetry(): boolean` - 检查错误是否可重试

```typescript
import { UnifiedError, ErrorCode, ErrorSeverity } from '@btc-connect/core';

try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof UnifiedError) {
    console.log('错误码:', error.code);
    console.log('严重级别:', error.severity);
    console.log('完整消息:', error.getFullMessage());
    console.log('可重试:', error.canRetry());
    
    // 访问上下文
    if (error.context.walletId) {
      console.log('钱包:', error.context.walletId);
    }
  }
}
```

#### ErrorCode 枚举

标准化的错误码，按类别分组。

```typescript
import { ErrorCode } from '@btc-connect/core';

// 通用错误 (1xxx)
ErrorCode.UNKNOWN_ERROR        // '1000' - 未知错误
ErrorCode.INVALID_ARGUMENT     // '1001' - 无效参数
ErrorCode.NOT_IMPLEMENTED      // '1002' - 未实现
ErrorCode.TIMEOUT              // '1003' - 超时

// 钱包错误 (2xxx)
ErrorCode.WALLET_NOT_INSTALLED    // '2000' - 钱包未安装
ErrorCode.WALLET_NOT_CONNECTED    // '2001' - 钱包未连接
ErrorCode.WALLET_CONNECTION_FAILED // '2002' - 连接失败
ErrorCode.WALLET_DISCONNECTED     // '2003' - 钱包已断开
ErrorCode.WALLET_LOCKED           // '2004' - 钱包已锁定

// 网络错误 (3xxx)
ErrorCode.NETWORK_ERROR        // '3000' - 网络错误
ErrorCode.NETWORK_UNSUPPORTED  // '3001' - 不支持的网络
ErrorCode.NETWORK_SWITCH_FAILED // '3002' - 网络切换失败

// 交易错误 (4xxx)
ErrorCode.TRANSACTION_FAILED   // '4000' - 交易失败
ErrorCode.TRANSACTION_REJECTED // '4001' - 交易被拒绝
ErrorCode.TRANSACTION_TIMEOUT  // '4002' - 交易超时
ErrorCode.INSUFFICIENT_BALANCE // '4003' - 余额不足
ErrorCode.INVALID_ADDRESS      // '4004' - 无效地址
ErrorCode.INVALID_AMOUNT       // '4005' - 无效金额

// 签名错误 (5xxx)
ErrorCode.SIGNATURE_FAILED    // '5000' - 签名失败
ErrorCode.SIGNATURE_REJECTED  // '5001' - 签名被拒绝

// 配置错误 (6xxx)
ErrorCode.CONFIG_INVALID      // '6000' - 配置无效
ErrorCode.CONFIG_MISSING      // '6001' - 配置缺失
```

#### ErrorSeverity 枚举

错误严重级别，用于优先级排序和处理策略。

```typescript
import { ErrorSeverity } from '@btc-connect/core';

ErrorSeverity.LOW       // 'low' - 低级别，不影响核心功能
ErrorSeverity.MEDIUM    // 'medium' - 中级别，影响部分功能
ErrorSeverity.HIGH      // 'high' - 高级别，影响核心功能
ErrorSeverity.CRITICAL  // 'critical' - 严重级别，系统无法运行
```

#### ErrorContext 接口

详细的错误上下文信息。

```typescript
interface ErrorContext {
  // 钱包信息
  walletId?: string;
  walletName?: string;

  // 网络信息
  network?: string;
  chainId?: number;

  // 账户信息
  address?: string;
  publicKey?: string;

  // 交易信息
  txId?: string;
  txHash?: string;
  amount?: string;
  toAddress?: string;

  // 操作信息
  operation?: string;
  method?: string;
  params?: any;

  // 时间信息
  timestamp?: number;
  duration?: number;

  // 额外上下文
  metadata?: Record<string, any>;
  suggestion?: string;      // 解决建议

  // 重试信息
  retryable?: boolean;      // 是否可重试
  retryCount?: number;      // 当前重试次数
  maxRetries?: number;      // 最大重试次数
}
```

**使用示例：**

```typescript
const error = ErrorFactory.transactionFailed('手续费不足', {
  walletId: 'unisat',
  network: 'livenet',
  address: 'tb1q...',
  txId: 'abc123',
  amount: '10000',
  suggestion: '请提高交易手续费',
  retryable: true,
  maxRetries: 3
});

console.log(error.getFullMessage());
// [4000] Transaction failed: 手续费不足 | Severity: high | Wallet: unisat | Network: livenet | Suggestion: 请提高交易手续费
```

### ErrorFactory

工厂方法，用于创建常见错误类型。

```typescript
import { ErrorFactory } from '@btc-connect/core';

// 钱包错误
const error1 = ErrorFactory.walletNotInstalled('unisat');
const error2 = ErrorFactory.walletNotConnected('okx');
const error3 = ErrorFactory.walletConnectionFailed('unisat', '用户拒绝连接');

// 网络错误
const error4 = ErrorFactory.networkError('livenet', '连接超时');
const error5 = ErrorFactory.networkUnsupported('regtest');

// 交易错误
const error6 = ErrorFactory.transactionFailed('手续费不足');
const error7 = ErrorFactory.transactionRejected('用户取消');
const error8 = ErrorFactory.insufficientBalance('1000', '500');

// 签名错误
const error9 = ErrorFactory.signatureFailed('无效消息');
const error10 = ErrorFactory.signatureRejected('用户拒绝');

// 通用错误
const error11 = ErrorFactory.unknownError('未知错误');
const error12 = ErrorFactory.invalidArgument('address', 'string', 'number');
const error13 = ErrorFactory.notImplemented('某功能');
const error14 = ErrorFactory.timeout('connect', 30000);
```

**工厂方法列表：**

| 方法 | 错误码 | 严重级别 | 说明 |
|------|--------|----------|------|
| `walletNotInstalled(walletId)` | 2000 | HIGH | 钱包未安装 |
| `walletNotConnected(walletId)` | 2001 | HIGH | 钱包未连接 |
| `walletConnectionFailed(walletId, reason)` | 2002 | HIGH | 连接失败 |
| `networkError(network, reason)` | 3000 | MEDIUM | 网络错误 |
| `networkUnsupported(network)` | 3001 | MEDIUM | 不支持的网络 |
| `transactionFailed(reason)` | 4000 | HIGH | 交易失败 |
| `transactionRejected(reason)` | 4001 | HIGH | 交易被拒绝 |
| `insufficientBalance(required, available)` | 4003 | HIGH | 余额不足 |
| `signatureFailed(reason)` | 5000 | HIGH | 签名失败 |
| `signatureRejected(reason)` | 5001 | HIGH | 签名被拒绝 |
| `unknownError(message)` | 1000 | HIGH | 未知错误 |
| `invalidArgument(param, expected, actual)` | 1001 | MEDIUM | 无效参数 |
| `notImplemented(feature)` | 1002 | LOW | 未实现 |
| `timeout(operation, timeout)` | 1003 | HIGH | 超时 |

### ErrorRecoveryStrategy

错误恢复策略，提供重试、降级和断路器模式。

#### 重试策略

```typescript
import { ErrorRecoveryStrategy } from '@btc-connect/core';

// 基本重试
const result = await ErrorRecoveryStrategy.retry(
  () => manager.connect('unisat'),
  3,      // 最大尝试次数
  1000,   // 延迟时间（毫秒）
  (error) => error.context.retryable  // 可选：自定义重试条件
);
```

#### 降级策略

```typescript
// 主操作失败时执行降级操作
const result = await ErrorRecoveryStrategy.fallback(
  () => primaryWallet.connect(),    // 主操作
  () => fallbackWallet.connect(),   // 降级操作
  { walletId: 'fallback' }          // 可选上下文
);
```

#### 断路器模式

```typescript
// 失败阈值触发断路
const result = await ErrorRecoveryStrategy.circuitBreaker(
  () => manager.connect('unisat'),
  3,       // 失败阈值
  60000,   // 断路超时（毫秒）
  { walletId: 'unisat' }
);
```

### WalletErrorHandler

错误处理工具类，提供统一的错误创建和处理机制。

**静态方法：**

| 方法 | 说明 |
|------|------|
| `createWalletNotInstalledError(walletId, context)` | 创建钱包未安装错误 |
| `createConnectionError(walletId, message, originalError, context)` | 创建连接错误 |
| `createDisconnectedError(walletId, context)` | 创建断开连接错误 |
| `createNetworkError(message, network, originalError, context)` | 创建网络错误 |
| `createSignatureError(message, originalError, context)` | 创建签名错误 |
| `createTransactionError(message, txid, originalError, context)` | 创建交易错误 |
| `createTimeoutError(operation, timeout, context)` | 创建超时错误 |
| `createConfigurationError(message, context)` | 创建配置错误 |

**超时包装：**

```typescript
import { WalletErrorHandler } from '@btc-connect/core';

// 为异步操作添加超时处理
const result = await WalletErrorHandler.withTimeout(
  manager.connect('unisat'),
  30000,           // 超时时间（毫秒）
  'connect',       // 操作名称
  { walletId: 'unisat' }
);
```

**安全执行：**

```typescript
// 统一错误处理包装
const result = await WalletErrorHandler.safeExecute(
  () => wallet.signMessage(message),
  (error) => WalletErrorHandler.createSignatureError('签名失败', error),
  { operation: 'signMessage' }
);
```

**自定义错误处理器：**

```typescript
// 注册自定义处理器
WalletErrorHandler.registerErrorHandler(
  ErrorCode.WALLET_NOT_INSTALLED,
  (error) => {
    console.warn('需要安装钱包:', error.context.suggestion);
    // 显示安装引导
  }
);

// 移除处理器
WalletErrorHandler.unregisterErrorHandler(
  ErrorCode.WALLET_NOT_INSTALLED,
  handler
);
```

### ErrorReporter

错误报告工具，用于将错误上报到监控服务。

```typescript
import { ErrorReporter } from '@btc-connect/core';

// 报告单个错误
ErrorReporter.reportError(error, {
  userId: 'user-123',
  sessionId: 'session-abc'
});

// 批量报告
ErrorReporter.reportErrors([error1, error2, error3], {
  batch: true
});
```

**注意：** 在生产环境（`NODE_ENV=production`）中，错误会自动输出到控制台。可以扩展此类以集成 Sentry、LogRocket 等监控服务。

### 常见错误类型

#### WalletNotInstalledError
钱包未安装错误。

```typescript
try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.error('UniSat钱包未安装，请先安装钱包扩展');
  }
}
```

#### ConnectionTimeoutError
连接超时错误。

```typescript
try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof ConnectionTimeoutError) {
    console.error('连接超时，请检查钱包是否响应');
  }
}
```

#### UserRejectedError
用户拒绝连接错误。

```typescript
try {
  await manager.connect('unisat');
} catch (error) {
  if (error instanceof UserRejectedError) {
    console.error('用户取消了连接操作');
  }
}
```

#### NetworkError
网络错误。

```typescript
try {
  await manager.switchNetwork('testnet');
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('网络切换失败:', error.message);
  }
}
```

### 错误处理最佳实践

#### 重试模式

```typescript
import { UnifiedError, ErrorFactory } from '@btc-connect/core';

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: UnifiedError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof UnifiedError) {
        lastError = error.withRetryCount(attempt + 1);
        
        if (!error.canRetry()) {
          throw error;
        }
        
        // 指数退避
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
      } else {
        throw error;
      }
    }
  }

  throw lastError || ErrorFactory.unknownError('超过最大重试次数');
}

// 使用
try {
  const result = await withRetry(() => manager.connect('unisat'));
} catch (error) {
  if (error instanceof UnifiedError) {
    console.log(`失败，已重试 ${error.context.retryCount} 次`);
  }
}
```

### 全局错误处理

```typescript
// React
function ErrorBoundary({ children }) {
  return (
    <ErrorBoundaryComponent
      fallback={<div>钱包连接出现错误</div>}
      onError={(error) => console.error('钱包错误:', error)}
    >
      {children}
    </ErrorBoundaryComponent>
  );
}

// Vue
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue错误:', error);
  console.error('错误信息:', info);
};
```

## Batch Processing API

批处理系统提供智能的请求批处理功能，将多个请求合并为单个批次处理，减少网络开销，提高性能。

### BatchScheduler

核心批调度器，提供可配置的批处理功能。

```typescript
import { BatchScheduler, createBatchScheduler } from '@btc-connect/core';

// 定义批处理器
const processor = async (requests) => {
  const results = new Map<string, Result>();
  // 处理所有请求
  for (const req of requests) {
    const result = await processItem(req.data);
    results.set(req.id, result);
  }
  return results;
};

// 创建调度器
const scheduler = new BatchScheduler(processor, {
  maxBatchSize: 100,      // 每批次最大数量
  maxWaitTimeMS: 50,      // 最大等待时间（毫秒）
  minBatchSize: 1,        // 最小批次大小
  priorityThreshold: 10   // 高优先级阈值
});

// 或使用工厂函数
const scheduler = createBatchScheduler(processor, config);
```

#### 构造函数参数

```typescript
interface BatchSchedulerConfig {
  maxBatchSize?: number;      // 每批次最大数量（默认: 100）
  maxWaitTimeMS?: number;     // 最大等待时间（默认: 50ms）
  minBatchSize?: number;      // 最小批次大小（默认: 1）
  priorityThreshold?: number; // 高优先级阈值（默认: 10）
}
```

#### 主要方法

##### submit(data: T, priority?: number)

提交请求到批处理队列。

```typescript
// 提交请求
const result1 = await scheduler.submit({ address: 'tb1q...' }, 0);  // 普通优先级
const result2 = await scheduler.submit({ address: 'tb1q...' }, 10); // 高优先级
const result3 = await scheduler.submit({ address: 'tb1q...' }, 5);  // 中等优先级
```

**参数:**
- `data: T` - 请求数据
- `priority?: number` - 优先级（默认: 0，越高越优先）

**返回值:**
- `Promise<R>` - 处理结果

##### flush()

立即处理当前队列中的所有请求。

```typescript
// 强制立即处理
await scheduler.flush();
console.log('队列已处理');
```

**返回值:**
- `Promise<void>`

##### clear()

清空队列并拒绝所有待处理请求。

```typescript
scheduler.clear();
console.log('队列已清空');
```

##### getQueueSize()

获取当前队列大小。

```typescript
const size = scheduler.getQueueSize();
console.log(`当前队列大小: ${size}`);
```

**返回值:**
- `number` - 队列中的请求数量

##### getMetrics()

获取性能统计信息。

```typescript
const metrics = scheduler.getMetrics();
console.log({
  totalBatches: metrics.totalBatches,
  totalRequests: metrics.totalRequests,
  averageBatchSize: metrics.averageBatchSize,
  averageWaitTime: metrics.averageWaitTime,
  successRate: metrics.successRate
});
```

**返回值:**
- `BatchMetrics` - 统计信息对象

##### resetMetrics()

重置统计信息。

```typescript
scheduler.resetMetrics();
console.log('统计信息已重置');
```

##### 事件监听

```typescript
// 添加事件监听器
scheduler.on((event) => {
  switch (event.type) {
    case 'batchStart':
      console.log(`批次 ${event.batchId} 开始处理`);
      break;
    case 'batchComplete':
      console.log(`批次 ${event.batchId} 完成`);
      break;
    case 'batchError':
      console.error(`批次错误:`, event.error);
      break;
    case 'requestQueued':
      console.log(`请求 ${event.requestId} 已加入队列`);
      break;
  }
});

// 移除事件监听器
scheduler.off(handler);
```

##### destroy()

销毁调度器，清理所有资源。

```typescript
scheduler.destroy();
console.log('调度器已销毁');
```

### createBatchScheduler

创建批调度器的工厂函数。

```typescript
import { createBatchScheduler } from '@btc-connect/core';

const scheduler = createBatchScheduler<T, R>(
  processor: BatchProcessor<T, R>,
  config?: BatchSchedulerConfig
);
```

**参数:**
- `processor: BatchProcessor<T, R>` - 批处理函数
- `config?: BatchSchedulerConfig` - 配置选项

**返回值:**
- `BatchScheduler<T, R>` - 批调度器实例

### createSimpleBatchScheduler

创建简化版批调度器，适用于数组映射处理。

```typescript
import { createSimpleBatchScheduler } from '@btc-connect/core';

// 创建简单批处理器
const scheduler = createSimpleBatchScheduler<string, Balance>(
  async (addresses) => {
    // 处理地址数组，返回结果数组
    return await Promise.all(
      addresses.map(addr => fetchBalance(addr))
    );
  },
  { maxBatchSize: 50, maxWaitTimeMS: 100 }
);

// 提交请求
const balance1 = await scheduler.submit('tb1qabc...');
const balance2 = await scheduler.submit('tb1qdef...');
```

**参数:**
- `processor: (items: T[]) => Promise<R[]>` - 数组处理函数
- `config?: BatchSchedulerConfig` - 配置选项

**返回值:**
- `BatchScheduler<T, R>` - 批调度器实例

### 批处理类型

#### BatchRequest

批处理请求结构。

```typescript
interface BatchRequest<T = unknown, R = unknown> {
  id: string;          // 唯一请求ID
  data: T;             // 请求数据
  priority: number;    // 优先级
  timestamp: number;   // 提交时间戳
}
```

#### BatchProcessor

批处理函数类型。

```typescript
type BatchProcessor<T = unknown, R = unknown> = (
  requests: BatchRequest<T, R>[]
) => Promise<Map<string, R>>;
```

#### BatchSchedulerConfig

批调度器配置。

```typescript
interface BatchSchedulerConfig {
  maxBatchSize?: number;      // 每批次最大数量（默认: 100）
  maxWaitTimeMS?: number;     // 最大等待时间（默认: 50ms）
  minBatchSize?: number;      // 最小批次大小（默认: 1）
  priorityThreshold?: number; // 高优先级阈值（默认: 10）
}
```

#### BatchMetrics

批处理统计信息。

```typescript
interface BatchMetrics {
  totalBatches: number;      // 总批次数量
  totalRequests: number;     // 总请求数量
  averageBatchSize: number;  // 平均批次大小
  averageWaitTime: number;   // 平均等待时间（ms）
  successRate: number;       // 成功率（0-1）
}
```

#### BatchEvent

批处理事件。

```typescript
interface BatchEvent {
  type: BatchEventType;  // 事件类型
  batchId?: string;      // 批次ID
  requestId?: string;    // 请求ID
  timestamp: number;     // 时间戳
  error?: Error;         // 错误信息（仅错误事件）
}

type BatchEventType =
  | 'batchStart'      // 批次开始
  | 'batchComplete'   // 批次完成
  | 'batchError'      // 批次错误
  | 'requestQueued';  // 请求入队
```

### BatchDefaults

默认配置常量。

```typescript
import { BatchDefaults } from '@btc-connect/core';

BatchDefaults.MAX_BATCH_SIZE       // 100
BatchDefaults.MAX_WAIT_TIME_MS     // 50
BatchDefaults.MIN_BATCH_SIZE       // 1
BatchDefaults.PRIORITY_THRESHOLD   // 10
```

### 使用示例

#### 批量获取余额

```typescript
import { createSimpleBatchScheduler } from '@btc-connect/core';

// 创建余额批处理器
const balanceScheduler = createSimpleBatchScheduler<string, number>(
  async (addresses) => {
    // 批量请求余额
    const response = await fetch('/api/balance', {
      method: 'POST',
      body: JSON.stringify({ addresses })
    });
    return response.json();
  },
  { maxBatchSize: 20, maxWaitTimeMS: 100 }
);

// 多个组件同时请求余额，自动合并为批次
const balances = await Promise.all([
  balanceScheduler.submit('tb1qabc...'),
  balanceScheduler.submit('tb1qdef...'),
  balanceScheduler.submit('tb1qghi...')
]);
```

#### 批量签名验证

```typescript
import { createBatchScheduler } from '@btc-connect/core';

interface SignRequest {
  message: string;
  address: string;
}

interface SignResult {
  valid: boolean;
  signature: string;
}

// 创建签名批处理器
const signScheduler = createBatchScheduler<SignRequest, SignResult>(
  async (requests) => {
    const results = new Map<string, SignResult>();
    
    // 批量验证签名
    for (const req of requests) {
      const valid = await verifySignature(req.data.message, req.data.address);
      results.set(req.id, { valid, signature: req.data.message });
    }
    
    return results;
  },
  { maxBatchSize: 50, maxWaitTimeMS: 200 }
);

// 监听批处理事件
signScheduler.on((event) => {
  if (event.type === 'batchComplete') {
    console.log(`签名批次完成: ${event.batchId}`);
  }
});
```

#### 高优先级请求

```typescript
// 高优先级请求会立即触发处理
await scheduler.submit({ data: 'urgent' }, 10); // 立即处理

// 普通优先级请求会等待批次累积
await scheduler.submit({ data: 'normal' }, 0);  // 等待批次
```

## 完整示例

### React 完整示例

```tsx
import React, { useState } from 'react';
import {
  BTCWalletProvider,
  useWallet,
  useWalletEvent,
  ConnectButton
} from '@btc-connect/react';

function WalletInfo() {
  const {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    connect,
    disconnect,
    switchNetwork,
    signMessage,
    utils
  } = useWallet();

  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');

  // 事件监听
  useWalletEvent('accountChange', (accounts) => {
    console.log('账户变化:', accounts);
  });

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  const handleSignMessage = async () => {
    if (!message) return;

    try {
      const sig = await signMessage(message);
      setSignature(sig);
    } catch (error) {
      console.error('签名失败:', error);
    }
  };

  const handleSwitchNetwork = async (network: string) => {
    try {
      await switchNetwork(network as any);
    } catch (error) {
      console.error('网络切换失败:', error);
    }
  };

  if (!isConnected) {
    return (
      <div>
        <h2>连接比特币钱包</h2>
        <button onClick={() => handleConnect('unisat')}>
          连接 UniSat
        </button>
        <button onClick={() => handleConnect('okx')}>
          连接 OKX
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>钱包信息</h2>
      <p>钱包: {currentWallet?.name}</p>
      <p>地址: {utils.formatAddress(address || '', { startChars: 6, endChars: 4 })}</p>
      <p>余额: {utils.formatBalance(balance || 0, { unit: 'BTC' })}</p>
      <p>网络: {network}</p>

      <button onClick={() => disconnect()}>断开连接</button>

      <h3>网络切换</h3>
      <button onClick={() => handleSwitchNetwork('livenet')}>主网</button>
      <button onClick={() => handleSwitchNetwork('testnet')}>测试网</button>

      <h3>消息签名</h3>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="输入要签名的消息"
      />
      <button onClick={handleSignMessage}>签名</button>
      {signature && <p>签名: {signature}</p>}
    </div>
  );
}

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <div>
        <h1>BTC Connect 示例</h1>
        <ConnectButton />
        <WalletInfo />
      </div>
    </BTCWalletProvider>
  );
}

export default App;
```

### Vue 完整示例

```vue
<template>
  <div>
    <h1>BTC Connect 示例</h1>

    <ConnectButton @connect="handleConnect" />

    <div v-if="isConnected">
      <h2>钱包信息</h2>
      <p>钱包: {{ currentWallet?.name }}</p>
      <p>地址: {{ formattedAddress }}</p>
      <p>余额: {{ formattedBalance }}</p>
      <p>网络: {{ network }}</p>

      <button @click="disconnect">断开连接</button>

      <h3>网络切换</h3>
      <button @click="switchToMainnet">主网</button>
      <button @click="switchToTestnet">测试网</button>

      <h3>消息签名</h3>
      <input
        v-model="message"
        placeholder="输入要签名的消息"
      />
      <button @click="signMessage">签名</button>
      <p v-if="signature">签名: {{ signature }}</p>
    </div>

    <div v-else>
      <h2>连接比特币钱包</h2>
      <button @click="connectUnisat">连接 UniSat</button>
      <button @click="connectOkx">连接 OKX</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  useWallet,
  useWalletEvent,
  ConnectButton
} from '@btc-connect/vue';

const {
  isConnected,
  address,
  balance,
  currentWallet,
  network,
  connect,
  disconnect,
  switchNetwork,
  signMessage: signMsg,
  utils
} = useWallet();

const message = ref('');
const signature = ref('');

// 计算属性
const formattedAddress = computed(() =>
  utils.formatAddress(address.value || '', { startChars: 6, endChars: 4 })
);

const formattedBalance = computed(() =>
  utils.formatBalance(balance.value || 0, { unit: 'BTC' })
);

// 事件监听
useWalletEvent('accountChange', (accounts) => {
  console.log('账户变化:', accounts);
});

const handleConnect = (walletId: string) => {
  console.log('连接到钱包:', walletId);
};

const connectUnisat = async () => {
  try {
    await connect('unisat');
  } catch (error) {
    console.error('连接失败:', error);
  }
};

const connectOkx = async () => {
  try {
    await connect('okx');
  } catch (error) {
    console.error('连接失败:', error);
  }
};

const switchToMainnet = async () => {
  try {
    await switchNetwork('livenet');
  } catch (error) {
    console.error('网络切换失败:', error);
  }
};

const switchToTestnet = async () => {
  try {
    await switchNetwork('testnet');
  } catch (error) {
    console.error('网络切换失败:', error);
  }
};

const signMessage = async () => {
  if (!message.value) return;

  try {
    const sig = await signMsg(message.value);
    signature.value = sig;
  } catch (error) {
    console.error('签名失败:', error);
  }
};
</script>
```

## Cache System API

缓存系统提供高效的内存缓存功能，支持 TTL（生存时间）和 LRU（最近最少使用）淘汰策略。

### MemoryCache

基础内存缓存类，支持自动过期和大小限制。

```typescript
import { MemoryCache, createCache } from '@btc-connect/core';

// 创建缓存实例
const cache = new MemoryCache<string>({
  ttl: 60000,              // 默认TTL: 60秒
  maxSize: 100,            // 最大100个条目
  enableAutoCleanup: true, // 自动清理过期项
  cleanupInterval: 30000   // 每30秒清理一次
});

// 或使用工厂函数
const cache = createCache<string>({ ttl: 30000 });
```

#### 构造函数参数

```typescript
interface CacheOptions {
  ttl?: number;              // 默认TTL（毫秒），默认60000
  maxSize?: number;          // 最大缓存条目数，默认100
  enableAutoCleanup?: boolean; // 是否启用自动清理，默认true
  cleanupInterval?: number;  // 清理间隔（毫秒），默认30000
}
```

#### 主要方法

##### set(key: string, data: T, ttl?: number)
设置缓存项。

```typescript
// 使用默认TTL
cache.set('balance:unisat:tb1q...', { confirmed: 100000, unconfirmed: 5000 });

// 使用自定义TTL
cache.set('temp-data', 'value', 5000); // 5秒后过期
```

**参数:**
- `key: string` - 缓存键
- `data: T` - 缓存数据
- `ttl?: number` - 可选的TTL（毫秒）

**返回值:**
- `void`

##### get(key: string): T | null
获取缓存项。

```typescript
const balance = cache.get('balance:unisat:tb1q...');
if (balance) {
  console.log('缓存命中:', balance);
} else {
  console.log('缓存未命中或已过期');
}
```

**参数:**
- `key: string` - 缓存键

**返回值:**
- `T | null` - 缓存数据，如果不存在或已过期则返回null

##### has(key: string): boolean
检查缓存项是否存在且未过期。

```typescript
if (cache.has('balance:unisat:tb1q...')) {
  console.log('缓存存在且有效');
}
```

**参数:**
- `key: string` - 缓存键

**返回值:**
- `boolean` - 是否存在且未过期

##### delete(key: string): boolean
删除缓存项。

```typescript
const deleted = cache.delete('balance:unisat:tb1q...');
console.log('删除结果:', deleted);
```

**参数:**
- `key: string` - 缓存键

**返回值:**
- `boolean` - 是否成功删除

##### clear(): void
清空所有缓存。

```typescript
cache.clear();
console.log('缓存已清空');
```

##### size(): number
获取当前缓存大小。

```typescript
const currentSize = cache.size();
console.log('当前缓存条目数:', currentSize);
```

**返回值:**
- `number` - 当前缓存条目数

##### keys(): string[]
获取所有缓存键。

```typescript
const allKeys = cache.keys();
console.log('所有缓存键:', allKeys);
```

**返回值:**
- `string[]` - 所有缓存键数组

##### cleanup(): number
手动清理过期缓存。

```typescript
const cleanedCount = cache.cleanup();
console.log(`清理了 ${cleanedCount} 个过期条目`);
```

**返回值:**
- `number` - 清理的过期条目数

##### getStats()
获取缓存统计信息。

```typescript
const stats = cache.getStats();
console.log('缓存统计:', stats);
// { size: 50, maxSize: 100 }
```

**返回值:**
- `{ size: number; maxSize: number; hitRate?: number; memoryUsage?: number }`

##### destroy(): void
销毁缓存实例。

```typescript
cache.destroy();
console.log('缓存实例已销毁');
```

### EnhancedMemoryCache

增强版内存缓存类，在 MemoryCache 基础上添加统计追踪、事件系统和批量操作。

```typescript
import { EnhancedMemoryCache } from '@btc-connect/core';

const cache = new EnhancedMemoryCache<UserData>({
  ttl: 60000,
  maxSize: 1000,
  trackStats: true,      // 启用统计追踪
  trackEvents: true,     // 启用事件系统
  maxMemory: 50 * 1024 * 1024  // 50MB内存限制
});
```

#### 构造函数参数

```typescript
interface EnhancedCacheOptions extends CacheOptions {
  trackStats?: boolean;   // 是否追踪统计信息，默认true
  trackEvents?: boolean;  // 是否追踪事件，默认false
  maxMemory?: number;     // 最大内存占用（字节），默认50MB
}
```

#### 额外方法

##### getMany(keys: string[]): Map<string, T>
批量获取多个缓存项。

```typescript
const results = cache.getMany(['key1', 'key2', 'key3']);
results.forEach((value, key) => {
  console.log(`${key}:`, value);
});
```

**参数:**
- `keys: string[]` - 缓存键数组

**返回值:**
- `Map<string, T>` - 键值对Map

##### setMany(entries: Array<{key: string; value: T; ttl?: number}>): number
批量设置缓存项。

```typescript
const successCount = cache.setMany([
  { key: 'key1', value: 'value1' },
  { key: 'key2', value: 'value2', ttl: 5000 }
]);
console.log(`成功设置 ${successCount} 个条目`);
```

**参数:**
- `entries: Array<{key: string; value: T; ttl?: number}>` - 条目数组

**返回值:**
- `number` - 成功设置的条目数

##### deleteMany(keys: string[]): number
批量删除缓存项。

```typescript
const deletedCount = cache.deleteMany(['key1', 'key2', 'key3']);
console.log(`删除了 ${deletedCount} 个条目`);
```

**参数:**
- `keys: string[]` - 缓存键数组

**返回值:**
- `number` - 成功删除的条目数

##### find(predicate: (value: T, key: string) => boolean): Array<[string, T]>
根据条件查找缓存项。

```typescript
const results = cache.find((value, key) => {
  return key.startsWith('balance:') && value.confirmed > 1000;
});
console.log('符合条件的条目:', results);
```

**参数:**
- `predicate: (value: T, key: string) => boolean` - 判断函数

**返回值:**
- `Array<[string, T]>` - 符合条件的键值对数组

##### entries(): Array<[string, T]>
获取所有键值对。

```typescript
const allEntries = cache.entries();
allEntries.forEach(([key, value]) => {
  console.log(`${key}:`, value);
});
```

**返回值:**
- `Array<[string, T]>` - 所有键值对数组

##### getStats(): CacheStats
获取详细统计信息。

```typescript
const stats = cache.getStats();
console.log({
  size: stats.size,           // 当前缓存大小
  maxSize: stats.maxSize,     // 最大大小
  hits: stats.hits,           // 缓存命中次数
  misses: stats.misses,       // 缓存未命中次数
  hitRate: stats.hitRate,     // 命中率（0-1）
  evictions: stats.evictions, // 淘汰次数
  memoryUsage: stats.memoryUsage, // 内存使用量（字节）
  oldestEntry: stats.oldestEntry, // 最旧条目时间戳
  newestEntry: stats.newestEntry  // 最新条目时间戳
});
```

**返回值:**
```typescript
interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  memoryUsage: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}
```

##### resetStats(): void
重置统计信息。

```typescript
cache.resetStats();
console.log('统计信息已重置');
```

##### getHitRatePercent(): number
获取命中率百分比。

```typescript
const hitRatePercent = cache.getHitRatePercent();
console.log(`命中率: ${hitRatePercent.toFixed(2)}%`);
```

**返回值:**
- `number` - 命中率百分比（0-100）

##### on(handler: CacheEventHandler): void
添加事件监听器。

```typescript
cache.on((event) => {
  console.log(`缓存事件: ${event.type}`, event.key);
  // event.type: 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'clear'
});
```

**参数:**
- `handler: CacheEventHandler` - 事件处理函数

##### off(handler: CacheEventHandler): void
移除事件监听器。

```typescript
const handler = (event) => console.log(event);
cache.on(handler);
// 后续移除
cache.off(handler);
```

**参数:**
- `handler: CacheEventHandler` - 要移除的事件处理函数

### CacheManager

缓存管理器，管理多个缓存实例的单例类。

```typescript
import { getCacheManager } from '@btc-connect/core';

const manager = getCacheManager();
```

#### 主要方法

##### getInstance(): CacheManager
获取单例实例。

```typescript
import { CacheManager } from '@btc-connect/core';

const manager = CacheManager.getInstance();
```

**返回值:**
- `CacheManager` - 缓存管理器实例

##### getCache<T>(name: string, options?: CacheOptions): MemoryCache<T>
创建或获取缓存实例。

```typescript
// 创建余额缓存
const balanceCache = manager.getCache('balance', { ttl: 10000 });

// 创建账户缓存
const accountCache = manager.getCache('accounts', { ttl: 30000 });
```

**参数:**
- `name: string` - 缓存名称
- `options?: CacheOptions` - 缓存配置

**返回值:**
- `MemoryCache<T>` - 缓存实例

##### deleteCache(name: string): boolean
删除缓存实例。

```typescript
const deleted = manager.deleteCache('balance');
console.log('删除结果:', deleted);
```

**参数:**
- `name: string` - 缓存名称

**返回值:**
- `boolean` - 是否成功删除

##### clearAll(): void
清空所有缓存。

```typescript
manager.clearAll();
console.log('所有缓存已清空');
```

##### getAllStats(): Record<string, { size: number; maxSize: number }>
获取所有缓存的统计信息。

```typescript
const allStats = manager.getAllStats();
console.log('余额缓存:', allStats.balance);
console.log('账户缓存:', allStats.accounts);
```

**返回值:**
- `Record<string, { size: number; maxSize: number }>` - 各缓存的统计信息

##### cleanupAll(): number
清理所有过期缓存。

```typescript
const totalCleaned = manager.cleanupAll();
console.log(`总共清理了 ${totalCleaned} 个过期条目`);
```

**返回值:**
- `number` - 清理的总条目数

##### destroy(): void
销毁缓存管理器。

```typescript
manager.destroy();
console.log('缓存管理器已销毁');
```

### CacheKeyBuilder

缓存键生成工具类，用于生成一致的缓存键。

```typescript
import { CacheKeyBuilder } from '@btc-connect/core';
```

#### 静态方法

##### balance(walletId: string, address: string): string
生成余额缓存键。

```typescript
const key = CacheKeyBuilder.balance('unisat', 'tb1q...');
// 返回: "balance:unisat:tb1q..."
```

##### accounts(walletId: string, network: string): string
生成账户缓存键。

```typescript
const key = CacheKeyBuilder.accounts('unisat', 'livenet');
// 返回: "accounts:unisat:livenet"
```

##### network(walletId: string): string
生成网络缓存键。

```typescript
const key = CacheKeyBuilder.network('unisat');
// 返回: "network:unisat"
```

##### transaction(walletId: string, txId: string): string
生成交易缓存键。

```typescript
const key = CacheKeyBuilder.transaction('unisat', 'abc123');
// 返回: "tx:unisat:abc123"
```

##### signature(walletId: string, messageHash: string): string
生成签名缓存键。

```typescript
const key = CacheKeyBuilder.signature('unisat', 'msg-hash');
// 返回: "sig:unisat:msg-hash"
```

##### walletState(walletId: string, address: string): string
生成钱包状态缓存键。

```typescript
const key = CacheKeyBuilder.walletState('unisat', 'tb1q...');
// 返回: "state:unisat:tb1q..."
```

##### inscriptions(walletId: string, address: string, cursor?: number): string
生成铭文缓存键。

```typescript
const key = CacheKeyBuilder.inscriptions('unisat', 'tb1q...', 0);
// 返回: "inscriptions:unisat:tb1q...:0"
```

### 缓存装饰器

缓存装饰器为方法添加自动缓存功能。

#### @cached - 基础缓存装饰器

```typescript
import { cached, CachePresets } from '@btc-connect/core';

class WalletService {
  @cached({
    cacheName: 'balance',
    ttl: 10000,
    keyBuilder: (walletId, address) => `balance:${walletId}:${address}`,
    shouldCache: (result) => result !== null,
    bypassCache: () => false
  })
  async getBalance(walletId: string, address: string) {
    return await wallet.getBalance(address);
  }
}
```

**装饰器选项:**
```typescript
interface CachedMethodOptions {
  cacheName: string;           // 缓存名称
  keyBuilder?: (...args: any[]) => string;  // 缓存键生成函数
  ttl?: number;                // TTL（毫秒）
  shouldCache?: (result: any, args: any[]) => boolean; // 是否缓存结果
  onError?: (error: Error, args: any[]) => void;  // 错误处理
  bypassCache?: (...args: any[]) => boolean;  // 是否绕过缓存
}
```

#### @smartCached - 智能缓存装饰器

根据方法返回结果动态调整TTL。

```typescript
import { smartCached } from '@btc-connect/core';

class DataService {
  @smartCached({
    cacheName: 'data',
    successTtl: 60000,  // 成功结果缓存60秒
    errorTtl: 5000,     // 错误结果缓存5秒
    emptyTtl: 10000     // 空结果缓存10秒
  })
  async fetchData(id: string) {
    return await api.fetch(id);
  }
}
```

#### @conditionalCached - 条件缓存装饰器

根据运行时条件决定是否使用缓存。

```typescript
import { conditionalCached } from '@btc-connect/core';

class QueryService {
  @conditionalCached(
    (forceRefresh) => !forceRefresh, // forceRefresh=true时绕过缓存
    { cacheName: 'query', ttl: 30000 }
  )
  async query(forceRefresh = false) {
    return await db.query();
  }
}
```

#### @invalidateCache - 缓存失效装饰器

方法执行后自动清除相关缓存。

```typescript
import { invalidateCache } from '@btc-connect/core';

class TransactionService {
  @invalidateCache(['balance', 'transactions'])
  async sendTransaction(to: string, amount: number) {
    // 执行交易后，余额和交易缓存会被清除
    return await wallet.send(to, amount);
  }
}
```

### CachePresets

预定义的缓存配置预设。

```typescript
import { CachePresets, cached } from '@btc-connect/core';

class WalletService {
  // 余额缓存 - 10秒TTL
  @cached(CachePresets.balance)
  async getBalance(walletId: string, address: string) {
    // ...
  }

  // 账户缓存 - 30秒TTL
  @cached(CachePresets.accounts)
  async getAccounts(walletId: string, network: string) {
    // ...
  }

  // 网络缓存 - 60秒TTL
  @cached(CachePresets.network)
  async getNetwork(walletId: string) {
    // ...
  }

  // 铭文缓存 - 60秒TTL
  @cached(CachePresets.inscriptions)
  async getInscriptions(walletId: string, address: string, cursor = 0, size = 10) {
    // ...
  }

  // 链信息缓存 - 60秒TTL
  @cached(CachePresets.chain)
  async getChainInfo(walletId: string) {
    // ...
  }

  // 公钥缓存 - 30秒TTL
  @cached(CachePresets.publicKey)
  async getPublicKey(walletId: string) {
    // ...
  }
}
```

**可用预设:**

| 预设名称 | TTL | 用途 |
|---------|-----|------|
| `balance` | 10秒 | 余额数据缓存 |
| `accounts` | 30秒 | 账户列表缓存 |
| `network` | 60秒 | 网络信息缓存 |
| `inscriptions` | 60秒 | 铭文数据缓存 |
| `chain` | 60秒 | 链信息缓存 |
| `publicKey` | 30秒 | 公钥缓存 |

### CacheDefaults

缓存系统默认值常量。

```typescript
import { CacheDefaults } from '@btc-connect/core';

console.log(CacheDefaults.MAX_SIZE);        // 1000
console.log(CacheDefaults.MAX_MEMORY);      // 52428800 (50MB)
console.log(CacheDefaults.DEFAULT_TTL);     // 60000 (60秒)
console.log(CacheDefaults.CLEANUP_INTERVAL); // 30000 (30秒)
```

### 完整使用示例

```typescript
import {
  MemoryCache,
  EnhancedMemoryCache,
  CacheManager,
  CacheKeyBuilder,
  CachePresets,
  cached,
  invalidateCache,
  getCacheManager
} from '@btc-connect/core';

// ===== 基础缓存使用 =====
const cache = new MemoryCache<string>({ ttl: 60000 });
cache.set('key1', 'value1');
console.log(cache.get('key1')); // 'value1'

// ===== 增强缓存使用 =====
const enhancedCache = new EnhancedMemoryCache({
  ttl: 60000,
  trackStats: true,
  trackEvents: true
});

// 添加事件监听
enhancedCache.on((event) => {
  console.log(`事件: ${event.type}, 键: ${event.key}`);
});

// 批量操作
enhancedCache.setMany([
  { key: 'key1', value: 'value1' },
  { key: 'key2', value: 'value2' }
]);

// 查看统计
console.log('命中率:', enhancedCache.getHitRatePercent() + '%');

// ===== 缓存管理器使用 =====
const manager = getCacheManager();
const balanceCache = manager.getCache('balance', { ttl: 10000 });
const accountCache = manager.getCache('accounts', { ttl: 30000 });

// 查看所有缓存统计
console.log('所有缓存:', manager.getAllStats());

// 清理所有过期缓存
const cleaned = manager.cleanupAll();
console.log(`清理了 ${cleaned} 个过期条目`);

// ===== 使用装饰器 =====
class WalletService {
  @cached(CachePresets.balance)
  async getBalance(walletId: string, address: string) {
    return await this.fetchBalance(address);
  }

  @invalidateCache(['balance'])
  async sendTransaction(to: string, amount: number) {
    return await this.wallet.send(to, amount);
  }

  private async fetchBalance(address: string) {
    // 实际获取余额逻辑
    return { confirmed: 100000, unconfirmed: 5000 };
  }

  private wallet = {
    send: async (to: string, amount: number) => {
      // 实际发送交易逻辑
      return 'txid';
    }
  };
}

// ===== 使用缓存键生成器 =====
const balanceKey = CacheKeyBuilder.balance('unisat', 'tb1q...');
const accountsKey = CacheKeyBuilder.accounts('unisat', 'livenet');
const networkKey = CacheKeyBuilder.network('unisat');
```

---

更多详细信息请参考：
- [🎯 统一指南](../UNIFICATION_GUIDE.md)
- [📝 变更记录](../CHANGELOG.md)
- [📖 快速开始](../QUICK_START.md)