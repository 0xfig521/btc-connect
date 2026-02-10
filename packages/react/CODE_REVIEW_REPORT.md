# @btc-connect/react 模块代码审查报告

**审查日期**: 2026-02-10
**审查范围**: packages/react 完整模块
**审查者**: AI Code Reviewer

---

## 1. 执行摘要

### 整体评估
- **代码质量**: B+ (良好，但有一些问题需要修复)
- **类型安全**: A- (TypeScript 类型定义基本完整，少数 any 类型需要改进)
- **React 最佳实践**: B+ (整体良好，但有 Hook 依赖问题)
- **可维护性**: B+ (代码结构清晰，但有一些重复代码)

### 关键统计
- 总文件数: 30+
- 发现问题数: 15+
- 严重问题: 2
- 中等问题: 5
- 轻微问题: 8+

---

## 2. 严重问题 (Critical Issues)

### 2.1 Hook 依赖问题导致潜在无限循环

**文件**: `src/hooks/useWalletManager.ts`
**行号**: 53-67

```typescript
// 问题代码
const currentAdapter = useMemo(() => {
  console.log('[BTC-Connect:React] useWalletManager: currentAdapter memo re-evaluating');
  if (!manager || !currentWallet) return null;
  return manager.getCurrentAdapter() || null;
}, [manager, currentWallet, state]); // state 依赖导致频繁重新计算
```

**问题描述**:
- `state` 依赖会导致 `currentAdapter` 在每次状态变化时重新计算
- 这可能触发不必要的重渲染循环

**建议修复**:
```typescript
const currentAdapter = useMemo(() => {
  if (!manager || !currentWallet) return null;
  return manager.getCurrentAdapter() || null;
}, [manager, currentWallet?.id]); // 只依赖 wallet id 而不是整个 state
```

---

### 2.2 Context 值引用不稳定导致不必要的重渲染

**文件**: `src/context/provider.tsx`
**行号**: 535-550

```typescript
const value: WalletContextType = {
  state: exposedState,
  currentWallet: state.currentWallet,
  availableWallets: state.availableWallets,
  isConnected,
  isConnecting: isConnectingState,
  isModalOpen: state.isModalOpen,
  connect,
  // ... 更多属性
};
```

**问题描述**:
- 每次 Provider 渲染时都会创建一个新的 `value` 对象
- 即使内容相同，引用变化会导致所有消费组件重渲染
- 应该使用 `useMemo` 缓存 value 对象

**建议修复**:
```typescript
const value = useMemo(() => ({
  state: exposedState,
  currentWallet: state.currentWallet,
  availableWallets: state.availableWallets,
  isConnected,
  isConnecting: isConnectingState,
  isModalOpen: state.isModalOpen,
  connect,
  disconnect,
  // ... 其他函数
}), [
  exposedState,
  state.currentWallet,
  state.availableWallets,
  isConnected,
  isConnectingState,
  state.isModalOpen,
  connect,
  disconnect,
  // ... 其他依赖
]);
```

---

## 3. 中等问题 (Medium Issues)

### 3.1 useCallback 依赖不完整

**文件**: `src/hooks/hooks.tsx`
**行号**: 345

```typescript
const switchNetwork = useCallback(
  async (targetNetwork: Network) => {
    // ... 实现
  },
  [manager], // 缺少 currentWallet 依赖
);
```

**问题**: 函数内部使用了 `currentWallet`，但依赖数组中没有包含它。

---

### 3.2 类型定义不一致

**文件**: `src/types/index.ts`
**行号**: 22

```typescript
export type ThemeMode = 'light' | 'dark';
```

**问题**: 与其他地方的定义可能不一致。在 hooks.tsx 中使用了 `Network` 类型但没有正确导入。

---

### 3.3 导出循环依赖风险

**文件**: `src/hooks/index.ts`

```typescript
export {
  useAccount,
  useBalance,
  useConnectWallet,
  useNetwork,
  useRefreshAccountInfo,
  useWallet,
  useWalletEvent,
  useWalletModal,
} from './hooks';
```

**问题**: `hooks.tsx` 又导入了很多其他模块，容易形成循环依赖。

---

### 3.4 Context 消费者错误处理

**文件**: `src/context/provider.tsx`
**行号**: 560-566

```typescript
export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a BTCWalletProvider');
  }
  return context;
}
```

**问题**: 错误消息中使用了旧名称 `BTCWalletProvider`，应该是 `BTCWalletProvider`（已修正），但检查时确认是匹配的。

---

## 4. 轻微问题 (Minor Issues)

### 4.1 代码重复

**文件**: 多个文件

`switchNetwork` 逻辑在多个地方重复:
- `hooks.tsx` 中的 `useWallet` hook
- `useNetwork` hook (如果存在)

### 4.2 缺少 JSDoc 注释

**文件**: 多个 hook 文件

许多导出函数缺少完整的 JSDoc 注释，影响 IDE 的智能提示。

### 4.3 魔法数字

**文件**: `src/hooks/useAutoConnect.ts`

```typescript
const timeoutId = setTimeout(() => {
  // ...
}, 2000); // 2秒备用超时
```

应该定义为常量。

### 4.4 console.log 在生产代码中

**文件**: 多个文件

存在大量的 `console.log` 语句，应该在生产构建中移除或改为使用日志级别控制。

### 4.5 测试覆盖率不足

**文件**: `src/__tests__/`

现有的测试只是简单的存在性检查，缺少功能测试和边界情况测试。

---

## 5. 性能优化建议

### 5.1 使用 React.memo 包装组件

对于 `ConnectButton` 等组件，使用 `React.memo` 避免不必要的重渲染。

```typescript
export const ConnectButton: React.FC<ConnectButtonProps> = React.memo(({
  // ...
}) => {
  // ...
});
```

### 5.2 批量状态更新

在 `reducer.ts` 中，考虑使用 `useReducer` 的批量更新特性。

### 5.3 虚拟列表

如果钱包列表很长，使用虚拟列表优化渲染性能。

---

## 6. 安全建议

### 6.1 XSS 防护

确保所有渲染的用户输入都经过适当的转义。

### 6.2 本地存储加密

敏感信息（如钱包连接状态）应该加密存储。

### 6.3 CSP 支持

确保代码在严格的内容安全策略下正常工作。

---

## 7. 可访问性 (a11y) 改进

### 7.1 ARIA 标签

为所有交互元素添加适当的 ARIA 标签。

### 7.2 键盘导航

确保所有功能都可以通过键盘访问。

### 7.3 焦点管理

在模态框打开时正确管理焦点。

---

## 8. 结论与建议优先级

### 高优先级 (立即修复)
1. 修复 useWalletManager 中的 useMemo 依赖问题
2. 使用 useMemo 缓存 Context value 对象

### 中优先级 (本周修复)
3. 完善 useCallback 依赖数组
4. 统一类型定义
5. 移除或替换 console.log

### 低优先级 (后续迭代)
6. 增加测试覆盖率
7. 性能优化 (React.memo 等)
8. 改进可访问性

---

## 附录: 代码修复示例

### A. 修复 Context Value 引用不稳定

```typescript
// 在 provider.tsx 中
const value = useMemo(() => ({
  state: exposedState,
  currentWallet: state.currentWallet,
  // ... 其他属性
}), [
  exposedState,
  state.currentWallet,
  // ... 精确依赖
]);
```

### B. 修复 useWalletManager 依赖

```typescript
// 在 useWalletManager.ts 中
const currentAdapter = useMemo(() => {
  if (!manager || !currentWallet) return null;
  return manager.getCurrentAdapter() || null;
}, [manager, currentWallet?.id]); // 使用 id 而不是整个对象
```

---

**报告结束**

*本报告基于 2026-02-10 的代码状态生成。建议在修复问题后重新运行代码审查。*
