# Draft: btc-connect Skill 更新

## 更新目标
- 根据最新代码更新 skill 内容
- 移除旧版本兼容内容
- 深度优化 skill 结构和触发准确性

## 探索结果汇总

### 版本信息
- 所有包当前版本: **v0.5.1** (core/react/vue)
- Skill 当前版本: v0.5.0 → 需要更新到 v0.5.1

### 主要变更（v0.5.0 → v0.5.1）
1. **新增缓存系统**: MemoryCache, EnhancedMemoryCache, CacheManager, 装饰器(@cached等)
2. **新增批处理系统**: BatchScheduler, createBatchScheduler
3. **新增统一错误处理**: UnifiedError, ErrorFactory, ErrorCode, ErrorSeverity
4. **useAccount 已废弃**: 功能合并到 useWallet
5. **useWallet 是统一访问点**: React/Vue 完全一致接口
6. **Vue 特有增强**: useWalletManagerAdvanced, useWalletInfo, AddressDisplay, BalanceDisplay, WalletStatus
7. **React 特有**: ConnectionPolicy 支持

### 钱包支持状态
- UniSat: ✅ Active
- OKX: ✅ Active  
- Xverse: 🚧 导出但未在 factory 中实例化（开发中）

### Skill 需要更新的内容
1. 版本号: v0.5.0 → v0.5.1
2. 移除 v0.4.0+ 兼容说明
3. 移除 useAccount 单独说明（已废弃）
4. 新增缓存系统文档
5. 新增批处理系统文档
6. 新增统一错误处理文档
7. 更新 Xverse 状态
8. 更新 Vue 特有 composables
9. 更新 React ConnectionPolicy
10. 优化 description 触发准确性
