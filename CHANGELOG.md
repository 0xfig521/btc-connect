# 变更日志

本文档记录了 btc-connect 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [0.5.1] - 2026-05-03

### 🎉 重大更新 - 性能与稳定性增强

#### ✨ 新功能
- **缓存系统**: 新增完整的缓存基础设施
  - `MemoryCache`: 基础内存缓存实现，支持 TTL 和 LRU 淘汰策略
  - `CacheManager`: 统一缓存管理器，支持命名空间和批量操作
  - `EnhancedMemoryCache`: 增强型缓存，支持统计、预热、健康检查
  - 缓存装饰器: 为适配器方法自动添加缓存层
- **批处理系统**: 新增 `BatchScheduler` 支持请求合并和批量处理
- **统一错误处理**: 全新的错误处理架构
  - `UnifiedError`: 统一错误类型，包含错误码、上下文、恢复策略
  - `ErrorFactory`: 错误工厂，支持创建标准化错误
  - `ErrorRecoveryStrategy`: 错误恢复策略枚举（重试、切换钱包、用户操作等）

#### 🔧 API 变更
- **增强钱包检测**: 实现智能轮询机制，20秒内每300ms检测延迟注入的钱包
- **版本常量修复**: 修复版本号导出问题，确保 `VERSION` 常量正确可用

#### 🏗️ 架构改进
- **缓存抽象层**: 所有缓存实现遵循统一接口，便于扩展
- **错误分类系统**: 错误按类型分类（网络、钱包、用户、系统），便于处理
- **性能优化**: 减少重复请求，优化内存使用

#### 📦 包版本
- **@btc-connect/core**: v0.5.1 - 核心缓存和错误处理系统
- **@btc-connect/react**: v0.5.1 - React 集成，支持缓存优化
- **@btc-connect/vue**: v0.5.1 - Vue 集成，支持缓存优化

---

## [0.5.0] - 2026-04-15

### 🎉 重大更新 - 统一 Hook API 与智能主题

#### ✨ 新功能
- **统一 Hook API**: React 和 Vue 包现在提供完全一致的接口
  - `useWallet`: 成为所有功能的单一访问点
  - 返回值结构完全一致（Vue 返回 Ref，React 返回普通值）
  - 统一的错误处理和事件系统
- **智能主题检测**: 全新的主题管理系统
  - 支持 `light`、`dark`、`auto` 三种模式
  - 自动跟随系统主题变化
  - 主题持久化存储
- **SSR 兼容性改进**: 完整的服务器端渲染支持
  - 所有 Hooks/Composables 在 SSR 环境下安全运行
  - 自动处理 `window` 和 `document` 访问
  - 水合错误修复

#### 🔧 API 变更

**React 包**:
```typescript
// 统一的 useWallet Hook
const {
  // 状态
  status, accounts, currentAccount, network, error,
  isConnected, isConnecting, address, balance, publicKey,
  // 操作
  connect, disconnect, switchWallet, switchNetwork,
  // 子功能
  useWalletEvent, walletModal, utils
} = useWallet();

// 主题管理
const { theme, setTheme, resolvedTheme } = useTheme();
```

**Vue 包**:
```typescript
// 统一的 useWallet Composable（返回 Ref）
const {
  status, accounts, currentAccount, network, error,
  isConnected, isConnecting, address, balance, publicKey,
  connect, disconnect, switchWallet, switchNetwork,
  useWalletEvent, walletModal, utils
} = useWallet();

// 主题管理
const { theme, setTheme, resolvedTheme } = useTheme();
```

#### 🏗️ 架构改进
- **类型系统统一**: React 和 Vue 共享完全相同的类型定义
- **核心包增强**: 新增跨框架工具函数和类型
- **示例项目更新**: Next.js 和 Nuxt 示例展示完整 SSR 方案

#### 🧪 测试覆盖
- **核心包**: 缓存系统完整测试
- **React 包**: Hook 测试套件更新
- **Vue 包**: Composable 测试套件更新
- **集成测试**: 跨框架 API 一致性验证

#### 📦 包版本
- **@btc-connect/core**: v0.5.0 - 统一类型和工具函数
- **@btc-connect/react**: v0.5.0 - 统一 Hook API
- **@btc-connect/vue**: v0.5.0 - 统一 Composable API

#### 🔄 迁移指南

**从 v0.4.x 迁移**:
```typescript
// v0.4.x
import { useWallet, useAccount } from '@btc-connect/react';
const { connect } = useWallet();
const { address } = useAccount();

// v0.5.0+
import { useWallet } from '@btc-connect/react';
const { connect, address } = useWallet();
```

#### ⚠️ 破坏性变更
- `useAccount` Hook/Composable 已废弃，功能集成到 `useWallet`
- 主题 API 重构，旧的主题属性可能需要更新

---

## [0.4.0] - 2025-11-01

### 🎉 重大更新 - React/Vue 包统一

#### ✨ 新功能
- **统一的 Hook/Composable 接口**: React 和 Vue 包现在提供完全一致的 API 接口
- **增强的 useWallet Hook**: 成为所有功能的统一访问点，包含状态、操作和工具函数
- **新增事件监听 Hook**: `useWalletEvent` 支持跨框架的事件监听功能
- **新增钱包管理器 Hook**: `useWalletManager` 提供高级钱包管理功能
- **新增主题管理 Hook**: `useTheme` 支持亮色/暗色/自动主题切换
- **增强模态框管理**: `useWalletModalEnhanced` (React) 和 `useWalletModal` (Vue) 支持来源追踪
- **统一工具函数库**: 新增 `formatAddress`、`formatBalance` 等 10+ 个跨框架工具函数
- **完整类型系统**: 统一的 TypeScript 类型定义，确保类型安全

#### 🔧 API 变更

**React 包**:
```typescript
// 新增 Hooks
useWalletEvent()    // 事件监听
useWalletManager()  // 钱包管理器
useTheme()          // 主题管理
useWalletModalEnhanced()  // 增强模态框控制

// 增强的 useWallet Hook
const {
  // 基础状态
  status, accounts, currentAccount, network, error, currentWallet,
  isConnected, isConnecting, theme, address, balance, publicKey,

  // 连接操作
  connect, disconnect, switchWallet, availableWallets,

  // 网络管理
  switchNetwork,

  // 子功能访问
  useWalletEvent,
  walletModal,
  currentAdapter, allAdapters, manager,

  // 签名和交易
  signMessage, signPsbt, sendBitcoin,

  // 工具函数
  utils: { formatAddress, formatBalance }
} = useWallet();
```

**Vue 包**:
```typescript
// 新增 Composables
useWalletEvent()    // 事件监听
useWalletManager()  // 钱包管理器
useTheme()          // 主题管理
useWalletModal()    // 模态框控制

// 增强的 useWallet Composable
// 返回相同的接口结构，但状态为 Ref<T>
const {
  // 与 React 包相同的属性和方法
  // ...（所有属性都返回响应式引用）
} = useWallet();
```

#### 🏗️ 架构改进
- **统一类型定义**: 在 `@btc-connect/core` 中创建 `src/types/unified.ts`
- **共享工具函数**: 所有工具函数移至核心包，支持跨框架使用
- **简化导出结构**: 两个包的导出结构完全一致
- **移除冗余功能**: Vue 包的 `createWalletContext` 从公共 API 中移除

#### 🧪 测试覆盖
- **核心包**: 26 个测试用例，100% 通过率
- **React 包**: 完整的 Hook 测试套件
- **Vue 包**: 完整的 Composable 测试套件
- **集成测试**: 跨框架一致性验证

#### 📦 包版本
- **@btc-connect/core**: v0.4.0 - 核心适配层，新增统一类型和工具函数
- **@btc-connect/react**: v0.4.0 - React Hooks，完全 API 重构
- **@btc-connect/vue**: v0.4.0 - Vue Composables，完全 API 重构

#### 🔄 迁移指南

**React 包迁移**:
```typescript
// v0.3.x -> v0.4.0
// 之前
import { useWallet, useAccount } from '@btc-connect/react';
const { connect } = useWallet();
const { address } = useAccount();

// 现在
import { useWallet } from '@btc-connect/react';
const { connect, address, useWalletEvent, walletModal, utils } = useWallet();
```

**Vue 包迁移**:
```typescript
// v0.3.x -> v0.4.0
// 之前
import { useCore, useWallet } from '@btc-connect/vue';
const { connect } = useCore();
const { address } = useWallet();

// 现在
import { useWallet } from '@btc-connect/vue';
const { connect, address, useWalletEvent, walletModal, utils } = useWallet();
```

#### 📚 文档更新
- 新增 [统一指南](./UNIFICATION_GUIDE.md) - 详细的迁移和功能文档
- 更新所有模块的 CLAUDE.md 文档
- 更新示例项目以展示新 API 使用

#### ⚠️ 破坏性变更
- **React**: `useAccount` Hook 的功能已集成到 `useWallet` 中
- **Vue**: `createWalletContext` 函数已从公共 API 中移除
- **Vue**: `useCore` Composable 的连接功能已移至 `useWallet`
- 所有包的类型导入路径可能需要更新

#### 🔧 开发体验改进
- **更好的 TypeScript 支持**: 统一的类型系统和完整的类型提示
- **一致的错误处理**: 跨框架统一的错误处理机制
- **性能优化**: 减少重复渲染和不必要的计算
- **开发工具**: 更好的调试和开发体验

## [0.3.11] - 2025-10-26

### 🐛 Bug 修复
- **核心包 (@btc-connect/core)**: 添加缺失的 `BTCWalletManager.switchNetwork()` 方法
- **React包 (@btc-connect/react)**: 修复 `useNetwork` Hook 中的网络切换功能
- **Vue包 (@btc-connect/vue)**: 修复 `useNetwork` Composable 中的网络切换功能

### ✨ 新功能
- **统一网络切换接口**: 现在所有三个包都支持完整的网络切换功能
- **改进错误处理**: 提供更清晰的错误提示和用户反馈
- **事件系统完善**: 网络切换时自动发射 `networkChange` 事件

### 🔧 技术改进
- **类型安全**: 完善所有 `switchNetwork` 方法的 TypeScript 类型定义
- **统一API**: 核心管理器、React Hook 和 Vue Composable 现在提供一致的接口
- **钱包兼容性**: 验证并确保 UniSat、Xverse 和 OKX 钱包的网络切换支持

### 📦 包更新
- **@btc-connect/core**: v0.3.11 - 核心钱包适配层和管理器
- **@btc-connect/react**: v0.3.11 - React Context 和 Hooks
- **@btc-connect/vue**: v0.3.11 - Vue Composables 和插件

### 📚 使用示例

#### 核心包使用
```typescript
import { BTCWalletManager } from '@btc-connect/core'

const manager = new BTCWalletManager()
await manager.switchNetwork('testnet')
```

#### React包使用
```typescript
import { useNetwork } from '@btc-connect/react'

const { network, switchNetwork } = useNetwork()
await switchNetwork('testnet')
```

#### Vue包使用
```typescript
import { useNetwork } from '@btc-connect/vue'

const { network, switchNetwork } = useNetwork()
await switchNetwork('testnet')
```

---

## [0.3.10] - 2025-10-24

### 🚀 性能优化
- **连接性能提升**: 移除自动获取public key和balance的逻辑以提升连接速度
- **增强钱包检测**: 实现20秒内每300ms轮询机制，支持延迟注入的钱包检测
- **实时更新**: 检测到新钱包时立即更新UI界面

### 🔧 技术改进
- **架构简化**: 移除z-index-manager模块及其相关逻辑，简化整体架构
- **错误修复**: 修复所有TypeScript类型和代码规范错误
- **完善机制**: 优化React和Vue的钱包检测实时更新机制

### 📦 包更新
- **@btc-connect/core**: v0.3.10 - 优化的核心适配层
- **@btc-connect/react**: v0.3.10 - 优化的React集成
- **@btc-connect/vue**: v0.3.10 - 优化的Vue集成

---

## [0.3.4] - 2025-10-19

### 🎨 新功能
- **主题切换功能**: Next.js 示例新增动态主题切换测试按钮
- **Provider级主题管理**: 统一在Provider层面管理主题，组件内部获取
- **视觉增强**: 添加主题切换动画效果和交互反馈

### 🔧 技术改进
- **组件命名统一**: 全面替换 `BTCConnectButton` 为 `ConnectButton`
- **架构优化**: 优化主题管理架构，提升组件一致性
- **SSR兼容**: 确保主题切换功能在Next.js SSR环境中正常工作

### 📦 包更新
- **@btc-connect/core**: v0.3.4 - 核心钱包适配层
- **@btc-connect/react**: v0.3.4 - React Context 和 Hooks
- **@btc-connect/vue**: v0.3.4 - Vue Composables 和插件

### 📚 文档
- 更新所有README和文档中的组件命名
- 完善主题管理相关的使用说明
- 添加Next.js主题切换示例文档

---

## [未发布]

### 🚀 新功能
- GitHub Actions CI/CD 自动化工作流
- 支持多包自动发布到 NPM
- 分支管理和保护策略
- 自动化版本发布流程

### 📦 包更新
- **@btc-connect/core**: 核心钱包适配层和管理器
- **@btc-connect/react**: React Context 和 Hooks
- **@btc-connect/vue**: Vue Composables 和插件

### 🔧 技术改进
- 完整的自动化测试流程
- 代码质量检查和类型检查
- 智能缓存系统优化构建性能
- 自动化 NPM 发布流程

### 📚 文档
- 添加完整的 CI/CD 文档说明
- 分支管理策略和命名规范
- 自动化发布流程指南

---

## 版本说明

### 版本类型
- **Major (主版本)**: 不兼容的 API 修改
- **Minor (次版本)**: 向下兼容的功能性新增
- **Patch (修订版)**: 向下兼容的问题修正

### 发布流程
1. 代码提交到 `main` 分支自动触发发布
2. 手动触发 Release 工作流进行版本发布
3. 自动更新版本号和发布到 NPM
4. 创建 GitHub Release 和更新 CHANGELOG

### 分支策略
- **main**: 生产环境分支，自动发布到 NPM
- **feature/***: 功能开发分支，PR 回 main
- **fix/***: 问题修复分支，PR 回 main
- **hotfix/***: 紧急修复分支，直接合并到 main
- **release/***: 版本发布分支，准备发布

### 安装使用

```bash
# 安装核心包
npm install @btc-connect/core

# 安装 React 集成
npm install @btc-connect/react

# 安装 Vue 集成
npm install @btc-connect/vue
```

更多信息请查看 [完整文档](https://github.com/icehugh/btc-connect)。