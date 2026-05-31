# Next.js 配置指南

本文档提供 btc-connect 在 Next.js 项目中的完整配置指南和最佳实践。

## 目录

- [快速开始](#快速开始)
- [项目配置](#项目配置)
- [SSR 兼容性](#ssr-兼容性)
- [App Router 配置](#app-router-配置)
- [Pages Router 配置](#pages-router-配置)
- [环境变量](#环境变量)
- [部署配置](#部署配置)
- [性能优化](#性能优化)
- [常见问题](#常见问题)
- [完整示例](#完整示例)

## 快速开始

### 1. 安装依赖

```bash
# React 项目
bun add @btc-connect/react

# Vue 项目
bun add @btc-connect/vue

# 核心 (框架无关)
bun add @btc-connect/core
```

### 2. 基础配置

创建 `providers/wallet-provider.tsx`：

```typescript
'use client';

import { BTCWalletProvider } from '@btc-connect/react';

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
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
      {children}
    </BTCWalletProvider>
  );
}
```

### 3. 根布局配置

在 `app/layout.tsx` 中：

```typescript
import { WalletProvider } from './providers/wallet-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
```

## 项目配置

### TypeScript 配置

在 `tsconfig.json` 中确保包含以下配置：

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Next.js 配置

在 `next.config.js` 中：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@btc-connect/react'],
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

## SSR 兼容性

### 客户端组件

确保钱包相关组件在客户端运行：

```typescript
'use client';

import { useWallet } from '@btc-connect/react';

export function WalletComponent() {
  const { isConnected, address, connect } = useWallet();

  return (
    <div>
      {isConnected ? (
        <p>已连接: {address}</p>
      ) : (
        <button onClick={() => connect('unisat')}>
          连接钱包
        </button>
      )}
    </div>
  );
}
```

### 动态导入

对于需要动态加载的组件：

```typescript
'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const WalletModal = dynamic(
  () => import('@btc-connect/react').then(mod => ({ default: mod.WalletModal })),
  {
    ssr: false,
    loading: () => <div>加载中...</div>
  }
);

export function WalletWrapper() {
  return (
    <Suspense fallback={<div>加载钱包组件...</div>}>
      <WalletModal />
    </Suspense>
  );
}
```

### 条件渲染

使用条件渲染避免 SSR 问题：

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@btc-connect/react';

export function SafeWalletComponent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>加载中...</div>;
  }

  return <ConnectButton />;
}
```

## App Router 配置

### 创建客户端布局

`app/providers/client-layout.tsx`：

```typescript
'use client';

import { WalletProvider } from './wallet-provider';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return <WalletProvider>{children}</WalletProvider>;
}
```

### 更新根布局

`app/layout.tsx`：

```typescript
import { ClientLayout } from './providers/client-layout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
```

### 钱包页面

`app/wallet/page.tsx`：

```typescript
'use client';

import { useWallet, useWalletEvent } from '@btc-connect/react';

export default function WalletPage() {
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

  return (
    <div className="container">
      <h1>比特币钱包</h1>

      {!isConnected ? (
        <div className="connect-section">
          <h2>连接钱包</h2>
          <button onClick={() => handleConnect('unisat')}>
            连接 UniSat
          </button>
          <button onClick={() => handleConnect('okx')}>
            连接 OKX
          </button>
        </div>
      ) : (
        <div className="wallet-info">
          <h2>钱包信息</h2>
          <p>钱包: {currentWallet?.name}</p>
          <p>地址: {utils.formatAddress(address || '', { startChars: 6, endChars: 4 })}</p>
          <p>余额: {utils.formatBalance(balance || 0, { unit: 'BTC' })}</p>
          <p>网络: {network}</p>

          <div className="actions">
            <button onClick={() => disconnect()}>
              断开连接
            </button>

            <div className="network-switch">
              <h3>切换网络</h3>
              <button onClick={() => switchNetwork('livenet')}>
                主网
              </button>
              <button onClick={() => switchNetwork('testnet')}>
                测试网
              </button>
            </div>

            <div className="message-signing">
              <h3>消息签名</h3>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入要签名的消息"
              />
              <button onClick={handleSignMessage}>
                签名
              </button>
              {signature && (
                <p>签名: {signature}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Pages Router 配置

### 自定义 App

`pages/_app.tsx`：

```typescript
import type { AppProps } from 'next/app';
import { BTCWalletProvider } from '@btc-connect/react';
import { useEffect, useState } from 'react';

function SafeProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>{children}</div>;
  }

  return (
    <BTCWalletProvider
      autoConnect={true}
      connectTimeout={5000}
      theme="auto"
    >
      {children}
    </BTCWalletProvider>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SafeProvider>
      <Component {...pageProps} />
    </SafeProvider>
  );
}
```

### 钱包页面

`pages/wallet.tsx`：

```typescript
import { useWallet } from '@btc-connect/react';
import { useEffect, useState } from 'react';

export default function WalletPage() {
  const [isClient, setIsClient] = useState(false);
  const {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    connect,
    disconnect,
    utils
  } = useWallet();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <h1>比特币钱包</h1>

      {!isConnected ? (
        <div>
          <h2>连接钱包</h2>
          <button onClick={() => connect('unisat')}>
            连接 UniSat
          </button>
          <button onClick={() => connect('okx')}>
            连接 OKX
          </button>
        </div>
      ) : (
        <div>
          <h2>钱包信息</h2>
          <p>钱包: {currentWallet?.name}</p>
          <p>地址: {utils.formatAddress(address || '', { startChars: 6, endChars: 4 })}</p>
          <p>余额: {utils.formatBalance(balance || 0, { unit: 'BTC' })}</p>
          <p>网络: {network}</p>
          <button onClick={() => disconnect()}>
            断开连接
          </button>
        </div>
      )}
    </div>
  );
}
```

## 环境变量

创建 `.env.local`：

```env
# 钱包配置
NEXT_PUBLIC_WALLET_AUTO_CONNECT=true
NEXT_PUBLIC_WALLET_TIMEOUT=5000
NEXT_PUBLIC_WALLET_THEME=auto

# 网络配置
NEXT_PUBLIC_DEFAULT_NETWORK=livenet
NEXT_PUBLIC_ENABLE_TESTNET=true

# 功能开关
NEXT_PUBLIC_ENABLE_WALLET_MODAL=true
NEXT_PUBLIC_ENABLE_AUTO_CONNECT=true
```

在代码中使用环境变量：

```typescript
'use client';

import { BTCWalletProvider } from '@btc-connect/react';

const autoConnect = process.env.NEXT_PUBLIC_WALLET_AUTO_CONNECT === 'true';
const timeout = parseInt(process.env.NEXT_PUBLIC_WALLET_TIMEOUT || '5000');
const theme = process.env.NEXT_PUBLIC_WALLET_THEME as 'light' | 'dark' | 'auto';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <BTCWalletProvider
      autoConnect={autoConnect}
      connectTimeout={timeout}
      theme={theme}
    >
      {children}
    </BTCWalletProvider>
  );
}
```

## 部署配置

### Vercel 部署

创建 `vercel.json`：

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "bun install",
  "devCommand": "bun dev",
  "functions": {
    "app/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Docker 配置

创建 `Dockerfile`：

```dockerfile
FROM oven/bun:1 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: 'latest'

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: bun test

      - name: Build
        run: bun run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

## 性能优化

### 代码分割

```typescript
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// 动态导入钱包模态框
const WalletModal = dynamic(
  () => import('@btc-connect/react').then(mod => ({ default: mod.WalletModal })),
  {
    ssr: false,
    loading: () => <div>加载钱包选择器...</div>
  }
);

// 动态导入高级功能
const AdvancedWalletFeatures = dynamic(
  () => import('./advanced-wallet-features'),
  {
    ssr: false,
    loading: () => <div>加载高级功能...</div>
  }
);

export function OptimizedWalletComponent() {
  const [showModal, setShowModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        连接钱包
      </button>

      {showModal && (
        <WalletModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      <button onClick={() => setShowAdvanced(true)}>
        高级功能
      </button>

      {showAdvanced && <AdvancedWalletFeatures />}
    </div>
  );
}
```

### 缓存策略

v0.5.x 提供了强大的缓存系统，支持 TTL 和 LRU 淘汰策略。

#### 基础缓存使用

```typescript
'use client';

import { useMemo } from 'react';
import { useWallet } from '@btc-connect/react';
import { MemoryCache, CacheKeyBuilder } from '@btc-connect/core';

// 创建缓存实例
const balanceCache = new MemoryCache({
  ttl: 10000,              // 10秒过期
  maxSize: 100,            // 最多100项
  enableAutoCleanup: true  // 自动清理过期项
});

export function CachedWalletComponent() {
  const { address, balance, utils } = useWallet();

  // 使用缓存存储余额数据
  const cachedBalance = useMemo(() => {
    if (!address) return null;
    
    const key = CacheKeyBuilder.balance('unisat', address);
    const cached = balanceCache.get(key);
    
    if (cached) {
      return cached;
    }
    
    if (balance) {
      balanceCache.set(key, balance);
      return balance;
    }
    
    return null;
  }, [address, balance]);

  // 格式化显示
  const formattedAddress = useMemo(() => {
    if (!address) return '';
    return utils.formatAddress(address, { startChars: 6, endChars: 4 });
  }, [address, utils]);

  const formattedBalance = useMemo(() => {
    if (!cachedBalance) return '0 BTC';
    return utils.formatBalance(cachedBalance.confirmed || 0, { unit: 'BTC' });
  }, [cachedBalance, utils]);

  return (
    <div>
      <p>地址: {formattedAddress}</p>
      <p>余额: {formattedBalance}</p>
    </div>
  );
}
```

#### 增强缓存（带统计和事件）

```typescript
'use client';

import { EnhancedMemoryCache, CacheKeyBuilder } from '@btc-connect/core';

// 创建增强缓存实例
const dataCache = new EnhancedMemoryCache({
  ttl: 60000,              // 60秒过期
  maxSize: 1000,           // 最多1000项
  trackStats: true,        // 启用统计
  trackEvents: true,       // 启用事件
  maxMemory: 50 * 1024 * 1024  // 50MB 内存限制
});

export function EnhancedCacheExample() {
  // 监听缓存事件
  dataCache.on((event) => {
    console.log(`缓存事件: ${event.type}`, event.key);
    // event.type: 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'clear'
  });

  // 获取缓存统计
  const stats = dataCache.getStats();
  console.log({
    size: stats.size,           // 当前缓存大小
    hits: stats.hits,           // 命中次数
    misses: stats.misses,       // 未命中次数
    hitRate: stats.hitRate,     // 命中率 (0-1)
    evictions: stats.evictions  // 淘汰次数
  });

  // 批量操作
  const keys = ['key1', 'key2', 'key3'];
  const results = dataCache.getMany(keys);
  
  // 按条件查找
  const matches = dataCache.find((value, key) => {
    return key.startsWith('balance:');
  });

  return <div>缓存示例</div>;
}
```

#### 缓存管理器

```typescript
import { getCacheManager, CachePresets } from '@btc-connect/core';

const manager = getCacheManager();

// 创建命名缓存
const balanceCache = manager.getCache('balance', CachePresets.balance);
const accountCache = manager.getCache('accounts', CachePresets.accounts);
const networkCache = manager.getCache('network', CachePresets.network);

// 获取所有缓存统计
const allStats = manager.getAllStats();
console.log(allStats.balance, allStats.accounts);

// 清理所有过期项
const cleaned = manager.cleanupAll();
console.log(`清理了 ${cleaned} 个过期项`);
```

#### 缓存装饰器

```typescript
import { cached, CachePresets, invalidateCache } from '@btc-connect/core';

class WalletService {
  // 使用预设缓存配置
  @cached(CachePresets.balance)
  async getBalance(walletId: string, address: string) {
    // 自动缓存结果
    return await wallet.getBalance(address);
  }

  // 自定义缓存配置
  @cached({
    cacheName: 'custom',
    ttl: 30000,
    keyBuilder: (id) => `custom:${id}`,
    shouldCache: (result) => result !== null
  })
  async getData(id: string) {
    return await fetchData(id);
  }

  // 操作后清除相关缓存
  @invalidateCache(['balance', 'transactions'])
  async sendTransaction(to: string, amount: number) {
    return await wallet.send(to, amount);
  }
}
```

### 批处理优化

v0.5.x 提供了批处理系统，可以将多个请求合并为单个批量操作。

#### 基础批处理

```typescript
'use client';

import { useEffect, useState } from 'react';
import { BatchScheduler, createSimpleBatchScheduler } from '@btc-connect/core';

// 创建批处理调度器
const balanceBatchScheduler = createSimpleBatchScheduler<string, BalanceInfo>(
  async (addresses) => {
    // 批量获取余额
    return await Promise.all(
      addresses.map(addr => fetchBalance(addr))
    );
  },
  {
    maxBatchSize: 50,      // 每批最多50个请求
    maxWaitTimeMS: 100     // 最多等待100ms
  }
);

export function BatchWalletComponent() {
  const [balances, setBalances] = useState<Map<string, BalanceInfo>>(new Map());

  useEffect(() => {
    // 监听批处理事件
    balanceBatchScheduler.on((event) => {
      if (event.type === 'batchComplete') {
        console.log(`批次 ${event.batchId} 完成，处理了 ${event.requestCount} 个请求`);
      }
    });

    return () => balanceBatchScheduler.destroy();
  }, []);

  const fetchMultipleBalances = async (addresses: string[]) => {
    // 提交多个请求，自动批处理
    const results = await Promise.all(
      addresses.map(addr => balanceBatchScheduler.submit(addr))
    );
    
    const newBalances = new Map(addresses.map((addr, i) => [addr, results[i]]));
    setBalances(newBalances);
  };

  return (
    <div>
      <button onClick={() => fetchMultipleBalances(['addr1', 'addr2', 'addr3'])}>
        批量获取余额
      </button>
      
      {/* 显示余额列表 */}
    </div>
  );
}
```

#### 高级批处理

```typescript
'use client';

import { BatchScheduler } from '@btc-connect/core';

// 定义批处理器
const processor = async (requests) => {
  const results = new Map<string, Result>();
  
  // 批量处理所有请求
  for (const req of requests) {
    const result = await processItem(req.data);
    results.set(req.id, result);
  }
  
  return results;
};

// 创建高级调度器
const scheduler = new BatchScheduler(processor, {
  maxBatchSize: 100,        // 每批最多100项
  maxWaitTimeMS: 50,        // 最多等待50ms
  minBatchSize: 1,          // 最少1项触发处理
  priorityThreshold: 10     // 优先级阈值
});

export function AdvancedBatchExample() {
  const submitRequests = async () => {
    // 提交不同优先级的请求
    const promises = [
      scheduler.submit({ type: 'balance', address: 'tb1q...' }, 0),   // 普通优先级
      scheduler.submit({ type: 'balance', address: 'tb1q...' }, 10),  // 高优先级
      scheduler.submit({ type: 'balance', address: 'tb1q...' }, 5)    // 中优先级
    ];

    const results = await Promise.all(promises);
    
    // 获取性能指标
    const metrics = scheduler.getMetrics();
    console.log({
      totalBatches: metrics.totalBatches,
      totalRequests: metrics.totalRequests,
      averageBatchSize: metrics.averageBatchSize,
      averageWaitTime: metrics.averageWaitTime,
      successRate: metrics.successRate
    });

    return results;
  };

  // 强制立即处理当前队列
  const flushQueue = async () => {
    await scheduler.flush();
  };

  return (
    <div>
      <button onClick={submitRequests}>提交批处理请求</button>
      <button onClick={flushQueue}>立即处理队列</button>
    </div>
  );
}
```

### 懒加载

```typescript
'use client';

import { lazy, Suspense } from 'react';
import { useWallet } from '@btc-connect/react';

// 懒加载钱包详情组件
const WalletDetails = lazy(() => import('./wallet-details'));

export function LazyWalletComponent() {
  const { isConnected } = useWallet();

  return (
    <div>
      {isConnected && (
        <Suspense fallback={<div>加载钱包详情...</div>}>
          <WalletDetails />
        </Suspense>
      )}
    </div>
  );
}
```

## 常见问题

### Q: 为什么在 SSR 中出现 "window is not defined" 错误？

A: btc-connect 需要在浏览器环境中运行。确保使用 `'use client'` 指令或动态导入：

```typescript
'use client';

// 或者
import dynamic from 'next/dynamic';
const WalletComponent = dynamic(() => import('./wallet-component'), { ssr: false });
```

### Q: 如何在路由切换时保持钱包连接状态？

A: 使用全局状态管理或在根布局中提供 Provider：

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
```

### Q: 如何处理钱包连接的超时问题？

A: 配置合适的超时时间：

```typescript
<BTCWalletProvider
  connectTimeout={10000} // 10秒超时
  autoConnect={false}   // 禁用自动连接
>
  {children}
</BTCWalletProvider>
```

### Q: 如何在开发环境中启用调试模式？

A: 使用环境变量配置：

```typescript
const isDev = process.env.NODE_ENV === 'development';

<BTCWalletProvider
  config={{
    dev: {
      debug: isDev,
      showPerformanceMetrics: isDev,
      verboseLogging: isDev
    }
  }}
>
  {children}
</BTCWalletProvider>
```

### Q: 如何优化包大小？

A: 使用动态导入和代码分割：

```typescript
import dynamic from 'next/dynamic';

const ConnectButton = dynamic(
  () => import('@btc-connect/react').then(mod => ({ default: mod.ConnectButton })),
  { ssr: false }
);
```

## 完整示例

### 项目结构

```
my-btc-app/
├── app/
│   ├── providers/
│   │   ├── wallet-provider.tsx
│   │   └── client-layout.tsx
│   ├── wallet/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── wallet/
│   │   ├── connect-button.tsx
│   │   ├── wallet-info.tsx
│   │   └── wallet-modal.tsx
│   └── ui/
│       └── loading-spinner.tsx
├── lib/
│   ├── wallet-config.ts
│   └── utils.ts
├── hooks/
│   └── use-wallet-state.ts
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

### 钱包配置

`lib/wallet-config.ts`：

```typescript
import { WalletManagerConfig } from '@btc-connect/core';

export const walletConfig: WalletManagerConfig = {
  walletOrder: ['unisat', 'okx', 'xverse'],
  featuredWallets: ['unisat', 'okx'],
  theme: 'auto',
  animation: 'scale',
  showTestnet: process.env.NODE_ENV === 'development',
  showRegtest: false,
  connectionPolicy: {
    tasks: [
      {
        run: async () => ({ success: true }),
        required: false,
        autoBehavior: 'run'
      }
    ],
    emitEventsOnAutoConnect: true
  }
};
```

### 钱包状态 Hook

`hooks/use-wallet-state.ts`：

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useWallet, useWalletEvent } from '@btc-connect/react';

export function useWalletState() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    connect,
    disconnect,
    utils
  } = useWallet();

  // 监听连接事件
  useWalletEvent('connect', () => {
    setIsConnecting(false);
    setLastError(null);
  });

  // 监听错误事件
  useWalletEvent('error', (error) => {
    setIsConnecting(false);
    setLastError(error.message);
  });

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true);
    setLastError(null);

    try {
      await connect(walletId);
    } catch (error) {
      setIsConnecting(false);
      setLastError((error as Error).message);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setLastError(null);
    } catch (error) {
      setLastError((error as Error).message);
    }
  };

  return {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    isConnecting,
    lastError,
    handleConnect,
    handleDisconnect,
    utils
  };
}
```

### 钱包信息组件

`components/wallet/wallet-info.tsx`：

```typescript
'use client';

import { useWalletState } from '../../hooks/use-wallet-state';
import LoadingSpinner from '../ui/loading-spinner';

export function WalletInfo() {
  const {
    isConnected,
    address,
    balance,
    currentWallet,
    network,
    isConnecting,
    lastError,
    handleDisconnect,
    utils
  } = useWalletState();

  if (isConnecting) {
    return (
      <div className="wallet-connecting">
        <LoadingSpinner />
        <p>连接中...</p>
      </div>
    );
  }

  if (lastError) {
    return (
      <div className="wallet-error">
        <p>连接失败: {lastError}</p>
      </div>
    );
  }

  if (!isConnected) {
    return null;
  }

  return (
    <div className="wallet-info">
      <h2>钱包信息</h2>
      <div className="info-grid">
        <div className="info-item">
          <label>钱包:</label>
          <span>{currentWallet?.name}</span>
        </div>
        <div className="info-item">
          <label>地址:</label>
          <span>{utils.formatAddress(address || '', { startChars: 6, endChars: 4 })}</span>
        </div>
        <div className="info-item">
          <label>余额:</label>
          <span>{utils.formatBalance(balance || 0, { unit: 'BTC' })}</span>
        </div>
        <div className="info-item">
          <label>网络:</label>
          <span>{network}</span>
        </div>
      </div>
      <button onClick={handleDisconnect} className="disconnect-btn">
        断开连接
      </button>
    </div>
  );
}
```

### 主页面

`app/page.tsx`：

```typescript
'use client';

import { WalletInfo } from '../components/wallet/wallet-info';
import { ConnectButton } from '../components/wallet/connect-button';

export default function HomePage() {
  return (
    <main className="container">
      <h1>BTC Connect Next.js 示例</h1>
      <p>这是一个使用 btc-connect 的 Next.js 应用示例。</p>

      <section className="wallet-section">
        <h2>钱包连接</h2>
        <ConnectButton />
      </section>

      <section className="wallet-details">
        <WalletInfo />
      </section>
    </main>
  );
}
```

### 样式

`app/globals.css`：

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.wallet-section {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
}

.wallet-connecting {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.wallet-error {
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
}

.wallet-info {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  gap: 1rem;
  margin: 1rem 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e5e5;
}

.info-item label {
  font-weight: 600;
  color: #666;
}

.disconnect-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.disconnect-btn:hover {
  background: #c82333;
}
```

---

更多详细信息请参考：
- [📘 完整API文档](./api.md)
- [🎯 统一指南](../UNIFICATION_GUIDE.md)
- [📝 变更记录](../CHANGELOG.md)
- [📖 快速开始](../QUICK_START.md)
- [Next.js 官方文档](https://nextjs.org/docs)