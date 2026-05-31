# Adapter 测试展示功能

## TL;DR

> **Quick Summary**: 在 Next.js 和 Nuxt examples 中添加当前连接 adapter 的详细测试展示，包括所有方法、属性和事件。
>
> **Deliverables**:
> - React WalletTestSuite 添加 Adapter 详情面板
> - Vue WalletTestSuite 添加 Adapter 详情面板
> - 展示 adapter 的所有方法和属性
> - 提供交互式测试功能
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - React 和 Vue 可并行
> **Critical Path**: React Adapter Panel → Vue Adapter Panel → 验证

---

## Context

### Original Request
用户要求："nuxt 和next可以测试当前连接的adapter,展示其方法和属性"

### Research Findings
- **Adapter 接口**: `BTCWalletAdapter` 包含 id, name, icon 属性和多个方法
- **核心方法**: connect, disconnect, getAccounts, getNetwork, signMessage, signPsbt, sendBitcoin
- **扩展方法**: getBalance, signMessageAdvanced, sendBitcoinAdvanced, sendInscription
- **钱包特有方法**: UniSat (sendRunes, signPsbts), OKX (transferNft, splitUtxo)
- **当前使用**: 两个 examples 都通过 `useWalletManager` 获取 adapter

---

## Work Objectives

### Core Objective
在 WalletTestSuite 组件中添加 Adapter 详情面板，展示当前连接 adapter 的完整信息，并提供交互式测试功能。

### Concrete Deliverables
- `examples/nextjs/src/components/WalletTestSuite.tsx` - 添加 Adapter 详情面板
- `examples/nuxt-example/components/WalletTestSuite.vue` - 添加 Adapter 详情面板
- 展示 adapter 基本信息（id, name, icon）
- 展示 adapter 状态（isReady, getState）
- 展示可用方法列表
- 提供方法测试按钮

### Definition of Done
- [ ] React WalletTestSuite 包含 Adapter 详情面板
- [ ] Vue WalletTestSuite 包含 Adapter 详情面板
- [ ] 展示 adapter 的所有属性
- [ ] 展示 adapter 的所有方法
- [ ] 提供方法调用测试功能
- [ ] `bun dev` 运行正常，无 TypeScript 错误

### Must Have
- 展示当前连接的 adapter 信息
- 展示 adapter 的所有方法
- 提供交互式测试功能

### Must NOT Have (Guardrails)
- 不要修改 packages 中的代码实现
- 不要破坏现有的测试功能
- 不要添加不必要的依赖

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - React Adapter Panel):
├── Task 1: 添加 Adapter 详情面板结构 [quick]
├── Task 2: 展示 Adapter 基本信息 [quick]
├── Task 3: 展示 Adapter 方法列表 [quick]
└── Task 4: 添加方法测试功能 [quick]

Wave 2 (After Wave 1 - Vue Adapter Panel):
├── Task 5: 添加 Adapter 详情面板结构 [quick]
├── Task 6: 展示 Adapter 基本信息 [quick]
├── Task 7: 展示 Adapter 方法列表 [quick]
└── Task 8: 添加方法测试功能 [quick]

Wave 3 (After Wave 2 - 验证):
├── Task 9: React example 验证 [quick]
└── Task 10: Vue example 验证 [quick]

Critical Path: Task 1-4 → Task 5-8 → Task 9-10
Parallel Speedup: React 和 Vue 可并行
Max Concurrent: 4 (Wave 1) 或 4 (Wave 2)
```

---

## TODOs

- [x] 1. 添加 Adapter 详情面板结构（React）
  **What to do**:
  - 在 WalletTestSuite 中添加新的 "🔌 Adapter 详情" 区域
  - 使用 useWalletManager 获取 currentAdapter
  - 创建面板容器和布局

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

- [x] 2. 展示 Adapter 基本信息（React）
  **What to do**:
  - 展示 adapter.id, adapter.name, adapter.icon
  - 展示 adapter.isReady() 状态
  - 展示 adapter.getState() 返回的完整状态

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

- [x] 3. 展示 Adapter 方法列表（React）
  **What to do**:
  - 使用 Object.getOwnPropertyNames(Object.getPrototypeOf(adapter)) 获取所有方法
  - 过滤出公共方法（排除 _ 开头的内部方法）
  - 以列表形式展示方法名

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

- [x] 4. 添加方法测试功能（React）
  **What to do**:
  - 为常用方法添加测试按钮
  - connect/disconnect 测试
  - getAccounts/getNetwork 测试
  - signMessage 测试（使用测试消息）
  - 展示方法调用结果

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

- [x] 5. 添加 Adapter 详情面板结构（Vue）
  **What to do**:
  - 在 WalletTestSuite 中添加新的 "🔌 Adapter 详情" 区域
  - 使用 useWalletManager 获取 currentAdapter
  - 创建面板容器和布局

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

- [x] 6. 展示 Adapter 基本信息（Vue）
  **What to do**:
  - 展示 adapter.id, adapter.name, adapter.icon
  - 展示 adapter.isReady() 状态
  - 展示 adapter.getState() 返回的完整状态

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

- [x] 7. 展示 Adapter 方法列表（Vue）
  **What to do**:
  - 使用 Object.getOwnPropertyNames(Object.getPrototypeOf(adapter)) 获取所有方法
  - 过滤出公共方法
  - 以列表形式展示方法名

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

- [x] 8. 添加方法测试功能（Vue）
  **What to do**:
  - 为常用方法添加测试按钮
  - connect/disconnect 测试
  - getAccounts/getNetwork 测试
  - signMessage 测试
  - 展示方法调用结果

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

- [ ] 9. React example 验证
  **What to do**:
  - 启动 Next.js 开发服务器
  - 连接钱包
  - 检查 Adapter 详情面板
  - 测试所有方法按钮
  - 截图保存证据

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`playwright`]

- [ ] 10. Vue example 验证
  **What to do**:
  - 启动 Nuxt 开发服务器
  - 连接钱包
  - 检查 Adapter 详情面板
  - 测试所有方法按钮
  - 截图保存证据

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`playwright`]

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  检查所有 TODO 是否完成，所有 Must Have 是否满足，所有 Must NOT Have 是否遵守。

- [ ] F2. **Code Quality Review** — `unspecified-high`
  运行 TypeScript 检查，确保无类型错误。检查代码风格一致性。

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright`)
  启动两个 examples，手动测试所有新添加的功能，截图保存证据。

- [ ] F4. **Scope Fidelity Check** — `deep`
  确认只修改了 examples，没有修改 packages 代码。确认所有 Adapter 方法都已展示。

---

## Success Criteria

### Verification Commands
```bash
# React example
cd examples/nextjs
bun typecheck  # Expected: 无错误
bun dev        # Expected: 服务器启动成功

# Vue example
cd examples/nuxt-example
bun typecheck  # Expected: 无错误
bun dev        # Expected: 服务器启动成功
```

### Final Checklist
- [ ] React WalletTestSuite 展示 Adapter 详情
- [ ] Vue WalletTestSuite 展示 Adapter 详情
- [ ] 展示所有 adapter 属性
- [ ] 展示所有 adapter 方法
- [ ] 方法测试功能正常
- [ ] 无 TypeScript 错误
- [ ] 无运行时错误
