# Examples API 更新计划

## TL;DR

> **Quick Summary**: 更新 examples 目录中的测试代码，移除已弃用的 API，使用最新的统一 API，并创建新的纯 React 示例。
> 
> **Deliverables**:
> - 更新 Next.js example 的 API 使用
> - 更新 Nuxt example 的 TypeScript 版本和 API 使用
> - 创建新的 React example
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Next.js 更新 → Nuxt 更新 → React example 创建

---

## Context

### Original Request
用户要求「根据新的各个packages,重新修改examples里面的测试库」

### Interview Summary
**Key Discussions**:
- 发现 `useRefreshAccountInfo` 在 React 包中已标记为弃用
- 确认 Vue 包中的 `useWalletInfo` 和 `useCore` 仍然存在
- 确认 `useWallet` 提供完整的统一 API

**Research Findings**:
- React: `refreshAccountInfo` 在 context 中通过 `fetchAccountDetails` 实现
- Vue: 所有导出的 composables 都存在，无需移除
- TypeScript 版本：Next.js 已是 `~5.8.3`，Nuxt 需要更新

### Metis Review
**Identified Gaps** (addressed):
- 需要确认是否保留向后兼容的 API 调用
- 需要确认 React example 的目录结构

---

## Work Objectives

### Core Objective
更新 examples 目录中的测试代码，使其使用最新的 API，同时保持向后兼容。

### Concrete Deliverables
- `examples/nextjs/src/components/WalletTestSuite.tsx` - 移除弃用 API
- `examples/nuxt-example/package.json` - 更新 TypeScript 版本
- `examples/nuxt-example/components/WalletTestSuite.vue` - 简化 API 使用
- `examples/react/` - 新建纯 React 示例

### Definition of Done
- [ ] Next.js example 不使用已弃用的 API
- [ ] Nuxt example TypeScript 版本更新到 `~5.8.3`
- [ ] React example 创建完成并可运行
- [ ] 所有 examples 可以正常构建

### Must Have
- 移除 `useRefreshAccountInfo` 的使用（React）
- 更新 TypeScript 版本（Nuxt）
- 创建 React example

### Must NOT Have (Guardrails)
- 不修改 packages 代码
- 不添加新功能
- 不破坏现有功能

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Bun Test)
- **Automated tests**: None (examples 更新不需要测试)
- **Framework**: bun test
- **Agent-Executed QA**: ALWAYS

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - 更新现有 examples):
├── Task 1: 更新 Next.js example [quick]
└── Task 2: 更新 Nuxt example [quick]

Wave 2 (After Wave 1 - 创建 React example):
├── Task 3: 创建 React example 目录结构 [quick]
├── Task 4: 创建 React example 组件 [quick]
└── Task 5: 配置 React example 构建 [quick]

Wave FINAL (After ALL tasks — 验证):
├── Task F1: 验证 Next.js example 构建 [quick]
├── Task F2: 验证 Nuxt example 构建 [quick]
└── Task F3: 验证 React example 构建 [quick]
```

---

## TODOs

- [x] 1. 更新 Next.js example

  **What to do**:
  - 移除 `useRefreshAccountInfo` 导入和使用
  - 使用 `useWallet` 提供的 `manager` 来刷新账户信息
  - 用户选择：完全移除使用

  **Must NOT do**:
  - 修改 packages 代码
  - 添加新功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的代码更新任务
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `vue`: 不相关，这是 React 项目

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **References**:
  - `packages/react/src/hooks/hooks.tsx:useRefreshAccountInfo` - 弃用的 hook 实现
  - `packages/react/src/context/provider.tsx:fetchAccountDetails` - refreshAccountInfo 的实际实现

  **Acceptance Criteria**:
  - [ ] `useRefreshAccountInfo` 不再被导入
  - [ ] 代码可以正常构建

  **QA Scenarios**:
  ```
  Scenario: Next.js example 构建成功
    Tool: Bash
    Steps:
      1. cd examples/nextjs && bun install
      2. bun run build
    Expected Result: 构建成功，无错误
    Evidence: .sisyphus/evidence/task-1-build.txt
  ```

  **Commit**: YES
  - Message: `refactor(nextjs): remove deprecated useRefreshAccountInfo`
  - Files: `examples/nextjs/src/components/WalletTestSuite.tsx`

- [x] 2. 更新 Nuxt example

  **What to do**:
  - 更新 TypeScript 版本到 `~5.8.3`
  - 简化代码，使用 `useWallet` 统一 API
  - 移除不必要的 API 导入

  **Must NOT do**:
  - 修改 packages 代码
  - 破坏现有功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的配置和代码更新
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `react`: 不相关，这是 Vue 项目

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task F2
  - **Blocked By**: None

  **References**:
  - `packages/vue/src/composables/useWallet.ts` - 统一 API
  - `packages/vue/src/index.ts` - 导出的 composables

  **Acceptance Criteria**:
  - [ ] TypeScript 版本更新到 `~5.8.3`
  - [ ] 代码可以正常构建

  **QA Scenarios**:
  ```
  Scenario: Nuxt example 构建成功
    Tool: Bash
    Steps:
      1. cd examples/nuxt-example && bun install
      2. bun run build
    Expected Result: 构建成功，无错误
    Evidence: .sisyphus/evidence/task-2-build.txt
  ```

  **Commit**: YES
  - Message: `refactor(nuxt): update TypeScript and simplify API usage`
  - Files: `examples/nuxt-example/package.json`, `examples/nuxt-example/components/WalletTestSuite.vue`

- [x] 3. 创建 React example 目录结构

  **What to do**:
  - 创建 `examples/react/` 目录
  - 创建 `package.json`
  - 创建 `vite.config.ts`
  - 创建 `tsconfig.json`
  - 创建 `index.html`
  - 创建 `src/main.tsx`
  - 创建 `src/App.tsx`

  **Must NOT do**:
  - 复制 Next.js 的 SSR 相关代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的目录和文件创建
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 4, Task 5)
  - **Blocks**: Task F3
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `examples/nextjs/package.json` - 参考依赖配置
  - `packages/react/src/hooks/hooks.tsx` - API 使用示例

  **Acceptance Criteria**:
  - [ ] 目录结构创建完成
  - [ ] 配置文件正确

  **QA Scenarios**:
  ```
  Scenario: React example 目录结构正确
    Tool: Bash
    Steps:
      1. ls -la examples/react/
    Expected Result: 所有必需文件存在
    Evidence: .sisyphus/evidence/task-3-structure.txt
  ```

  **Commit**: NO

- [x] 4. 创建 React example 组件

  **What to do**:
  - 创建 `src/components/WalletTestSuite.tsx`
  - 基于 Next.js example，但移除 SSR 相关代码
  - 使用最新 API

  **Must NOT do**:
  - 使用已弃用的 API
  - 添加 SSR 相关代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的组件创建
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3, Task 5)
  - **Blocks**: Task F3
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `examples/nextjs/src/components/WalletTestSuite.tsx` - 参考实现
  - `packages/react/src/hooks/hooks.tsx:useWallet` - 统一 API

  **Acceptance Criteria**:
  - [ ] 组件创建完成
  - [ ] 使用最新 API

  **QA Scenarios**:
  ```
  Scenario: React example 组件正确
    Tool: Bash
    Steps:
      1. cat examples/react/src/components/WalletTestSuite.tsx
    Expected Result: 文件存在，内容正确
    Evidence: .sisyphus/evidence/task-4-component.txt
  ```

  **Commit**: NO

- [x] 5. 配置 React example 构建

  **What to do**:
  - 配置 Vite 构建
  - 配置 TypeScript
  - 确保可以正常构建

  **Must NOT do**:
  - 修改 packages 代码

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的配置任务
  - **Skills**: [`vite`]
    - `vite`: Vite 配置需要

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Task 3, Task 4)
  - **Blocks**: Task F3
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `packages/react/vite.config.ts` - 参考 Vite 配置

  **Acceptance Criteria**:
  - [ ] Vite 配置正确
  - [ ] TypeScript 配置正确

  **QA Scenarios**:
  ```
  Scenario: React example 配置正确
    Tool: Bash
    Steps:
      1. cd examples/react && bun install
      2. bun run build
    Expected Result: 构建成功
    Evidence: .sisyphus/evidence/task-5-config.txt
  ```

  **Commit**: YES
  - Message: `feat(react-example): create pure React example`
  - Files: `examples/react/`

---

## Final Verification Wave (MANDATORY)

- [x] F1. 验证 Next.js example 构建

  **What to do**:
  - 运行 `bun run build` 验证构建成功

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **QA Scenarios**:
  ```
  Scenario: Next.js example 构建验证
    Tool: Bash
    Steps:
      1. cd examples/nextjs && bun run build
    Expected Result: 构建成功
    Evidence: .sisyphus/evidence/f1-nextjs-build.txt
  ```

- [x] F2. 验证 Nuxt example 构建

  **What to do**:
  - 运行 `bun run build` 验证构建成功

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **QA Scenarios**:
  ```
  Scenario: Nuxt example 构建验证
    Tool: Bash
    Steps:
      1. cd examples/nuxt-example && bun run build
    Expected Result: 构建成功
    Evidence: .sisyphus/evidence/f2-nuxt-build.txt
  ```

- [x] F3. 验证 React example 构建

  **What to do**:
  - 运行 `bun run build` 验证构建成功

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **QA Scenarios**:
  ```
  Scenario: React example 构建验证
    Tool: Bash
    Steps:
      1. cd examples/react && bun run build
    Expected Result: 构建成功
    Evidence: .sisyphus/evidence/f3-react-build.txt
  ```

---

## Commit Strategy

- **1**: `refactor(nextjs): remove deprecated useRefreshAccountInfo` - examples/nextjs/src/components/WalletTestSuite.tsx
- **2**: `refactor(nuxt): update TypeScript and simplify API usage` - examples/nuxt-example/
- **5**: `feat(react-example): create pure React example` - examples/react/

---

## Success Criteria

### Verification Commands
```bash
cd examples/nextjs && bun run build  # Expected: 构建成功
cd examples/nuxt-example && bun run build  # Expected: 构建成功
cd examples/react && bun run build  # Expected: 构建成功
```

### Final Checklist
- [ ] Next.js example 不使用已弃用的 API
- [ ] Nuxt example TypeScript 版本更新
- [ ] React example 创建完成
- [ ] 所有 examples 可以正常构建
