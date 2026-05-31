# 扩展 Examples 展示所有 API

## TL;DR

> **Quick Summary**: 扩展 React 和 Vue 的 WalletTestSuite 组件，展示所有导出的 Hooks/Composables 接口和属性。
>
> **Deliverables**:
> - 更新 React WalletTestSuite，添加 5 个缺失 Hooks 的测试展示
> - 更新 Vue WalletTestSuite，添加缺失 Composables 的测试展示
> - 验证 examples 运行正常
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - React 和 Vue 可并行
> **Critical Path**: React WalletTestSuite → Vue WalletTestSuite → 验证

---

## Context

### Original Request
用户要求："example要展示所有的接口测试以及属性，除了 core"

### Interview Summary
**Key Discussions**:
- 文档更新已完成（19/19 任务）
- 需要扩展 examples 展示所有 React Hooks 和 Vue Composables
- React 包导出 12 个 Hooks，Vue 包导出 16+ 个 Composables
- 当前 WalletTestSuite 只展示了部分 API

**Research Findings**:
- React 缺失 Hooks: useAccount, useAutoConnect, useWalletDetection, useWalletManager, useWalletModalEnhanced
- Vue 缺失 Composables: useAutoConnect, useCore, useWalletDetection, useWalletManager, useWalletEvent 等
- 所有缺失的 Hooks/Composables 都有完整的功能和返回值

### Metis Review
**Identified Gaps** (addressed):
- 需要明确每个 Hook/Composable 的展示方式（测试按钮 + 状态显示）
- 需要确保展示不会破坏现有功能
- 需要考虑 UI 布局，避免界面过于拥挤

---

## Work Objectives

### Core Objective
扩展 WalletTestSuite 组件，展示所有 React Hooks 和 Vue Composables 的接口和属性，让用户能够测试和了解每个 API 的功能。

### Concrete Deliverables
- `examples/nextjs/src/components/WalletTestSuite.tsx` - 添加 5 个缺失 Hooks 的测试
- `examples/nuxt-example/components/WalletTestSuite.vue` - 添加缺失 Composables 的测试
- 验证两个 examples 都能正常运行

### Definition of Done
- [ ] React WalletTestSuite 导入并使用所有 12 个 Hooks
- [ ] Vue WalletTestSuite 导入并使用所有 16+ 个 Composables
- [ ] 每个 Hook/Composable 都有对应的测试按钮或状态显示
- [ ] UI 布局清晰，不会过于拥挤
- [ ] `bun dev` 运行正常，无 TypeScript 错误

### Must Have
- 展示所有导出的 Hooks/Composables（除了 core）
- 每个 API 都有清晰的测试或展示方式
- 保持现有功能不变

### Must NOT Have (Guardrails)
- 不要修改 packages 中的代码实现
- 不要破坏现有的测试功能
- 不要添加不必要的依赖

---

## Verification Strategy (MANDATORY)

### Test Decision
- **Infrastructure exists**: YES (Bun Test)
- **Automated tests**: NO（这是 UI 展示组件，不需要单元测试）
- **Agent-Executed QA**: YES - 运行 dev 服务器并检查 UI

### QA Policy
每个任务包含 agent-executed QA scenarios：
- **Frontend/UI**: 使用 Playwright 打开页面，检查新添加的测试按钮和状态显示
- **TypeScript**: 运行 `bun typecheck` 确保无类型错误
- **Dev Server**: 运行 `bun dev` 确保服务器正常启动

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - React WalletTestSuite):
├── Task 1: 添加缺失 Hooks 导入 [quick]
├── Task 2: 添加 useAccount 测试展示 [quick]
├── Task 3: 添加 useAutoConnect 测试展示 [quick]
├── Task 4: 添加 useWalletDetection 测试展示 [quick]
├── Task 5: 添加 useWalletManager 测试展示 [quick]
└── Task 6: 添加 useWalletModalEnhanced 测试展示 [quick]

Wave 2 (After Wave 1 - Vue WalletTestSuite):
├── Task 7: 添加缺失 Composables 导入 [quick]
├── Task 8: 添加 useAutoConnect 测试展示 [quick]
├── Task 9: 添加 useWalletDetection 测试展示 [quick]
├── Task 10: 添加 useWalletManager 测试展示 [quick]
├── Task 11: 添加 useWalletEvent 测试展示 [quick]
└── Task 12: 添加其他缺失 Composables 展示 [quick]

Wave 3 (After Wave 2 - 验证):
├── Task 13: React example 验证 [quick]
└── Task 14: Vue example 验证 [quick]

Critical Path: Task 1-6 → Task 7-12 → Task 13-14
Parallel Speedup: React 和 Vue 可并行
Max Concurrent: 6 (Wave 1) 或 6 (Wave 2)
```

### Dependency Matrix

- **1-6**: - - 13, 1
- **7-12**: - - 14, 1
- **13**: 1-6 - -
- **14**: 7-12 - -

### Agent Dispatch Summary

- **Wave 1**: **6** - T1-T6 → `quick`
- **Wave 2**: **6** - T7-T12 → `quick`
- **Wave 3**: **2** - T13-T14 → `quick`

---

## TODOs

- [x] 1. 添加缺失 Hooks 导入（React）
...
- [x] 2. 添加 useAccount 测试展示（React）
...
- [x] 3. 添加 useAutoConnect 测试展示（React）
...
- [x] 4. 添加 useWalletDetection 测试展示（React）
...
- [x] 5. 添加 useWalletManager 测试展示（React）
...
- [x] 6. 添加 useWalletModalEnhanced 测试展示（React）

  **What to do**:
  - 在"单项测试"区域添加新的测试按钮："🪟 增强模态框"
  - 展示 useWalletModalEnhanced 的返回值：
    - `isOpen`: 模态框是否打开
    - `openSource`: 打开来源
    - `openCount`: 打开次数
    - `config`: 当前配置
  - 添加控制按钮：
    - "从测试按钮打开" (使用 openWithSource)
    - "强制关闭"
    - "更新配置"（修改 closeOnEscape 等）

  **Must NOT do**:
  - 不要修改 useWalletModalEnhanced 的实现

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 13
  - **Blocked By**: Task 1

  **References**:
  - `packages/react/src/hooks/useWalletModalEnhanced.ts:246-258` - useWalletModalEnhanced 返回值
  - `packages/react/README.md:useWalletModalEnhanced` - 使用示例

  **Acceptance Criteria**:
  - [ ] 新增测试按钮："🪟 增强模态框"
  - [ ] 展示所有状态值
  - [ ] 添加控制按钮
  - [ ] openWithSource 功能正常（显示来源）
  - [ ] 配置更新功能正常

  **QA Scenarios**:
  ```
  Scenario: useWalletModalEnhanced 来源追踪
    Tool: Playwright
    Steps:
      1. 打开页面
      2. 点击 "🪟 增强模态框" 按钮
      3. 点击 "从测试按钮打开" 按钮
      4. 检查 openSource 显示
    Expected Result: openSource 显示为 "test-button"
    Evidence: .sisyphus/evidence/task-6-modal.png
  ```

  **Commit**: YES
  - Message: `feat(react-example): add missing hooks showcase`
  - Files: `examples/nextjs/src/components/WalletTestSuite.tsx`
  - Pre-commit: `cd examples/nextjs && bun typecheck`

---

- [x] 7. 添加缺失 Composables 导入（Vue）
...
- [x] 8. 添加 useAutoConnect 测试展示（Vue）

  **What to do**:
  - 在测试按钮区域添加新的按钮："🔄 自动连接设置"
  - 展示 useAutoConnect 的返回值（与 React 类似）
  - 添加控制按钮（启用/禁用/清除/触发）

  **Must NOT do**:
  - 不要修改 useAutoConnect 的实现

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 14
  - **Blocked By**: Task 7

  **References**:
  - `packages/vue/src/composables/useAutoConnect.ts` - useAutoConnect 实现
  - `packages/vue/README.md` - 使用示例

  **Acceptance Criteria**:
  - [ ] 新增测试按钮："🔄 自动连接设置"
  - [ ] 展示所有状态值
  - [ ] 控制按钮功能正常

  **QA Scenarios**:
  ```
  Scenario: useAutoConnect Vue 测试
    Tool: Playwright
    Steps:
      1. 打开 Nuxt 示例页面
      2. 点击 "🔄 自动连接设置" 按钮
      3. 检查状态显示
    Expected Result: 显示自动连接状态
    Evidence: .sisyphus/evidence/task-8-vue-autoconnect.png
  ```

  **Commit**: NO (groups with Task 12)

---

- [x] 9. 添加 useWalletDetection 测试展示（Vue）
...
- [x] 10. 添加 useWalletManager 测试展示（Vue）
...
- [x] 11. 添加 useWalletEvent 测试展示（Vue）
...
- [x] 12. 添加其他缺失 Composables 展示（Vue）

  **What to do**:
  - 检查还有哪些 Composables 未展示
  - 为每个缺失的 Composable 添加测试按钮或状态显示
  - 确保所有导出的 Composables 都有展示

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 14
  - **Blocked By**: Task 7

  **References**:
  - `packages/vue/src/index.ts` - 所有导出的 Composables 列表
  - `packages/vue/README.md` - API 文档

  **Acceptance Criteria**:
  - [ ] 所有 Composables 都有展示
  - [ ] UI 布局清晰

  **QA Scenarios**:
  ```
  Scenario: Vue Composables 完整性检查
    Tool: Bash + Playwright
    Steps:
      1. 检查 packages/vue/src/index.ts 导出列表
      2. 检查 WalletTestSuite.vue 中使用的 Composables
      3. 对比确认无遗漏
    Expected Result: 所有 Composables 都已展示
    Evidence: .sisyphus/evidence/task-12-vue-complete.txt
  ```

  **Commit**: YES
  - Message: `feat(vue-example): add missing composables showcase`
  - Files: `examples/nuxt-example/components/WalletTestSuite.vue`
  - Pre-commit: `cd examples/nuxt-example && bun typecheck`

---

- [x] 13. React example 验证
...
- [x] 14. Vue example 验证

  **What to do**:
  - 启动 Nuxt 开发服务器
  - 使用 Playwright 打开页面
  - 检查所有新添加的测试按钮
  - 测试每个按钮的功能
  - 截图保存证据

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 13)
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Tasks 7-12

  **References**:
  - `examples/nuxt-example/README.md` - 运行指南

  **Acceptance Criteria**:
  - [ ] `bun dev` 成功启动
  - [ ] 页面正常加载
  - [ ] 所有新按钮可见
  - [ ] 所有新按钮功能正常
  - [ ] 无 TypeScript 错误
  - [ ] 无控制台错误

  **QA Scenarios**:
  ```
  Scenario: Vue example 完整验证
    Tool: Playwright
    Steps:
      1. cd examples/nuxt-example && bun dev
      2. 打开 http://localhost:3000
      3. 依次点击所有新添加的测试按钮
      4. 验证每个按钮的功能
      5. 截图保存
    Expected Result: 所有功能正常，无错误
    Evidence: .sisyphus/evidence/task-14-vue-verify.png
  ```

  **Commit**: NO

---

## Final Verification Wave (MANDATORY)

- [x] F1. **Plan Compliance Audit** — `oracle`
  检查所有 TODO 是否完成，所有 Must Have 是否满足，所有 Must NOT Have 是否遵守。

- [x] F2. **Code Quality Review** — `unspecified-high`
  运行 TypeScript 检查，确保无类型错误。检查代码风格一致性。

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright`)
  启动两个 examples，手动测试所有新添加的功能，截图保存证据。

- [x] F4. **Scope Fidelity Check** — `deep`
  确认只修改了 examples，没有修改 packages 代码。确认所有 Hooks/Composables 都已展示。

---

## Commit Strategy

- **Task 6**: `feat(react-example): add missing hooks showcase` - WalletTestSuite.tsx
- **Task 12**: `feat(vue-example): add missing composables showcase` - WalletTestSuite.vue

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
- [ ] React WalletTestSuite 展示所有 12 个 Hooks
- [ ] Vue WalletTestSuite 展示所有 16+ 个 Composables
- [ ] 两个 examples 都能正常运行
- [ ] 无 TypeScript 错误
- [ ] 无运行时错误
- [ ] UI 布局清晰美观
