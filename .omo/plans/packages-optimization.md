# BTC Connect Packages 全面优化计划

## TL;DR

> **Quick Summary**: 统一依赖版本、补充 Vue 测试、启用严格模式、统一构建配置、添加 CJS 支持，提升代码质量和维护性。
> 
> **Deliverables**:
> - 统一的依赖版本配置
> - Vue 包完整测试覆盖（40+ 测试用例）
> - 所有包启用 TypeScript 严格模式
> - 统一的 Vite 构建配置
> - ESM/CJS 双格式支持
> - 清理测试日志输出

> **Estimated Effort**: Large
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: 依赖统一 → 构建配置 → 测试补充 → 验证

---

## Context

### Original Request
用户要求检查所有 packages 并给出优化建议，然后执行所有优化项。

### Interview Summary
**Key Discussions**:
- 发现依赖版本不一致问题（TypeScript, @btc-connect/core）
- Vue 包测试覆盖严重不足（11 vs 56 React）
- Vue tsconfig 严格模式关闭
- 构建配置不统一（Bun Build vs Vite）
- 缺少 CJS 格式支持

**Research Findings**:
- Core: 26 tests, ~3,500 LOC, 类型检查通过
- React: 56 tests, ~4,800 LOC, 类型检查通过
- Vue: 11 tests, ~8,200 LOC, 类型检查通过但严格模式关闭

### Metis Review
**Identified Gaps** (addressed):
- 需要确保 Vue 测试覆盖所有核心 composables
- 构建迁移需要保持向后兼容
- 依赖更新需要同步 peerDependencies

---

## Work Objectives

### Core Objective
全面优化 btc-connect monorepo 的三个核心包，提升代码质量、测试覆盖、构建一致性和依赖管理。

### Concrete Deliverables
- 统一的 package.json 依赖版本
- Vue 包 40+ 测试用例
- 所有包 TypeScript 严格模式
- Core 包 Vite 构建配置
- ESM/CJS 双格式输出
- 清理测试日志

### Definition of Done
- [ ] `bun run typecheck` 在所有包通过
- [ ] `bun test` 在所有包通过，Vue 包 40+ 测试
- [ ] `bun run build` 生成 ESM + CJS 格式
- [ ] 依赖版本一致

### Must Have
- 依赖版本统一
- Vue 测试覆盖核心 composables
- TypeScript 严格模式
- 构建产物兼容性

### Must NOT Have (Guardrails)
- 不破坏现有 API
- 不引入新的外部运行时依赖到 core
- 不在 core 中引入框架特定代码
- 不跳过任何类型检查

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Bun Test)
- **Automated tests**: YES (Tests-after)
- **Framework**: Bun Test
- **Coverage target**: Vue 包 40+ 测试

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - 依赖统一 + 配置修复):
├── Task 1: 统一 TypeScript 版本 [quick]
├── Task 2: 统一 @btc-connect/core 依赖版本 [quick]
├── Task 3: 启用 Vue tsconfig 严格模式 [quick]
├── Task 4: 清理测试日志输出 [quick]
└── Task 5: 更新根目录 scripts [quick]

Wave 2 (After Wave 1 - Core 构建迁移):
├── Task 6: 创建 Core Vite 配置 [quick]
├── Task 7: 更新 Core package.json 构建脚本 [quick]
├── Task 8: 添加 ESM/CJS 双格式支持 [quick]
└── Task 9: 验证 Core 构建产物 [quick]

Wave 3 (After Wave 2 - Vue 测试补充):
├── Task 10: useWallet 测试 [unspecified-high]
├── Task 11: useWalletEvent 测试 [unspecified-high]
├── Task 12: useWalletModal 测试 [unspecified-high]
├── Task 13: useNetwork 测试 [quick]
└── Task 14: useTheme 测试 [quick]

Wave 4 (After Wave 3 - Vue 组件测试):
├── Task 15: ConnectButton 组件测试 [unspecified-high]
├── Task 16: WalletModal 组件测试 [unspecified-high]
├── Task 17: BTCWalletPlugin 测试 [unspecified-high]
└── Task 18: 集成测试 [unspecified-high]

Wave FINAL (After ALL tasks — 验证):
├── Task F1: 全量类型检查 [quick]
├── Task F2: 全量测试运行 [quick]
├── Task F3: 构建验证 [quick]
└── Task F4: 依赖一致性检查 [quick]
-> Present results -> Get explicit user okay
```

### Dependency Matrix

- **1-5**: - - 6-9, 10-18
- **6-9**: 1-5 - F1-F4
- **10-14**: 1-5 - 15-18
- **15-18**: 10-14 - F1-F4
- **F1-F4**: 6-9, 15-18 - user okay

---

## TODOs

### Wave 1: 依赖统一 + 配置修复

- [x] 1. 统一 TypeScript 版本

  **What to do**:
  - 更新 packages/core/package.json: `"typescript": "^5.8.3"`
  - 保持 packages/react 和 packages/vue 的 `"typescript": "~5.8.3"`
  - 更新根目录 package.json: `"typescript": "^5.8.3"`

  **Must NOT do**:
  - 不要使用 workspace:* 协议（TypeScript 不支持）

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2-5)
  - **Blocks**: Tasks 6-9
  - **Blocked By**: None

  **References**:
  - `packages/core/package.json:35` - 当前 TypeScript 版本
  - `packages/react/package.json:43` - 当前 TypeScript 版本
  - `packages/vue/package.json:49` - 当前 TypeScript 版本

  **Acceptance Criteria**:
  - [ ] 所有 package.json 的 TypeScript 版本为 ^5.8.3 或 ~5.8.3
  - [ ] `bun install` 成功执行

  **QA Scenarios**:
  ```
  Scenario: TypeScript 版本统一
    Tool: Bash
    Steps:
      1. grep '"typescript"' packages/*/package.json
      2. 验证所有版本为 ^5.8.3 或 ~5.8.3
    Expected Result: 三个包版本一致
    Evidence: .sisyphus/evidence/task-01-typescript-version.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 2. 统一 @btc-connect/core 依赖版本

  **What to do**:
  - 更新 packages/react/package.json:
    - devDependencies: `"@btc-connect/core": "workspace:*"`
    - peerDependencies: `"@btc-connect/core": "^0.5.0"`
  - 更新 packages/vue/package.json:
    - devDependencies: `"@btc-connect/core": "workspace:*"`
    - peerDependencies: `"@btc-connect/core": "^0.5.0"`

  **Must NOT do**:
  - 不要使用过时的 ^0.3.4 版本

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3-5)
  - **Blocks**: Tasks 6-9
  - **Blocked By**: None

  **References**:
  - `packages/react/package.json:35,50` - 当前 core 依赖
  - `packages/vue/package.json:45,56` - 当前 core 依赖

  **Acceptance Criteria**:
  - [ ] devDependencies 使用 workspace:*
  - [ ] peerDependencies 使用 ^0.5.0
  - [ ] `bun install` 成功执行

  **QA Scenarios**:
  ```
  Scenario: Core 依赖版本统一
    Tool: Bash
    Steps:
      1. grep '@btc-connect/core' packages/*/package.json
      2. 验证 devDependencies 为 workspace:*
      3. 验证 peerDependencies 为 ^0.5.0
    Expected Result: 版本一致且正确
    Evidence: .sisyphus/evidence/task-02-core-deps.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 3. 启用 Vue tsconfig 严格模式

  **What to do**:
  - 编辑 packages/vue/tsconfig.app.json:
    ```json
    {
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true
    }
    ```
  - 运行 `cd packages/vue && bun run typecheck` 验证
  - 修复任何类型错误（如果有）

  **Must NOT do**:
  - 不要跳过类型错误修复

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-2, 4-5)
  - **Blocks**: Tasks 10-18
  - **Blocked By**: None

  **References**:
  - `packages/vue/tsconfig.app.json:13-15` - 当前严格模式设置
  - `packages/core/tsconfig.json:6` - 参考严格模式配置

  **Acceptance Criteria**:
  - [ ] strict: true
  - [ ] noUnusedLocals: true
  - [ ] noUnusedParameters: true
  - [ ] `bun run typecheck` 通过

  **QA Scenarios**:
  ```
  Scenario: Vue 严格模式启用
    Tool: Bash
    Steps:
      1. cd packages/vue && bun run typecheck
    Expected Result: 类型检查通过，无错误
    Evidence: .sisyphus/evidence/task-03-strict-mode.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 4. 清理测试日志输出

  **What to do**:
  - 检查 packages/react/src/__tests__/ 中的 console.log
  - 移除或条件化 debug 日志：
    - `=== getAvailableWallets Debug ===`
    - `[BTC-Connect:Core] Initializing adapters...`
  - 添加测试环境检测：`if (process.env.NODE_ENV !== 'test')`

  **Must NOT do**:
  - 不要移除必要的错误日志

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-3, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `packages/react/src/__tests__/index.test.tsx` - 包含 debug 日志

  **Acceptance Criteria**:
  - [ ] 测试运行时不输出 debug 日志
  - [ ] 测试仍然通过

  **QA Scenarios**:
  ```
  Scenario: 测试日志清理
    Tool: Bash
    Steps:
      1. cd packages/react && bun test 2>&1 | grep -c "Debug"
    Expected Result: 输出为 0（无 debug 日志）
    Evidence: .sisyphus/evidence/task-04-test-logs.txt
  ```

  **Commit**: NO (groups with Wave 1)

- [x] 5. 更新根目录 scripts

  **What to do**:
  - 更新根目录 package.json scripts 使用统一的过滤语法：
    ```json
    {
      "build": "bun run --filter './packages/*' build",
      "lint": "bun run --filter './packages/*' lint",
      "format": "bun run --filter './packages/*' format",
      "typecheck": "bun run --filter './packages/*' typecheck"
    }
    ```

  **Must NOT do**:
  - 不要硬编码包名

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1-4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `package.json:10-15` - 当前 scripts

  **Acceptance Criteria**:
  - [ ] scripts 使用通配符过滤
  - [ ] `bun run build` 正确执行所有包

  **QA Scenarios**:
  ```
  Scenario: 根 scripts 更新
    Tool: Bash
    Steps:
      1. bun run typecheck
    Expected Result: 所有包类型检查通过
    Evidence: .sisyphus/evidence/task-05-root-scripts.txt
  ```

  **Commit**: YES
  - Message: `chore(deps): unify dependency versions and enable strict mode`
  - Files: `package.json, packages/*/package.json, packages/vue/tsconfig.app.json`

---

### Wave 2: Core 构建迁移

- [x] 6. 创建 Core Vite 配置

  **What to do**:
  - 创建 packages/core/vite.config.ts：
    ```typescript
    import { resolve } from 'node:path';
    import { defineConfig } from 'vite';
    import dts from 'vite-plugin-dts';

    export default defineConfig({
      plugins: [
        dts({
          insertTypesEntry: true,
          rollupTypes: false,
          exclude: ['**/*.test.*', '**/*.spec.*'],
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'BTCConnectCore',
          fileName: 'index',
          formats: ['es', 'cjs'],
        },
        rollupOptions: {
          external: [/^node:.*/],
        },
        minify: 'esbuild',
        target: 'es2019',
        sourcemap: false,
      },
    });
    ```

  **Must NOT do**:
  - 不要引入外部运行时依赖

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vite`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7-9)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/react/vite.config.ts` - 参考 Vite 配置
  - `packages/vue/vite.config.ts` - 参考 Vite 配置
  - `packages/core/build.js` - 当前构建配置

  **Acceptance Criteria**:
  - [ ] vite.config.ts 文件创建
  - [ ] 配置支持 ESM + CJS

  **QA Scenarios**:
  ```
  Scenario: Vite 配置创建
    Tool: Bash
    Steps:
      1. test -f packages/core/vite.config.ts && echo "exists"
    Expected Result: 文件存在
    Evidence: .sisyphus/evidence/task-06-vite-config.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [x] 7. 更新 Core package.json 构建脚本

  **What to do**:
  - 更新 packages/core/package.json：
    ```json
    {
      "scripts": {
        "build": "vite build",
        "dev": "vite build --watch"
      },
      "devDependencies": {
        "vite": "^7.1.0",
        "vite-plugin-dts": "^4.2.3"
      },
      "exports": {
        ".": {
          "import": "./dist/index.js",
          "require": "./dist/index.cjs",
          "types": "./dist/index.d.ts"
        }
      }
    }
    ```
  - 移除 build.js 依赖

  **Must NOT do**:
  - 不要保留旧的 build.js 引用

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 8-9)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/core/package.json:24-25` - 当前构建脚本
  - `packages/core/package.json:18-23` - 当前 exports

  **Acceptance Criteria**:
  - [ ] build 脚本使用 vite
  - [ ] exports 包含 require 字段
  - [ ] vite 和 vite-plugin-dts 添加到 devDependencies

  **QA Scenarios**:
  ```
  Scenario: Core 构建脚本更新
    Tool: Bash
    Steps:
      1. grep '"build"' packages/core/package.json
    Expected Result: 使用 vite build
    Evidence: .sisyphus/evidence/task-07-core-scripts.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [x] 8. 添加 ESM/CJS 双格式支持

  **What to do**:
  - 更新 packages/react/vite.config.ts: `formats: ['es', 'cjs']`
  - 更新 packages/react/package.json exports:
    ```json
    {
      "exports": {
        ".": {
          "import": "./dist/index.js",
          "require": "./dist/index.cjs",
          "types": "./dist/index.d.ts"
        }
      }
    }
    ```
  - 同样更新 packages/vue

  **Must NOT do**:
  - 不要破坏现有 ESM 导出

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vite`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-7, 9)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/react/vite.config.ts:21` - 当前 formats
  - `packages/react/package.json:18-23` - 当前 exports
  - `packages/vue/vite.config.ts:26` - 当前 formats
  - `packages/vue/package.json:20-32` - 当前 exports

  **Acceptance Criteria**:
  - [ ] 所有包支持 ESM + CJS
  - [ ] exports 包含 import 和 require

  **QA Scenarios**:
  ```
  Scenario: ESM/CJS 双格式
    Tool: Bash
    Steps:
      1. cd packages/core && bun run build
      2. ls dist/index.js dist/index.cjs
    Expected Result: 两个文件都存在
    Evidence: .sisyphus/evidence/task-08-esm-cjs.txt
  ```

  **Commit**: NO (groups with Wave 2)

- [x] 9. 验证 Core 构建产物

  **What to do**:
  - 运行 `cd packages/core && bun run build`
  - 验证产物：
    - dist/index.js (ESM)
    - dist/index.cjs (CJS)
    - dist/index.d.ts (类型)
  - 运行 `cd packages/core && bun test` 确保测试通过

  **Must NOT do**:
  - 不要跳过验证

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6-8)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/core/package.json:9-12` - files 配置

  **Acceptance Criteria**:
  - [ ] dist/index.js 存在
  - [ ] dist/index.cjs 存在
  - [ ] dist/index.d.ts 存在
  - [ ] 测试通过

  **QA Scenarios**:
  ```
  Scenario: Core 构建验证
    Tool: Bash
    Steps:
      1. cd packages/core && bun run build
      2. ls -la dist/
      3. bun test
    Expected Result: 构建成功，测试通过
    Evidence: .sisyphus/evidence/task-09-core-build.txt
  ```

  **Commit**: YES
  - Message: `build(core): migrate to Vite and add CJS support`
  - Files: `packages/core/vite.config.ts, packages/core/package.json, packages/react/vite.config.ts, packages/react/package.json, packages/vue/vite.config.ts, packages/vue/package.json`
  - Pre-commit: `bun run build && bun test`

---

### Wave 3: Vue Composables 测试

- [x] 10. useWallet 测试

  **What to do**:
  - 创建 packages/vue/src/__tests__/useWallet.test.ts
  - 测试内容：
    - 初始状态正确
    - connect/disconnect 功能
    - 响应式状态更新
    - availableWallets 获取
    - 错误处理

  **Must NOT do**:
  - 不要测试实现细节，测试行为

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11-14)
  - **Blocks**: Tasks 15-18
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/vue/src/composables/useWallet.ts` - 被测文件
  - `packages/react/src/__tests__/hooks-simple.test.tsx` - 参考测试结构
  - `packages/vue/src/__tests__/index.test.ts` - 现有测试参考

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 8 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: useWallet 测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/useWallet.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-10-usewallet-test.txt
  ```

  **Commit**: NO (groups with Wave 3-4)

- [x] 11. useWalletEvent 测试

  **What to do**:
  - 创建 packages/vue/src/__tests__/useWalletEvent.test.ts
  - 测试内容：
    - 事件监听注册
    - 事件触发
    - 事件清理
    - once 功能
    - eventHistory 记录

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 12-14)
  - **Blocks**: Tasks 15-18
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/vue/src/composables/useWalletEvent.ts` - 被测文件

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 6 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: useWalletEvent 测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/useWalletEvent.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-11-event-test.txt
  ```

  **Commit**: NO (groups with Wave 3-4)

- [x] 12. useWalletModal 测试

  **What to do**:
  - 创建 packages/vue/src/__tests__/useWalletModal.test.ts
  - 测试内容：
    - open/close/toggle 功能
    - isOpen 状态
    - currentWalletId 管理
    - modalSource 追踪

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10-11, 13-14)
  - **Blocks**: Tasks 15-18
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/vue/src/composables/useWalletModal.ts` - 被测文件

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 5 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: useWalletModal 测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/useWalletModal.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-12-modal-test.txt
  ```

  **Commit**: NO (groups with Wave 3-4)

- [x] 13. useNetwork 测试

  **What to do**:
  - 创建 packages/vue/src/__tests__/useNetwork.test.ts
  - 测试内容：
    - network 状态
    - switchNetwork 功能
    - isSwitching 状态

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10-12, 14)
  - **Blocks**: Tasks 15-18
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/vue/src/composables/useNetwork.ts` - 被测文件

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 3 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: useNetwork 测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/useNetwork.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-13-network-test.txt
  ```

  **Commit**: NO (groups with Wave 3-4)

- [x] 14. useTheme 测试 (N/A - useTheme composable 不存在，只有 themeDetection 工具)

  **What to do**:
  - 创建 packages/vue/src/__tests__/useTheme.test.ts
  - 测试内容：
    - theme 状态
    - setTheme 功能
    - systemTheme 检测
    - effectiveTheme 计算
    - resetTheme 功能

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10-13)
  - **Blocks**: Tasks 15-18
  - **Blocked By**: Tasks 1-5

  **References**:
  - `packages/vue/src/utils/themeDetection.ts` - 主题检测实现

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 5 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: useTheme 测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/useTheme.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-14-theme-test.txt
  ```

  **Commit**: NO (groups with Wave 3-4)

---

### Wave 4: Vue 组件和集成测试

- [x] 15. ConnectButton 组件测试

  **What to do**:
  - 创建 packages/vue/src/__tests__/ConnectButton.test.ts
  - 测试内容：
    - 渲染正确
    - 点击触发连接
    - 主题应用
    - size/variant props

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 16-18)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 10-14

  **References**:
  - `packages/vue/src/components/ConnectButton.vue` - 被测组件
  - `packages/react/src/__tests__/components.test.tsx` - 参考测试

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 4 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: ConnectButton 测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/ConnectButton.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-15-button-test.txt
  ```

  **Commit**: NO (groups with Wave 3-4)

- [x] 16. WalletModal 组件测试

  **What to do**:
  - 创建 packages/vue/src/__tests__/WalletModal.test.ts
  - 测试内容：
    - 渲染正确
    - open/close 状态
    - 钱包选择
    - 主题应用

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 15, 17-18)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 10-14

  **References**:
  - `packages/vue/src/components/WalletModal.vue` - 被测组件

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 4 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: WalletModal 测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/WalletModal.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-16-modal-test.txt
  ```

  **Commit**: NO (groups with Wave 3-4)

- [x] 17. BTCWalletPlugin 测试

  **What to do**:
  - 创建 packages/vue/src/__tests__/plugin.test.ts
  - 测试内容：
    - 插件安装
    - 配置传递
    - 全局属性注入
    - autoConnect 功能

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 15-16, 18)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 10-14

  **References**:
  - `packages/vue/src/plugins/` - 插件目录（需确认位置）

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 4 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: Plugin 测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/plugin.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-17-plugin-test.txt
  ```

  **Commit**: NO (groups with Wave 3-4)

- [x] 18. 集成测试

  **What to do**:
  - 创建 packages/vue/src/__tests__/integration.test.ts
  - 测试内容：
    - 完整连接流程
    - 事件监听集成
    - 状态同步
    - 错误恢复

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`vue`, `vitest`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 15-17)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Tasks 10-14

  **References**:
  - `packages/vue/src/index.ts` - 入口文件

  **Acceptance Criteria**:
  - [ ] 测试文件创建
  - [ ] 至少 4 个测试用例
  - [ ] `bun test` 通过

  **QA Scenarios**:
  ```
  Scenario: 集成测试通过
    Tool: Bash
    Steps:
      1. cd packages/vue && bun test src/__tests__/integration.test.ts
    Expected Result: 所有测试通过
    Evidence: .sisyphus/evidence/task-18-integration-test.txt
  ```

  **Commit**: YES
  - Message: `test(vue): add comprehensive test coverage`
  - Files: `packages/vue/src/__tests__/*.test.ts`
  - Pre-commit: `bun test`

---

## Final Verification Wave

- [x] F1. **全量类型检查**
  ```bash
  bun run typecheck
  ```
  预期：所有包类型检查通过，无错误

- [x] F2. **全量测试运行**
  ```bash
  bun test
  ```
  预期：Core 26+, React 56+, Vue 40+ 测试通过

- [x] F3. **构建验证**
  ```bash
  bun run build
  ```
  预期：生成 ESM + CJS 格式，类型声明正确

- [x] F4. **依赖一致性检查**
  验证所有包的 TypeScript 和 @btc-connect/core 版本一致

---

## Commit Strategy

- **Wave 1**: `chore(deps): unify dependency versions and enable strict mode`
- **Wave 2**: `build(core): migrate to Vite and add CJS support`
- **Wave 3-4**: `test(vue): add comprehensive test coverage`
- **Final**: `chore: verify all optimizations`

---

## Success Criteria

### Verification Commands
```bash
bun run typecheck  # 预期：无错误
bun test           # 预期：所有测试通过，Vue 40+
bun run build      # 预期：生成 ESM + CJS
```

### Final Checklist
- [ ] 所有包 TypeScript 版本统一为 ^5.8.3
- [ ] 所有包 @btc-connect/core peer 版本统一为 ^0.5.0
- [ ] Vue tsconfig 启用严格模式
- [ ] Core 使用 Vite 构建
- [ ] 所有包支持 ESM + CJS
- [ ] Vue 测试数量 >= 40
- [ ] 测试日志清理完成
