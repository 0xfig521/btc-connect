# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-18
**Commit:** N/A
**Branch:** N/A

## OVERVIEW

btc-connect 是专为比特币 Web3 应用设计的钱包连接工具包，提供统一的连接接口、事件监听和适配层。Monorepo 架构，Bun 包管理器，支持 UniSat、OKX 等主流比特币钱包。v0.5.0 实现统一 Hook API 和智能主题检测。

## STRUCTURE

```
btc-connect/
├── packages/              # 核心包
│   ├── core/             # 框架无关的核心适配层（22 分）
│   ├── react/            # React 适配层：Hooks + Context（20 分）
│   └── vue/              # Vue 适配层：Composables + 插件（21 分）
├── examples/             # 示例项目
│   ├── nextjs/           # Next.js SSR 完整示例（14 分）
│   ├── nuxt-example/     # Nuxt 3 SSR 完整示例（15 分）
│   └── react/            # React 基础示例（8 分）
├── skill/                # MCP 技能模块（13 分）
│   └── btc-connect/      # btc-connect 专用技能
├── docs/                 # 文档（跳过，由 ROOT 覆盖）
├── scripts/              # 版本管理脚本（9 分）
└── .github/              # CI/CD 配置
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 钱包适配器实现 | `packages/core/src/adapters/` | UniSat/OKX/Xverse 适配器 |
| React Hooks | `packages/react/src/hooks/` | useWallet, useNetwork, useTheme |
| Vue Composables | `packages/vue/src/composables/` | useWallet, useCore, useWalletModal |
| SSR 示例 | `examples/nextjs/`, `examples/nuxt-example/` | 完整 SSR 兼容方案 |
| MCP 技能配置 | `skill/btc-connect/` | Context7 集成，技能脚本 |
| CI/CD 配置 | `.github/workflows/` | 自动化发布，分支管理 |
| 类型定义 | `packages/*/src/types/` | 统一的 TypeScript 类型 |
| 构建配置 | `packages/*/vite.config.ts` | Vite 构建，Bun build |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| BTCWalletManager | Class | `core/src/managers/` | 核心钱包管理器 |
| BTCWalletAdapter | Interface | `core/src/adapters/` | 适配器接口定义 |
| useWallet | Hook | `react/src/hooks/`, `vue/src/composables/` | 统一钱包访问点 |
| BTCWalletProvider | Component | `react/src/context/` | React Provider |
| BTCWalletPlugin | Plugin | `vue/src/plugins/` | Vue 插件系统 |
| ConnectButton | Component | `react/src/components/`, `vue/src/components/` | 连接按钮组件 |
| detectAvailableWallets | Function | `core/src/utils/` | 增强钱包检测 |

## CONVENTIONS

- **包管理**: 使用 Bun，所有 npm 命令替换为 bun（`bun install`, `bun add`, `bun run`）
- **代码规范**: Biome 格式化 + 检查，2 空格缩进，单引号，分号必填
- **TypeScript**: 严格模式，禁止 `as any`、`@ts-ignore`（测试文件和声明文件除外）
- **模块系统**: ES Module，所有文件使用 `.ts`/`.tsx`/`.vue`
- **导出风格**: 统一使用命名导出，入口文件统一导出
- **测试**: Bun Test，测试文件命名为 `*.test.ts`
- **文档**: CLAUDE.md 为模块级文档，AGENTS.md 为 AI 助手配置

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER** 使用 `npm install` - 始终使用 `bun install`
- **NEVER** 在代码中 suppress 类型错误（`as any`, `@ts-ignore`）
- **NEVER** 提交 dist/ 或 node_modules/ 目录
- **NEVER** 在无显式请求时提交代码
- **避免** 在 core 模块中引入框架依赖（保持框架无关）
- **避免** 在 SSR 环境中直接访问 `window`（使用 `typeof window !== 'undefined'` 检查）

## UNIQUE STYLES

- **统一 Hook API**: React 和 Vue 包实现完全一致的接口（v0.5.0+）
- **智能主题检测**: 支持亮色/暗色/自动模式切换
- **增强钱包检测**: 20 秒内每 300ms 轮询延迟注入的钱包
- **SSR 优先**: 所有示例项目优先保证 SSR 兼容性
- **MCP 技能集成**: 项目专用技能位于 `skill/btc-connect/`

## COMMANDS

```bash
# 根目录
bun dev              # 并行启动所有模块开发环境
bun build           # 构建所有模块
bun test            # 运行所有测试
bun lint            # 检查所有模块代码规范
bun typecheck       # 检查所有模块类型
bun install:all     # 安装依赖并构建

# 单独模块
cd packages/core && bun run dev     # 开发模式
cd packages/core && bun run build   # 构建
cd packages/core && bun run test    # 测试

# 示例项目
cd examples/nextjs && bun dev       # Next.js 示例
cd examples/nuxt-example && bun run dev  # Nuxt 示例
```

## NOTES

- **Monorepo 结构**: 使用 Bun Workspaces，`packages/*` 和 `examples/*`
- **CI/CD**: GitHub Actions 自动发布到 NPM（推送到 main 分支）
- **版本管理**: 使用 `bun run version:patch/minor/major` 更新版本
- **SSR 兼容**: Next.js 和 Nuxt 3 示例展示完整 SSR 方案
- **语言**: 中文文档和对话，代码注释可使用英文
- **技能优先级**: 用户安装的技能（如 `vue-best-practices`）优先于内置技能

## DEPENDENCIES

```
@btc-connect/react → @btc-connect/core
@btc-connect/vue  → @btc-connect/core
examples/*        → @btc-connect/*
```

## SUPPORTED WALLETS

| Wallet | ID | Status | Networks |
|--------|----|--------|----------|
| UniSat | `unisat` | ✅ Active | Mainnet, Testnet |
| OKX | `okx` | ✅ Active | Mainnet, Testnet |
| Xverse | `xverse` | 🚧 Development | Mainnet, Testnet |
