# Hook 命名优化计划

## TL;DR

> **Quick Summary**: 简化合并 React hooks，删除未导出的内部实现和 deprecated hooks，合并 useWalletModalEnhanced 到 useWalletModal，保证功能不变。
> 
> **Deliverables**:
> - React hooks 从 12 个减少到 11 个
> - 删除 4 个未导出/deprecated 的 hooks
> - 合并 useWalletModalEnhanced 功能到 useWalletModal
> - 更新 examples 代码
> - 添加测试覆盖
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: 测试 → 删除 → 合并 → 验证

---

## Context

### Original Request
用户要求优化 btc-connect 的 React 和 Vue hooks 命名，简化合并 hooks，保证功能不变，不使用 VueUse。

### Interview Summary
**Key Discussions**:
- React 实际导出 12 个 hooks（不含 deprecated）
- useAddress/usePublicKey/useConnectionStatus 未导出，仅内部实现
- useWalletModalEnhanced 是 useWalletModal 的超集，可合并
- Vue 的 useCore 和 useWalletManagerAdvanced 保留（职责不同）
- 不需要保持向后兼容
- TDD 测试策略

**Research Findings**:
- React hooks 清单：useWallet, useConnectWallet, useNetwork, useWalletModal, useWalletModalEnhanced, useAccount, useBalance, useSignature, useTransactions, useWalletEvent, useWalletManager, useWalletDetection, useAutoConnect, useRefreshAccountInfo (deprecated)
- useWalletModalEnhanced (259行) 提供来源追踪、配置管理、ESC关闭等增强功能
- useWalletModal (64行) 仅提供基础开关功能
- examples 中使用了 useRefreshAccountInfo 和 useWalletModalEnhanced

### Metis Review
**Identified Gaps** (addressed):
- React hooks 清单修正：实际导出 12 个，非 18 个
- useAddress/usePublicKey/useConnectionStatus 未导出，可直接删除
- useWalletModalEnhanced 合并策略：保留 Enhanced 版本的完整功能
- Vue useCore 保留理由：提供更完善的错误处理和性能监控

---

## Work Objectives

### Core Objective
简化 React hooks API，删除冗余代码，合并相似功能，保证功能不变。

### Concrete Deliverables
- 删除 `packages/react/src/hooks/hooks.tsx` 中的 useAddress, usePublicKey, useConnectionStatus 实现
- 删除 `packages/react/src/hooks/useRefreshAccountInfo.ts`
- 合并 `packages/react/src/hooks/useWalletModalEnhanced.ts` 到 `packages/react/src/hooks/useWalletModal.ts`
- 更新 `packages/react/src/index.ts` 导出
- 更新 `examples/nextjs/src/components/WalletTestSuite.tsx`
- 添加测试文件 `packages/react/src/hooks/__tests__/`

### Definition of Done
- [ ] `bun test packages/react` 全部通过
- [ ] `bun run typecheck` 无错误
- [ ] `cd examples/nextjs && bun run build` 成功
- [ ] examples 运行正常，功能验证通过

### Must Have
- 删除未导出的内部 hooks 实现
- 删除 deprecated 的 useRefreshAccountInfo
- 合并 useWalletModalEnhanced 到 useWalletModal
- 保留所有增强功能（来源追踪、配置管理等）
- 添加测试覆盖

### Must NOT Have (Guardrails)
- 不修改 Vue composables
- 不删除 useCore, useWalletManagerAdvanced
- 不导出 useDebounce/useThrottle
- 不破坏 useWallet 的现有功能
- 不在没有测试的情况下删除代码

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: TDD
- **Framework**: bun test
- **TDD**: Each task follows RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) - Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: Use interactive_bash (tmux) - Run command, send keystrokes, validate output
- **API/Backend**: Use Bash (curl) - Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) - Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - 测试覆盖):
├── Task 1: 为 useWalletModal 编写测试 [quick]
├── Task 2: 为 useWalletModalEnhanced 编写测试 [quick]
├── Task 3: 为 useAccount 编写测试 [quick]
└── Task 4: 为 useBalance 编写测试 [quick]

Wave 2 (After Wave 1 - 删除未使用代码):
├── Task 5: 删除 useAddress/usePublicKey/useConnectionStatus 实现 [quick]
├── Task 6: 删除 useRefreshAccountInfo 并更新 examples [quick]
└── Task 7: 更新 React 包导出 [quick]

Wave 3 (After Wave 2 - 合并 hooks):
├── Task 8: 合并 useWalletModalEnhanced 到 useWalletModal [unspecified-high]
├── Task 9: 更新 examples 使用新的 useWalletModal [quick]
└── Task 10: 更新测试以匹配新的 API [quick]

Wave FINAL (After ALL tasks — 验证):
├── Task F1: 运行所有测试 [quick]
├── Task F2: 类型检查 [quick]
├── Task F3: Examples 构建验证 [quick]
└── Task F4: 功能验证 [unspecified-high]
```

### Dependency Matrix

- **1-4**: - - 5-7, 1
- **5-7**: 1-4 - 8-10, 2
- **8**: 5-7 - 9-10, 3
- **9-10**: 8 - F1-F4, 4

### Agent Dispatch Summary

- **1**: **4** - T1-T4 → `quick`
- **2**: **3** - T5-T7 → `quick`
- **3**: **3** - T8 → `unspecified-high`, T9-T10 → `quick`
- **FINAL**: **4** - F1-F3 → `quick`, F4 → `unspecified-high`

---

## TODOs

- [x] 1. 为 useWalletModal 编写测试

  **What to do**:
  - 创建 `packages/react/src/hooks/__tests__/useWalletModal.test.ts`
  - 测试基础功能：open(), close(), toggle()
  - 测试状态管理：isModalOpen
  - 使用 @testing-library/react-hooks 的 renderHook

  **Must NOT do**:
  - 不测试实现细节
  - 不测试外部依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单一测试文件，明确的测试目标
  - **Skills**: [`vitest`]
    - `vitest`: Bun test 兼容 Vitest API

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 5-7
  - **Blocked By**: None

  **References**:
  - `packages/react/src/hooks/useWalletModal.ts` - 当前实现
  - `packages/react/src/hooks/useWalletModalEnhanced.ts` - Enhanced 版本参考

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] `bun test packages/react/src/hooks/__tests__/useWalletModal.test.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: useWalletModal 基础功能测试
    Tool: Bash (bun test)
    Preconditions: 测试文件已创建
    Steps:
      1. bun test packages/react/src/hooks/__tests__/useWalletModal.test.ts
      2. Assert: all tests pass
    Expected Result: 0 failures
    Evidence: .sisyphus/evidence/task-01-test-output.txt
  ```

  **Commit**: NO

---

- [x] 2. 为 useWalletModalEnhanced 编写测试

  **What to do**:
  - 创建 `packages/react/src/hooks/__tests__/useWalletModalEnhanced.test.ts`
  - 测试增强功能：openWithSource(), forceClose()
  - 测试配置管理：config, setConfig()
  - 测试来源追踪：openSource, openCount

  **Must NOT do**:
  - 不测试实现细节
  - 不测试外部依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单一测试文件，明确的测试目标
  - **Skills**: [`vitest`]
    - `vitest`: Bun test 兼容 Vitest API

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 8
  - **Blocked By**: None

  **References**:
  - `packages/react/src/hooks/useWalletModalEnhanced.ts:1-259` - 完整实现

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] `bun test packages/react/src/hooks/__tests__/useWalletModalEnhanced.test.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: useWalletModalEnhanced 增强功能测试
    Tool: Bash (bun test)
    Preconditions: 测试文件已创建
    Steps:
      1. bun test packages/react/src/hooks/__tests__/useWalletModalEnhanced.test.ts
      2. Assert: all tests pass
    Expected Result: 0 failures
    Evidence: .sisyphus/evidence/task-02-test-output.txt
  ```

  **Commit**: NO

---

- [x] 3. 为 useAccount 编写测试

  **What to do**:
  - 创建 `packages/react/src/hooks/__tests__/useAccount.test.ts`
  - 测试返回值：address, publicKey, accounts
  - 测试状态：hasAccounts, hasPublicKey

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单一测试文件
  - **Skills**: [`vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `packages/react/src/hooks/hooks.tsx:247-291` - useAccount 实现

  **Acceptance Criteria**:
  - [ ] `bun test packages/react/src/hooks/__tests__/useAccount.test.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: useAccount 功能测试
    Tool: Bash (bun test)
    Steps:
      1. bun test packages/react/src/hooks/__tests__/useAccount.test.ts
    Expected Result: 0 failures
    Evidence: .sisyphus/evidence/task-03-test-output.txt
  ```

  **Commit**: NO

---

- [x] 4. 为 useBalance 编写测试

  **What to do**:
  - 创建 `packages/react/src/hooks/__tests__/useBalance.test.ts`
  - 测试返回值：balance, isLoading, refreshBalance()
  - 测试余额类型：confirmedBalance, unconfirmedBalance

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `packages/react/src/hooks/hooks.tsx:293-347` - useBalance 实现

  **Acceptance Criteria**:
  - [ ] `bun test packages/react/src/hooks/__tests__/useBalance.test.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: useBalance 功能测试
    Tool: Bash (bun test)
    Steps:
      1. bun test packages/react/src/hooks/__tests__/useBalance.test.ts
    Expected Result: 0 failures
    Evidence: .sisyphus/evidence/task-04-test-output.txt
  ```

  **Commit**: NO


---

- [x] 5. 删除 useAddress/usePublicKey/useConnectionStatus 实现

  **What to do**:
  - 从 `packages/react/src/hooks/hooks.tsx` 删除 useAddress 函数（529-556行）
  - 从 `packages/react/src/hooks/hooks.tsx` 删除 usePublicKey 函数（558-580行）
  - 从 `packages/react/src/hooks/hooks.tsx` 删除 useConnectionStatus 函数（582-625行）

  **Must NOT do**:
  - 不删除其他 hooks
  - 不修改导出（这些 hooks 未导出）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1-4

  **References**:
  - `packages/react/src/hooks/hooks.tsx:529-625`
  - `packages/react/src/index.ts`

  **Acceptance Criteria**:
  - [ ] useAddress 函数已删除
  - [ ] usePublicKey 函数已删除
  - [ ] useConnectionStatus 函数已删除
  - [ ] `bun run typecheck` → PASS

  **QA Scenarios**:
  ```
  Scenario: 删除后类型检查
    Tool: Bash (tsc)
    Steps:
      1. cd packages/react && bun run typecheck
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/task-05-typecheck.txt
  ```

  **Commit**: NO

---

- [x] 6. 删除 useRefreshAccountInfo 并更新 examples

  **What to do**:
  - 删除 `packages/react/src/hooks/useRefreshAccountInfo.ts`
  - 从 `packages/react/src/index.ts` 移除导出
  - 更新 `examples/nextjs/src/components/WalletTestSuite.tsx`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7)
  - **Blocks**: Task 9
  - **Blocked By**: Task 1-4

  **References**:
  - `packages/react/src/hooks/useRefreshAccountInfo.ts`
  - `examples/nextjs/src/components/WalletTestSuite.tsx:20`

  **Acceptance Criteria**:
  - [ ] 文件已删除
  - [ ] 导出已移除
  - [ ] examples 已更新
  - [ ] `cd examples/nextjs && bun run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: examples 构建验证
    Tool: Bash (build)
    Steps:
      1. cd examples/nextjs && bun run build
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-06-build.txt
  ```

  **Commit**: NO

---

- [x] 7. 更新 React 包导出

  **What to do**:
  - 从 `packages/react/src/index.ts` 移除 `useRefreshAccountInfo` 导出
  - 从 `packages/react/src/index.ts` 移除 `useWalletModalEnhanced` 导出

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1-4

  **References**:
  - `packages/react/src/index.ts`

  **Acceptance Criteria**:
  - [ ] useRefreshAccountInfo 导出已移除
  - [ ] useWalletModalEnhanced 导出已移除
  - [ ] `bun run typecheck` → PASS

  **QA Scenarios**:
  ```
  Scenario: 导出验证
    Tool: Bash (typecheck)
    Steps:
      1. cd packages/react && bun run typecheck
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/task-07-typecheck.txt
  ```

  **Commit**: NO

---

- [x] 8. 合并 useWalletModalEnhanced 到 useWalletModal

  **What to do**:
  - 将 `useWalletModalEnhanced.ts` 的实现合并到 `useWalletModal.ts`
  - 保留所有增强功能：openWithSource, forceClose, config, openSource, openCount
  - 删除 `useWalletModalEnhanced.ts` 文件

  **Must NOT do**:
  - 不丢失任何增强功能

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 9-10
  - **Blocked By**: Task 5-7

  **References**:
  - `packages/react/src/hooks/useWalletModal.ts`
  - `packages/react/src/hooks/useWalletModalEnhanced.ts`
  - `packages/react/src/hooks/__tests__/useWalletModal.test.ts`

  **Acceptance Criteria**:
  - [ ] useWalletModal.ts 包含所有增强功能
  - [ ] useWalletModalEnhanced.ts 已删除
  - [ ] `bun test packages/react/src/hooks/__tests__/useWalletModal.test.ts` → PASS

  **QA Scenarios**:
  ```
  Scenario: 合并后功能验证
    Tool: Bash (bun test)
    Steps:
      1. bun test packages/react/src/hooks/__tests__/useWalletModal.test.ts
    Expected Result: 0 failures
    Evidence: .sisyphus/evidence/task-08-merge-test.txt
  ```

  **Commit**: NO

---

- [x] 9. 更新 examples 使用新的 useWalletModal

  **What to do**:
  - 更新 `examples/nextjs/src/components/WalletTestSuite.tsx`
  - 移除 `useWalletModalEnhanced` import
  - 使用 `useWalletModal` 替代

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 10)
  - **Blocks**: Task F1-F4
  - **Blocked By**: Task 8

  **References**:
  - `examples/nextjs/src/components/WalletTestSuite.tsx`
  - `packages/react/src/hooks/useWalletModal.ts`

  **Acceptance Criteria**:
  - [ ] examples 已更新
  - [ ] `cd examples/nextjs && bun run build` → PASS

  **QA Scenarios**:
  ```
  Scenario: examples 构建验证
    Tool: Bash (build)
    Steps:
      1. cd examples/nextjs && bun run build
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/task-09-build.txt
  ```

  **Commit**: NO

---

- [x] 10. 更新测试以匹配新的 API

  **What to do**:
  - 合并 `useWalletModalEnhanced.test.ts` 的测试到 `useWalletModal.test.ts`
  - 删除 `useWalletModalEnhanced.test.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Task 9)
  - **Blocks**: Task F1-F4
  - **Blocked By**: Task 8

  **References**:
  - `packages/react/src/hooks/__tests__/useWalletModal.test.ts`
  - `packages/react/src/hooks/__tests__/useWalletModalEnhanced.test.ts`

  **Acceptance Criteria**:
  - [ ] 测试已合并
  - [ ] `bun test packages/react/src/hooks/__tests__/` → PASS

  **QA Scenarios**:
  ```
  Scenario: 测试验证
    Tool: Bash (bun test)
    Steps:
      1. bun test packages/react/src/hooks/__tests__/
    Expected Result: 0 failures
    Evidence: .sisyphus/evidence/task-10-test.txt
  ```

  **Commit**: NO

---

## Final Verification Wave (MANDATORY)

- [x] F1. 运行所有测试

  **What to do**:
  - 运行 `bun test packages/react`
  - 确认所有测试通过

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vitest`]

  **QA Scenarios**:
  ```
  Scenario: 全量测试
    Tool: Bash (bun test)
    Steps:
      1. bun test packages/react
    Expected Result: 0 failures
    Evidence: .sisyphus/evidence/final-01-all-tests.txt
  ```

---

- [x] F2. 类型检查

  **What to do**:
  - 运行 `bun run typecheck`
  - 确认无类型错误

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **QA Scenarios**:
  ```
  Scenario: 类型检查
    Tool: Bash (tsc)
    Steps:
      1. bun run typecheck
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/final-02-typecheck.txt
  ```

---

- [x] F3. Examples 构建验证

  **What to do**:
  - 构建 Next.js example
  - 确认构建成功

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **QA Scenarios**:
  ```
  Scenario: Examples 构建
    Tool: Bash (build)
    Steps:
      1. cd examples/nextjs && bun run build
    Expected Result: exit code 0
    Evidence: .sisyphus/evidence/final-03-examples-build.txt
  ```

---

- [x] F4. 功能验证

  **What to do**:
  - 启动 Next.js example dev server
  - 验证钱包连接功能正常
  - 验证模态框功能正常

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`playwright`]

  **QA Scenarios**:
  ```
  Scenario: 功能验证
    Tool: Playwright
    Steps:
      1. cd examples/nextjs && bun dev
      2. Navigate to http://localhost:3000
      3. Click "Connect Wallet" button
      4. Assert: modal opens
      5. Click close button
      6. Assert: modal closes
    Expected Result: All interactions work
    Evidence: .sisyphus/evidence/final-04-functional-test.png
  ```

---

## Commit Strategy

- **All tasks**: 单次提交
- **Message**: `refactor(react): simplify hooks - merge useWalletModalEnhanced, remove deprecated hooks`
- **Files**: 
  - `packages/react/src/hooks/hooks.tsx`
  - `packages/react/src/hooks/useWalletModal.ts`
  - `packages/react/src/hooks/useWalletModalEnhanced.ts` (deleted)
  - `packages/react/src/hooks/useRefreshAccountInfo.ts` (deleted)
  - `packages/react/src/index.ts`
  - `examples/nextjs/src/components/WalletTestSuite.tsx`
- **Pre-commit**: `bun test packages/react && bun run typecheck`

---

## Success Criteria

### Verification Commands
```bash
bun test packages/react        # Expected: all tests pass
bun run typecheck              # Expected: 0 errors
cd examples/nextjs && bun run build  # Expected: build success
```

### Final Checklist
- [ ] All tests pass
- [ ] Type check passes
- [ ] Examples build successfully
- [ ] useWalletModalEnhanced removed
- [ ] useRefreshAccountInfo removed
- [ ] useAddress/usePublicKey/useConnectionStatus removed
- [ ] All enhanced features preserved in useWalletModal
- [ ] Examples updated and working
