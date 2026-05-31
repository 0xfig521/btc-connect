# Nuxt 3 SSR Example - AGENTS.md

## OVERVIEW

Nuxt 3 SSR 完整示例，展示 Vue 3 服务端渲染兼容性和客户端插件加载方案。

## STRUCTURE

```
nuxt-example/
├── components/
│   ├── BalanceInfoCard.vue       # 余额信息
│   ├── NetworkInfoCard.vue       # 网络状态
│   ├── PerformanceMonitorCard.vue # 性能监控
│   ├── TransactionCard.vue       # 交易功能
│   ├── WalletModal.vue           # 钱包模态框
│   └── WalletStatusCard.vue      # 钱包状态
├── plugins/
│   └── btc-connect.client.ts     # 客户端插件
├── pages/
│   └── index.vue                 # 主页
├── nuxt.config.ts
└── package.json
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 客户端插件 | `plugins/btc-connect.client.ts` | `.client.ts` 后缀 |
| SSR 配置 | `nuxt.config.ts` | transpile, SSR 设置 |
| 组件示例 | `components/WalletStatusCard.vue` | 完整功能演示 |
| 性能监控 | `components/PerformanceMonitorCard.vue` | 连接时间监控 |

## CONVENTIONS

- **插件策略**: 使用 `.client.ts` 后缀确保仅客户端加载
- **组件保护**: 所有钱包组件使用 `ClientOnly` 包装
- **组合式 API**: 仅使用 `<script setup>` 语法
- **类型安全**: vue-tsc 严格检查

## ANTI-PATTERNS

- **NEVER** 在服务端插件中导入 BTC Connect
- **NEVER** 在 `onMounted` 之前访问钱包状态
- **避免** 在非 `.client.ts` 文件中使用 `process.client`

## UNIQUE STYLES

- **客户端插件**: `.client.ts` 后缀自动禁用 SSR
- **onMounted 策略**: 所有客户端逻辑在 `onMounted` 中执行
- **性能监控**: 内置连接时间、内存使用监控组件

## COMMANDS

```bash
bun run dev        # Nuxt 开发服务器（端口 3001）
bun run build      # 生产构建
bun run preview    # 预览生产版本
bun run generate   # 静态站点生成
bun typecheck      # vue-tsc 检查
```

## SSR STRATEGY

1. **插件层**: `btc-connect.client.ts` 仅在客户端注册
2. **组件层**: `ClientOnly` 包装所有钱包组件
3. **状态层**: `onMounted` 确保客户端初始化

## DEPENDENCIES

```
nuxt-example → @btc-connect/vue → @btc-connect/core
```

## TESTING SSR

1. **View Page Source**: 验证服务端 HTML
2. **Disable JavaScript**: 检查降级内容
3. **Hydration Check**: 监控水合过程
4. **Performance**: 测试连接时间和首屏加载
