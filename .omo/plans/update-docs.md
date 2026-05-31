# 更新 btc-connect 项目文档

## TL;DR

> **Quick Summary**: 根据最新代码（v0.5.1）全面更新项目文档，包括 CHANGELOG、README、API 文档、package.json 元数据和 JSDoc 注释，确保文档与代码完全同步，支持双语（中文 + 英文）。
>
> **Deliverables**:
> - 更新后的 CHANGELOG.md（包含 v0.5.0 和 v0.5.1 变更记录）
> - 修复并更新的所有 README.md 文件（根目录 + 3 个 packages）
> - 完整的 API 文档（docs/api.md，新增缓存、批处理、错误处理章节）
> - 更新后的 package.json 元数据（description、keywords、peerDependencies）
> - 扩展的 TypeScript JSDoc 注释覆盖
>
> **Estimated Effort**: Medium（~8-9 小时，双语版本）
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

---

## Context

### Original Request
根据最新的 packages 各个模块的代码，更新 doc 还有各个文档。

### Interview Summary
**Key Discussions**:
- 更新范围：所有 README.md 文件、docs/ 目录、package.json 元数据、JSDoc 注释
- 文档深度：完整 API 文档（每个导出的函数、接口、类型都需要详细说明）
- 语言：双语（中文 + 英文）
- 版本：当前 package.json 版本为 0.5.1，CHANGELOG.md 停留在 0.4.0

**Research Findings**:
- 版本不一致：package.json 是 0.5.1，CHANGELOG.md 停留在 0.4.0
- 文档错误：README.md 中目录引用错误、重复内容、npm 命令需改为 bun
- API 变更：React 和 Vue 包实现了统一的 useWallet 接口
- 新增功能：缓存系统、批处理系统、增强错误处理
- 版本常量错误：React 包导出 0.1.4，Vue 包导出 0.3.14，应为 0.5.1

### Metis Review
**Identified Gaps** (addressed):
- 缺失的 CHANGELOG 记录：需要添加 v0.5.0 和 v0.5.1 变更
- 新功能未文档化：缓存系统、批处理系统、错误处理系统
- 版本常量错误：需要修复 React 和 Vue 包的版本导出
- JSDoc 覆盖不足：当前约 15-30%，需要扩展到所有公共 API
- 双语文档同步：需要确保中英文内容一致

---

## Work Objectives

### Core Objective
根据最新代码（v0.5.1）全面更新项目文档，确保文档与代码完全同步，提供完整、准确、双语的 API 文档。

### Concrete Deliverables
- CHANGELOG.md：添加 v0.5.0 和 v0.5.1 变更记录
- 根目录 README.md：修复错误、更新内容
- packages/core/README.md：添加缓存、批处理、错误处理 API 文档
- packages/react/README.md：完整 Hooks API 文档
- packages/vue/README.md：完整 Composables API 文档
- docs/api.md：新增缓存、批处理、错误处理章节
- docs/nextjs.md：更新 v0.5.x 配置示例
- docs/nuxt.md：更新 v0.5.x 配置示例
- package.json 元数据：更新 description、keywords、统一 peerDependencies
- TypeScript JSDoc：扩展覆盖到所有公共 API

### Definition of Done
- [ ] CHANGELOG.md 包含 v0.5.0 和 v0.5.1 变更记录
- [ ] 所有 README.md 错误已修复
- [ ] docs/api.md 包含所有新增功能的完整 API 文档
- [ ] 所有 package.json 的 description 和 keywords 已更新
- [ ] 版本常量修复为 v0.5.1
- [ ] 所有公共导出都有 JSDoc 注释
- [ ] 双语文档内容同步

### Must Have
- CHANGELOG.md 必须包含 v0.5.0 和 v0.5.1 的完整变更记录
- 所有 README.md 必须遵循统一模板结构
- docs/api.md 必须包含所有公共 API
- 版本常量必须修复为 v0.5.1
- 所有公共导出必须有 JSDoc 注释

### Must NOT Have (Guardrails)
- MUST NOT 修改代码实现（只更新文档和注释）
- MUST NOT 添加新功能或重构代码
- MUST NOT 更新依赖版本（除非是 peerDependencies 声明修正）
- MUST NOT 创建新文档文件（只更新现有文件）
- MUST NOT 为私有函数添加 JSDoc（只关注公共 API）
- MUST NOT 更新 examples/ 目录下的文档（不在范围内）

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO（文档更新不需要测试框架）
- **Automated tests**: None
- **Framework**: N/A
- **Verification**: 通过命令行工具验证文档完整性

### QA Policy
每个任务都包含 Agent-Executed QA Scenarios - 执行代理将直接验证每个交付成果。

- **文档验证**: 使用 Bash (grep) - 检查关键内容是否存在
- **版本验证**: 使用 Bash (grep) - 检查版本号是否正确
- **JSDoc 验证**: 使用 Bash (grep) - 检查 JSDoc 注释是否存在
- **结构验证**: 使用 Read - 检查文档结构是否符合要求

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - 版本同步):
├── Task 1: 修复版本常量 [quick]
├── Task 2: 更新 CHANGELOG.md [quick]
└── Task 3: 更新 package.json 元数据 [quick]

Wave 2 (After Wave 1 - README 更新):
├── Task 4: 修复根目录 README.md [quick]
├── Task 5: 更新 packages/core/README.md [unspecified-high]
├── Task 6: 更新 packages/react/README.md [unspecified-high]
└── Task 7: 更新 packages/vue/README.md [unspecified-high]

Wave 3 (After Wave 2 - API 文档):
├── Task 8: 更新 docs/api.md - 缓存系统 [unspecified-high]
├── Task 9: 更新 docs/api.md - 批处理系统 [unspecified-high]
├── Task 10: 更新 docs/api.md - 错误处理 [unspecified-high]
├── Task 11: 更新 docs/nextjs.md [quick]
└── Task 12: 更新 docs/nuxt.md [quick]

Wave 4 (After Wave 3 - JSDoc 注释):
├── Task 13: 添加 core 包 JSDoc [unspecified-high]
├── Task 14: 添加 react 包 JSDoc [unspecified-high]
└── Task 15: 添加 vue 包 JSDoc [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: 文档完整性审计 (oracle)
├── Task F2: 版本一致性检查 (unspecified-high)
├── Task F3: 双语同步验证 (unspecified-high)
└── Task F4: JSDoc 覆盖检查 (unspecified-high)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

- **1-3**: - - 4-15, 1
- **4**: 1-3 - 8-12, 2
- **5-7**: 1-3 - 8-12, 2
- **8-10**: 4-7 - 13-15, 3
- **11-12**: 4-7 - 13-15, 3
- **13-15**: 1-12 - F1-F4, 4
- **F1-F4**: 1-15 - user okay, 5

### Agent Dispatch Summary

- **Wave 1**: **3** - T1-T3 → `quick`
- **Wave 2**: **4** - T4 → `quick`, T5-T7 → `unspecified-high`
- **Wave 3**: **5** - T8-T10 → `unspecified-high`, T11-T12 → `quick`
- **Wave 4**: **3** - T13-T15 → `unspecified-high`
- **FINAL**: **4** - F1 → `oracle`, F2-F4 → `unspecified-high`

---

## TODOs

- [x] 1. 修复版本常量

  **What to do**:
  - 修复 packages/react/src/index.ts 中的版本常量（0.1.4 → 0.5.1）
  - 修复 packages/vue/src/index.ts 中的版本常量（0.3.14 → 0.5.1）
  - 确保所有包的版本号一致

  **Must NOT do**:
  - 不要修改其他代码逻辑
  - 不要修改 package.json 中的版本号（已经是正确的 0.5.1）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的文本替换，每个文件只需修改一行
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4-15
  - **Blocked By**: None

  **References**:
  - `packages/react/src/index.ts:88` - 版本常量定义
  - `packages/vue/src/index.ts:75` - 版本常量定义

  **Acceptance Criteria**:
  - [ ] packages/react/src/index.ts 中 `export const version = '0.5.1';`
  - [ ] packages/vue/src/index.ts 中 `export const version = '0.5.1';`

  **QA Scenarios**:
  ```
  Scenario: 版本常量已修复
    Tool: Bash (grep)
    Steps:
      1. grep "export const version = '0.5.1'" packages/react/src/index.ts
      2. grep "export const version = '0.5.1'" packages/vue/src/index.ts
    Expected Result: 两个命令都返回匹配行
    Evidence: .sisyphus/evidence/task-1-version-constants.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `docs: fix version constants to 0.5.1`
  - Files: `packages/react/src/index.ts`, `packages/vue/src/index.ts`

- [x] 2. 更新 CHANGELOG.md

  **What to do**:
  - 添加 v0.5.1 变更记录（2026-05-03）
  - 添加 v0.5.0 变更记录
  - 包含新增功能：缓存系统、批处理、统一错误处理、增强钱包检测
  - 包含 API 变更：统一 Hook API
  - 包含修复：版本常量、文档错误

  **Must NOT do**:
  - 不要修改 v0.4.0 及之前的记录
  - 不要添加虚假的变更记录

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 添加变更记录，内容已明确
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4-15
  - **Blocked By**: None

  **References**:
  - `CHANGELOG.md:1-100` - 现有 CHANGELOG 格式
  - `CHANGELOG.md:8-89` - v0.4.0 变更记录示例

  **Acceptance Criteria**:
  - [ ] CHANGELOG.md 包含 `## [0.5.1] - 2026-05-03` 章节
  - [ ] CHANGELOG.md 包含 `## [0.5.0]` 章节
  - [ ] 变更记录包含新增功能、API 变更、修复等分类

  **QA Scenarios**:
  ```
  Scenario: CHANGELOG 包含 v0.5.x 记录
    Tool: Bash (grep)
    Steps:
      1. grep "## \[0\.5\.1\]" CHANGELOG.md
      2. grep "## \[0\.5\.0\]" CHANGELOG.md
      3. grep "Cache System\|Batch Processing\|Unified Error" CHANGELOG.md
    Expected Result: 所有命令都返回匹配行
    Evidence: .sisyphus/evidence/task-2-changelog.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `docs: add v0.5.0 and v0.5.1 to CHANGELOG`
  - Files: `CHANGELOG.md`

- [x] 3. 更新 package.json 元数据

  **What to do**:
  - 更新 packages/core/package.json 的 description 和 keywords
  - 更新 packages/react/package.json 的 description、keywords、peerDependencies
  - 更新 packages/vue/package.json 的 description、keywords、peerDependencies
  - 统一 peerDependencies 版本声明：`@btc-connect/core: ^0.5.0`

  **Must NOT do**:
  - 不要修改 version 字段（已经是正确的 0.5.1）
  - 不要修改 dependencies 或 devDependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的 JSON 字段更新
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Tasks 4-15
  - **Blocked By**: None

  **References**:
  - `packages/core/package.json:4` - description 字段
  - `packages/core/package.json:38-47` - keywords 字段
  - `packages/react/package.json` - 需要更新的字段
  - `packages/vue/package.json` - 需要更新的字段

  **Acceptance Criteria**:
  - [ ] packages/core/package.json description 包含 "cache, batch processing, error handling"
  - [ ] packages/react/package.json peerDependencies `@btc-connect/core` 为 `^0.5.0`
  - [ ] packages/vue/package.json peerDependencies `@btc-connect/core` 为 `^0.5.0`

  **QA Scenarios**:
  ```
  Scenario: package.json 元数据已更新
    Tool: Bash (grep)
    Steps:
      1. grep "cache" packages/core/package.json
      2. grep '"@btc-connect/core": "\^0.5.0"' packages/react/package.json
      3. grep '"@btc-connect/core": "\^0.5.0"' packages/vue/package.json
    Expected Result: 所有命令都返回匹配行
    Evidence: .sisyphus/evidence/task-3-package-json.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `docs: update package.json metadata and unify peerDependencies`
  - Files: `packages/*/package.json`

- [x] 4. 修复根目录 README.md

  **What to do**:
  - 删除第 186-199 行的重复"项目示例"部分
  - 将所有 `npm` 命令改为 `bun`
  - 修复目录引用（移除不存在的 `vue-example/`，改为 `nuxt-example/`）
  - 更新版本号引用
  - 同步更新 README.zh-CN.md

  **Must NOT do**:
  - 不要修改文档的整体结构
  - 不要添加新章节

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 修复错误和更新命令，内容明确
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: Tasks 8-12
  - **Blocked By**: Tasks 1-3

  **References**:
  - `README.md:186-199` - 重复的"项目示例"部分
  - `README.md` - 所有 npm 命令位置
  - `README.zh-CN.md` - 中文版对应内容

  **Acceptance Criteria**:
  - [ ] README.md 中无重复的"项目示例"部分
  - [ ] README.md 中所有命令使用 `bun` 而非 `npm`
  - [ ] README.md 中目录引用正确（`nuxt-example/` 而非 `vue-example/`）
  - [ ] README.zh-CN.md 与 README.md 内容同步

  **QA Scenarios**:
  ```
  Scenario: README 错误已修复
    Tool: Bash (grep)
    Steps:
      1. 检查无重复内容（统计"项目示例"出现次数）
      2. grep "npm install" README.md（应无匹配）
      3. grep "bun install" README.md（应有匹配）
      4. grep "nuxt-example" README.md（应有匹配）
    Expected Result: 无 npm 命令，有 bun 命令，目录引用正确
    Evidence: .sisyphus/evidence/task-4-readme-fix.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `docs: fix errors in root README`
  - Files: `README.md`, `README.zh-CN.md`

- [x] 5. 更新 packages/core/README.md

  **What to do**:
  - 添加"Cache System"章节（MemoryCache, CacheManager, EnhancedMemoryCache, 缓存装饰器）
  - 添加"Batch Processing"章节（BatchScheduler, 批处理配置）
  - 添加"Error Handling"章节（UnifiedError, ErrorFactory, ErrorRecoveryStrategy）
  - 更新 API Reference 章节
  - 同步更新 README.zh-CN.md

  **Must NOT do**:
  - 不要删除现有内容
  - 不要修改代码示例的核心逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要编写大量新的 API 文档，约 300+ 行
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7)
  - **Blocks**: Tasks 8-12
  - **Blocked By**: Tasks 1-3

  **References**:
  - `packages/core/src/cache/index.ts` - 缓存系统导出
  - `packages/core/src/utils/batch.ts` - 批处理系统
  - `packages/core/src/errors/index.ts` - 错误处理系统
  - `packages/core/README.md` - 现有文档结构

  **Acceptance Criteria**:
  - [ ] packages/core/README.md 包含 "## Cache System" 章节
  - [ ] packages/core/README.md 包含 "## Batch Processing" 章节
  - [ ] packages/core/README.md 包含 "## Error Handling" 章节
  - [ ] 每个章节包含完整的 API 说明和代码示例
  - [ ] README.zh-CN.md 与 README.md 内容同步

  **QA Scenarios**:
  ```
  Scenario: Core README 包含新功能文档
    Tool: Bash (grep)
    Steps:
      1. grep "## Cache System" packages/core/README.md
      2. grep "## Batch Processing" packages/core/README.md
      3. grep "## Error Handling" packages/core/README.md
      4. grep "MemoryCache\|CacheManager\|BatchScheduler" packages/core/README.md
    Expected Result: 所有命令都返回匹配行
    Evidence: .sisyphus/evidence/task-5-core-readme.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `docs(core): add cache, batch, and error handling docs`
  - Files: `packages/core/README.md`, `packages/core/README.zh-CN.md`

- [x] 6. 更新 packages/react/README.md

  **What to do**:
  - 添加完整的 Hooks API 表格（11 个 Hooks）
  - 添加 useWalletDetection 详细文档
  - 更新 useWallet 返回值说明（包含所有新增属性）
  - 更新代码示例使用 v0.5.x API
  - 同步更新 README.zh-CN.md

  **Must NOT do**:
  - 不要删除现有的 Hook 文档
  - 不要修改代码示例的核心逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要编写完整的 Hooks API 文档，约 200+ 行
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7)
  - **Blocks**: Tasks 8-12
  - **Blocked By**: Tasks 1-3

  **References**:
  - `packages/react/src/hooks/index.ts` - Hooks 导出列表
  - `packages/react/src/hooks/useWalletDetection.ts` - useWalletDetection 实现
  - `packages/react/README.md` - 现有文档结构

  **Acceptance Criteria**:
  - [ ] packages/react/README.md 包含完整的 Hooks API 表格
  - [ ] packages/react/README.md 包含 useWalletDetection 详细文档
  - [ ] packages/react/README.md 中 useWallet 返回值说明完整
  - [ ] README.zh-CN.md 与 README.md 内容同步

  **QA Scenarios**:
  ```
  Scenario: React README 包含完整 Hooks 文档
    Tool: Bash (grep)
    Steps:
      1. grep "useWalletDetection" packages/react/README.md
      2. grep "useWalletManager" packages/react/README.md
      3. grep "useWalletEvent" packages/react/README.md
      4. 检查 Hooks API 表格存在
    Expected Result: 所有命令都返回匹配行
    Evidence: .sisyphus/evidence/task-6-react-readme.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `docs(react): add complete Hooks API documentation`
  - Files: `packages/react/README.md`, `packages/react/README.zh-CN.md`

- [x] 7. 更新 packages/vue/README.md

  **What to do**:
  - 添加完整的 Composables API 表格（16 个 Composables）
  - 添加 useWalletManagerAdvanced 详细文档
  - 添加 useWalletInfo 详细文档
  - 添加 useWalletDetection 详细文档
  - 更新 useWallet 返回值说明（包含所有新增属性）
  - 更新代码示例使用 v0.5.x API
  - 同步更新 README.zh-CN.md

  **Must NOT do**:
  - 不要删除现有的 Composable 文档
  - 不要修改代码示例的核心逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要编写完整的 Composables API 文档，约 250+ 行
  - **Skills**: []
    - 无需特殊技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Tasks 8-12
  - **Blocked By**: Tasks 1-3

  **References**:
  - `packages/vue/src/composables/index.ts` - Composables 导出列表
  - `packages/vue/src/composables/useWalletManager.ts` - useWalletManagerAdvanced 实现
  - `packages/vue/src/composables/useWalletInfo.ts` - useWalletInfo 实现
  - `packages/vue/README.md` - 现有文档结构

  **Acceptance Criteria**:
  - [ ] packages/vue/README.md 包含完整的 Composables API 表格
  - [ ] packages/vue/README.md 包含 useWalletManagerAdvanced 详细文档
  - [ ] packages/vue/README.md 包含 useWalletInfo 详细文档
  - [ ] packages/vue/README.md 包含 useWalletDetection 详细文档
  - [ ] README.zh-CN.md 与 README.md 内容同步

  **QA Scenarios**:
  ```
  Scenario: Vue README 包含完整 Composables 文档
    Tool: Bash (grep)
    Steps:
      1. grep "useWalletManagerAdvanced" packages/vue/README.md
      2. grep "useWalletInfo" packages/vue/README.md
      3. grep "useWalletDetection" packages/vue/README.md
      4. 检查 Composables API 表格存在
    Expected Result: 所有命令都返回匹配行
    Evidence: .sisyphus/evidence/task-7-vue-readme.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `docs(vue): add complete Composables API documentation`
  - Files: `packages/vue/README.md`, `packages/vue/README.zh-CN.md`

- [x] 8. 更新 docs/api.md - 缓存系统

  **What to do**:
  - 添加 "## Cache System API" 章节
  - 文档化 MemoryCache 类（构造函数、方法、属性）
  - 文档化 EnhancedMemoryCache 类
  - 文档化 CacheManager 类
  - 文档化缓存装饰器（@cached, @smartCached, @conditionalCached, @invalidateCache）
  - 文档化 CachePresets 配置
  - 提供完整的使用示例

  **Must NOT do**:
  - 不要修改现有章节
  - 不要添加内部实现细节

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要编写约 200 行的详细 API 文档
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11, 12)
  - **Blocks**: Tasks 13-15
  - **Blocked By**: Tasks 4-7

  **References**:
  - `packages/core/src/cache/index.ts` - 缓存系统导出
  - `packages/core/src/cache/memory-cache.ts` - MemoryCache 实现
  - `packages/core/src/cache/enhanced-cache.ts` - EnhancedMemoryCache 实现
  - `docs/api.md` - 现有 API 文档结构

  **Acceptance Criteria**:
  - [ ] docs/api.md 包含 "## Cache System API" 章节
  - [ ] 包含 MemoryCache、EnhancedMemoryCache、CacheManager 的完整文档
  - [ ] 包含所有缓存装饰器的使用说明
  - [ ] 包含代码示例

  **QA Scenarios**:
  ```
  Scenario: API 文档包含缓存系统
    Tool: Bash (grep)
    Steps:
      1. grep "## Cache System API" docs/api.md
      2. grep "MemoryCache" docs/api.md
      3. grep "CacheManager" docs/api.md
      4. grep "@cached" docs/api.md
    Expected Result: 所有命令都返回匹配行
    Evidence: .sisyphus/evidence/task-8-api-cache.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `docs(api): add Cache System API documentation`
  - Files: `docs/api.md`

- [x] 9. 更新 docs/api.md - 批处理系统

  **What to do**:
  - 添加 "## Batch Processing API" 章节
  - 文档化 BatchScheduler 类（构造函数、方法、配置）
  - 文档化 createBatchScheduler 和 createSimpleBatchScheduler 函数
  - 文档化批处理类型（BatchRequest, BatchProcessor, BatchSchedulerConfig）
  - 文档化 BatchDefaults 配置
  - 提供完整的使用示例

  **Must NOT do**:
  - 不要修改现有章节
  - 不要添加内部实现细节

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要编写约 150 行的详细 API 文档
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10, 11, 12)
  - **Blocks**: Tasks 13-15
  - **Blocked By**: Tasks 4-7

  **References**:
  - `packages/core/src/utils/batch.ts` - 批处理系统实现
  - `docs/api.md` - 现有 API 文档结构

  **Acceptance Criteria**:
  - [ ] docs/api.md 包含 "## Batch Processing API" 章节
  - [ ] 包含 BatchScheduler 的完整文档
  - [ ] 包含批处理配置和类型的说明
  - [ ] 包含代码示例

  **QA Scenarios**:
  ```
  Scenario: API 文档包含批处理系统
    Tool: Bash (grep)
    Steps:
      1. grep "## Batch Processing API" docs/api.md
      2. grep "BatchScheduler" docs/api.md
      3. grep "createBatchScheduler" docs/api.md
    Expected Result: 所有命令都返回匹配行
    Evidence: .sisyphus/evidence/task-9-api-batch.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `docs(api): add Batch Processing API documentation`
  - Files: `docs/api.md`

- [x] 10. 更新 docs/api.md - 错误处理

  **What to do**:
  - 添加 "## Error Handling API" 章节
  - 文档化 UnifiedError 类
  - 文档化 ErrorFactory 所有工厂方法（15+ 方法）
  - 文档化 ErrorRecoveryStrategy 策略
  - 文档化 ErrorCode 和 ErrorSeverity 枚举
  - 文档化 WalletErrorHandler 和 ErrorReporter
  - 提供完整的使用示例

  **Must NOT do**:
  - 不要修改现有章节
  - 不要添加内部实现细节

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要编写约 300 行的详细 API 文档
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 11, 12)
  - **Blocks**: Tasks 13-15
  - **Blocked By**: Tasks 4-7

  **References**:
  - `packages/core/src/errors/index.ts` - 错误处理系统
  - `packages/core/src/utils/error-handler.ts` - 错误处理器
  - `docs/api.md` - 现有 API 文档结构

  **Acceptance Criteria**:
  - [ ] docs/api.md 包含 "## Error Handling API" 章节
  - [ ] 包含 UnifiedError、ErrorFactory、ErrorRecoveryStrategy 的完整文档
  - [ ] 包含所有错误类型和枚举的说明
  - [ ] 包含代码示例

  **QA Scenarios**:
  ```
  Scenario: API 文档包含错误处理系统
    Tool: Bash (grep)
    Steps:
      1. grep "## Error Handling API" docs/api.md
      2. grep "UnifiedError" docs/api.md
      3. grep "ErrorFactory" docs/api.md
      4. grep "ErrorRecoveryStrategy" docs/api.md
    Expected Result: 所有命令都返回匹配行
    Evidence: .sisyphus/evidence/task-10-api-error.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `docs(api): add Error Handling API documentation`
  - Files: `docs/api.md`

- [x] 11. 更新 docs/nextjs.md

  **What to do**:
  - 更新配置示例使用 v0.5.x API
  - 添加新功能的使用示例（缓存、批处理）
  - 更新 SSR 兼容性说明
  - 更新代码示例

  **Must NOT do**:
  - 不要删除现有内容
  - 不要修改 Next.js 配置的核心逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 更新现有文档，约 50-100 行修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10, 12)
  - **Blocks**: Tasks 13-15
  - **Blocked By**: Tasks 4-7

  **References**:
  - `docs/nextjs.md` - 现有 Next.js 配置文档
  - `packages/react/README.md` - React 包最新 API

  **Acceptance Criteria**:
  - [ ] docs/nextjs.md 使用 v0.5.x API 示例
  - [ ] 包含新功能的使用说明
  - [ ] SSR 兼容性说明已更新

  **QA Scenarios**:
  ```
  Scenario: Next.js 文档已更新
    Tool: Bash (grep)
    Steps:
      1. grep "v0.5" docs/nextjs.md
      2. grep "useWallet" docs/nextjs.md
    Expected Result: 命令返回匹配行
    Evidence: .sisyphus/evidence/task-11-nextjs.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `docs(nextjs): update for v0.5.x`
  - Files: `docs/nextjs.md`

- [x] 12. 更新 docs/nuxt.md

  **What to do**:
  - 更新配置示例使用 v0.5.x API
  - 添加新功能的使用示例（缓存、批处理）
  - 更新 SSR 兼容性说明
  - 更新代码示例

  **Must NOT do**:
  - 不要删除现有内容
  - 不要修改 Nuxt 配置的核心逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 更新现有文档，约 50-100 行修改
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10, 11)
  - **Blocks**: Tasks 13-15
  - **Blocked By**: Tasks 4-7

  **References**:
  - `docs/nuxt.md` - 现有 Nuxt 配置文档
  - `packages/vue/README.md` - Vue 包最新 API

  **Acceptance Criteria**:
  - [ ] docs/nuxt.md 使用 v0.5.x API 示例
  - [ ] 包含新功能的使用说明
  - [ ] SSR 兼容性说明已更新

  **QA Scenarios**:
  ```
  Scenario: Nuxt 文档已更新
    Tool: Bash (grep)
    Steps:
      1. grep "v0.5" docs/nuxt.md
      2. grep "useWallet" docs/nuxt.md
    Expected Result: 命令返回匹配行
    Evidence: .sisyphus/evidence/task-12-nuxt.txt
  ```

  **Commit**: YES (groups with Wave 3)
  - Message: `docs(nuxt): update for v0.5.x`
  - Files: `docs/nuxt.md`

- [x] 13. 添加 core 包 JSDoc 注释

  **What to do**:
  - 为 packages/core/src/adapters/*.ts 所有适配器类和方法添加 JSDoc
  - 为 packages/core/src/managers/*.ts BTCWalletManager 所有方法添加 JSDoc
  - 为 packages/core/src/cache/*.ts 所有缓存类和方法添加 JSDoc
  - 为 packages/core/src/events/*.ts EventEmitter 和 WalletEventManager 添加 JSDoc
  - 为 packages/core/src/errors/*.ts 所有错误类和工厂方法添加 JSDoc
  - 为 packages/core/src/utils/batch.ts BatchScheduler 添加 JSDoc
  - 确保所有 JSDoc 包含 @param、@returns、@example 标签

  **Must NOT do**:
  - 不要为私有函数添加 JSDoc（只关注导出的公共 API）
  - 不要修改代码逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要为大量文件添加 JSDoc，约 30+ 文件，每个文件 10-30 个注释
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 14, 15)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1-12

  **References**:
  - `packages/core/src/index.ts` - 所有公共导出列表
  - 现有 JSDoc 注释格式（如有）

  **Acceptance Criteria**:
  - [ ] 所有 core 包公共导出都有 JSDoc 注释
  - [ ] JSDoc 包含 @param、@returns、@example 标签
  - [ ] JSDoc 使用英文（符合 TypeScript 惯例）

  **QA Scenarios**:
  ```
  Scenario: Core 包 JSDoc 覆盖
    Tool: Bash (grep)
    Steps:
      1. 统计 core/src 下 @param 数量
      2. 统计 core/src 下 @returns 数量
      3. 统计 core/src 下 @example 数量
    Expected Result: 至少 50+ 个 JSDoc 注释
    Evidence: .sisyphus/evidence/task-13-core-jsdoc.txt
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `docs(core): add JSDoc comments for all public APIs`
  - Files: `packages/core/src/**/*.ts`

- [x] 14. 添加 react 包 JSDoc 注释

  **What to do**:
  - 为 packages/react/src/hooks/*.ts 所有 Hook 函数添加 JSDoc
  - 为 packages/react/src/context/provider.tsx BTCWalletProvider 添加 JSDoc
  - 为 packages/react/src/components/*.tsx 所有组件添加 JSDoc
  - 确保所有 JSDoc 包含 @param、@returns、@example 标签

  **Must NOT do**:
  - 不要为私有函数添加 JSDoc
  - 不要修改代码逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要为 8+ 文件添加 JSDoc
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 15)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1-12

  **References**:
  - `packages/react/src/index.ts` - 所有公共导出列表
  - 现有 JSDoc 注释格式（如有）

  **Acceptance Criteria**:
  - [ ] 所有 react 包公共导出都有 JSDoc 注释
  - [ ] JSDoc 包含 @param、@returns、@example 标签
  - [ ] JSDoc 使用英文

  **QA Scenarios**:
  ```
  Scenario: React 包 JSDoc 覆盖
    Tool: Bash (grep)
    Steps:
      1. 统计 react/src 下 @param 数量
      2. 统计 react/src 下 @returns 数量
      3. 统计 react/src 下 @example 数量
    Expected Result: 至少 20+ 个 JSDoc 注释
    Evidence: .sisyphus/evidence/task-14-react-jsdoc.txt
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `docs(react): add JSDoc comments for all public APIs`
  - Files: `packages/react/src/**/*.{ts,tsx}`

- [x] 15. 添加 vue 包 JSDoc 注释

  **What to do**:
  - 为 packages/vue/src/composables/*.ts 所有 Composable 函数添加 JSDoc
  - 为 packages/vue/src/components/*.vue 所有组件添加 JSDoc
  - 为 packages/vue/src/walletContext.ts Plugin 定义添加 JSDoc
  - 确保所有 JSDoc 包含 @param、@returns、@example 标签

  **Must NOT do**:
  - 不要为私有函数添加 JSDoc
  - 不要修改代码逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要为 16+ 文件添加 JSDoc
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 14)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1-12

  **References**:
  - `packages/vue/src/index.ts` - 所有公共导出列表
  - 现有 JSDoc 注释格式（如有）

  **Acceptance Criteria**:
  - [ ] 所有 vue 包公共导出都有 JSDoc 注释
  - [ ] JSDoc 包含 @param、@returns、@example 标签
  - [ ] JSDoc 使用英文

  **QA Scenarios**:
  ```
  Scenario: Vue 包 JSDoc 覆盖
    Tool: Bash (grep)
    Steps:
      1. 统计 vue/src 下 @param 数量
      2. 统计 vue/src 下 @returns 数量
      3. 统计 vue/src 下 @example 数量
    Expected Result: 至少 30+ 个 JSDoc 注释
    Evidence: .sisyphus/evidence/task-15-vue-jsdoc.txt
  ```

  **Commit**: YES (groups with Wave 4)
  - Message: `docs(vue): add JSDoc comments for all public APIs`
  - Files: `packages/vue/src/**/*.{ts,vue}`

---



## Final Verification Wave (MANDATORY)

- [x] F1. **文档完整性审计** — `oracle`
  检查所有文档文件是否存在，内容是否完整，CHANGELOG 是否包含 v0.5.x 记录，README 是否遵循统一模板，API 文档是否包含所有公共 API。
  Output: `Files [N/N] | CHANGELOG [PASS/FAIL] | README [N/N] | API Docs [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **版本一致性检查** — `unspecified-high`
  检查所有 package.json 版本号是否为 0.5.1，版本常量是否修复，peerDependencies 是否统一。
  Output: `package.json [N/N] | Version Constants [N/N] | peerDependencies [N/N] | VERDICT`

- [x] F3. **双语同步验证** — `unspecified-high`
  检查所有双语文档（README.md + README.zh-CN.md）内容是否同步，关键信息是否一致。
  Output: `README Pairs [N/N synced] | Content Match [PASS/FAIL] | VERDICT`

- [x] F4. **JSDoc 覆盖检查** — `unspecified-high`
  使用 grep 检查所有公共导出是否有 JSDoc 注释，统计覆盖率。
  Output: `Files [N/N] | JSDoc Count [N] | Coverage [X%] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `docs: sync version constants and update CHANGELOG for v0.5.x`
- **Wave 2**: `docs: update all README files with latest API`
- **Wave 3**: `docs: add cache, batch, and error handling to API docs`
- **Wave 4**: `docs: expand JSDoc coverage for all public APIs`
- **Final**: `docs: complete documentation update for v0.5.1`

---

## Success Criteria

### Verification Commands
```bash
# 检查 CHANGELOG 包含 v0.5.x
grep -E "## \[0\.5\.(0|1)\]" CHANGELOG.md

# 检查版本常量正确
grep "export const version = '0.5.1'" packages/*/src/index.ts

# 检查 package.json description 已更新
grep "description" packages/*/package.json

# 检查 docs/api.md 包含新章节
grep -E "## (Cache System|Batch Processing|Error Handling)" docs/api.md

# 检查 JSDoc 覆盖
grep -r "@param\|@returns\|@example" packages/*/src
```

### Final Checklist
- [ ] CHANGELOG.md 包含 v0.5.0 和 v0.5.1 变更记录
- [ ] 所有 README.md 错误已修复
- [ ] docs/api.md 包含所有新增功能的完整 API 文档
- [ ] 所有 package.json 的 description 和 keywords 已更新
- [ ] 版本常量修复为 v0.5.1
- [ ] 所有公共导出都有 JSDoc 注释
- [ ] 双语文档内容同步
