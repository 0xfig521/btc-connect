# 更新 Examples 测试套件 - 展示所有接口

## TL;DR

> **Quick Summary**: 为 examples/nextjs 和 examples/nuxt-example 扩展 WalletTestSuite 组件，展示 @btc-connect/react 和 @btc-connect/vue 的所有公共 API 接口和属性。
>
> **Deliverables**:
> - 更新后的 nextjs WalletTestSuite.tsx（展示所有 React Hooks 和属性）
> - 更新后的 nuxt-example WalletTestSuite.vue（展示所有 Vue Composables 和属性）
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 tasks
> **Critical Path**: React Task → Vue Task

---

## Context

### Original Request
example要展示所有的接口测试以及属性，除了 core

### Interview Summary
**Key Discussions**:
- 需要展示 React 包的所有 Hooks 和返回属性
- 需要展示 Vue 包的所有 Composables 和返回属性
- 不需要展示 core 包（用户明确排除）
- 现有 WalletTestSuite 已有基础功能，需要扩展

**Research Findings**:
- React 包有 12 个 Hooks: useWallet, useConnectWallet, useNetwork, useWalletModal, useAccount, useBalance, useSignature, useTransactions, useWalletEvent, useWalletManager, useWalletModalEnhanced, useWalletDetection
- Vue 包有 16 个 Composables: useWallet, useWalletEvent, useWalletManager, useWalletManagerAdvanced, useCore, useNetwork, useWalletModal, useAccount, useBalance, useSignature, useTransactions, useWalletDetection, useWalletInfo, useConnectWallet, useTheme, useConfig
- 现有测试套件只展示了部分功能

---

## Work Objectives

### Core Objective
扩展 examples 的 WalletTestSuite 组件，完整展示 @btc-connect/react 和 @btc-connect/vue 的所有公共 API。

### Concrete Deliverables
- `examples/nextjs/src/components/WalletTestSuite.tsx` - 展示所有 React Hooks
- `examples/nuxt-example/components/WalletTestSuite.vue` - 展示所有 Vue Composables

### Definition of Done
- [ ] React WalletTestSuite 展示所有 12 个 Hooks
- [ ] Vue WalletTestSuite 展示所有 16 个 Composables
- [ ] 每个 Hook/Composable 的所有返回属性都有展示
- [ ] 提供交互测试按钮
- [ ] 显示实时状态和日志

### Must Have
- 展示所有公共 API
- 提供测试交互功能
- 显示实时状态

### Must NOT Have (Guardrails)
- MUST NOT 展示 core 包的 API
- MUST NOT 添加新功能到 packages
- MUST NOT 修改 packages 的代码

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO（UI 展示不需要测试框架）
- **Automated tests**: None
- **Verification**: 通过浏览器手动验证

### QA Policy
- 启动开发服务器验证组件渲染
- 检查所有 Hook/Composable 的状态显示
- 测试交互按钮功能

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - 并行):
├── Task 1: 更新 React WalletTestSuite [visual-engineering]
└── Task 2: 更新 Vue WalletTestSuite [visual-engineering]
```

### Dependency Matrix

- **1-2**: - - 完成, 1

### Agent Dispatch Summary

- **Wave 1**: **2** - T1-T2 → `visual-engineering`

---

## TODOs

- [ ] 1. 更新 React WalletTestSuite

  **What to do**:
  - 扩展现有 WalletTestSuite.tsx
  - 添加所有 12 个 Hooks 的展示
  - 每个 Hook 显示所有返回属性
  - 添加交互测试按钮
  - 优化 UI 布局

  **Must NOT do**:
  - 不要修改 packages/react 的代码
  - 不要添加 core 包的展示

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 组件开发，需要良好的视觉设计
  - **Skills**: [`vue`]
    - `vue`: Vue 组件开发技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `examples/nextjs/src/components/WalletTestSuite.tsx` - 现有组件
  - `packages/react/src/hooks/` - 所有 Hooks 实现
  - `packages/react/README.md` - Hooks API 文档

  **Acceptance Criteria**:
  - [ ] 展示所有 12 个 Hooks
  - [ ] 每个 Hook 的所有属性都有显示
  - [ ] 提供交互测试功能
  - [ ] UI 布局清晰美观

  **QA Scenarios**:
  ```
  Scenario: React WalletTestSuite 渲染
    Tool: Bash (bun dev)
    Steps:
      1. cd examples/nextjs && bun dev
      2. 打开浏览器访问 http://localhost:3000
      3. 检查所有 Hooks 显示正常
    Expected Result: 所有 Hooks 和属性显示正常
    Evidence: .sisyphus/evidence/task-1-react-testsuite.png
  ```

  **Commit**: YES
  - Message: `feat(examples): expand React WalletTestSuite with all hooks`
  - Files: `examples/nextjs/src/components/WalletTestSuite.tsx`

- [ ] 2. 更新 Vue WalletTestSuite

  **What to do**:
  - 扩展现有 WalletTestSuite.vue
  - 添加所有 16 个 Composables 的展示
  - 每个 Composable 显示所有返回属性
  - 添加交互测试按钮
  - 优化 UI 布局

  **Must NOT do**:
  - 不要修改 packages/vue 的代码
  - 不要添加 core 包的展示

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI 组件开发，需要良好的视觉设计
  - **Skills**: [`vue`]
    - `vue`: Vue 组件开发技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `examples/nuxt-example/components/WalletTestSuite.vue` - 现有组件
  - `packages/vue/src/composables/` - 所有 Composables 实现
  - `packages/vue/README.md` - Composables API 文档

  **Acceptance Criteria**:
  - [ ] 展示所有 16 个 Composables
  - [ ] 每个 Composable 的所有属性都有显示
  - [ ] 提供交互测试功能
  - [ ] UI 布局清晰美观

  **QA Scenarios**:
  ```
  Scenario: Vue WalletTestSuite 渲染
    Tool: Bash (bun dev)
    Steps:
      1. cd examples/nuxt-example && bun dev
      2. 打开浏览器访问 http://localhost:3001
      3. 检查所有 Composables 显示正常
    Expected Result: 所有 Composables 和属性显示正常
    Evidence: .sisyphus/evidence/task-2-vue-testsuite.png
  ```

  **Commit**: YES
  - Message: `feat(examples): expand Vue WalletTestSuite with all composables`
  - Files: `examples/nuxt-example/components/WalletTestSuite.vue`

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **UI 完整性检查** — `unspecified-high`
  检查所有 Hooks/Composables 是否都有展示，属性是否完整。
  Output: `React Hooks [12/12] | Vue Composables [16/16] | VERDICT: APPROVE/REJECT`

- [ ] F2. **功能测试** — `unspecified-high`
  启动开发服务器，测试交互功能是否正常。
  Output: `React [PASS/FAIL] | Vue [PASS/FAIL] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `feat(examples): expand WalletTestSuite with all APIs`
- **Final**: `feat(examples): complete API showcase for React and Vue`

---

## Success Criteria

### Verification Commands
```bash
# 启动 React 示例
cd examples/nextjs && bun dev

# 启动 Vue 示例
cd examples/nuxt-example && bun dev
```

### Final Checklist
- [ ] React WalletTestSuite 展示所有 12 个 Hooks
- [ ] Vue WalletTestSuite 展示所有 16 个 Composables
- [ ] 所有属性都有显示
- [ ] 交互功能正常
