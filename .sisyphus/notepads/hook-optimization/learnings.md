# Hook Optimization Learnings

## 2026-05-10: useWalletModalEnhanced 测试编写

### Bun Test + React Testing Library 配置

1. **DOM 环境问题**: Bun test 默认不提供 DOM 环境，需要手动配置
   - 解决方案: 使用 `happy-dom` 包
   - 配置方式: 在测试文件顶部导入并设置 global document/window
   
   ```typescript
   import { Window } from 'happy-dom';
   const window = new Window();
   global.document = window.document;
   global.window = window;
   ```

2. **Jest 环境注释不生效**: `@jest-environment jsdom` 在 Bun test 中无效
   - Bun 使用自己的测试运行器，不支持 Jest 的环境配置注释

### useWalletModalEnhanced 功能清单

Hook 提供以下功能（需要在合并时保留）:

**状态属性:**
- `isOpen`: 模态框是否打开
- `openSource`: 打开来源（字符串或 null）
- `openCount`: 打开次数计数器
- `config`: 模态框配置对象
- `modalState`: 完整模态框状态

**方法:**
- `open()`: 打开模态框（默认来源）
- `openWithSource(source)`: 从指定来源打开
- `close()`: 关闭模态框
- `forceClose()`: 强制关闭
- `toggle()`: 切换状态
- `setConfig(config)`: 更新配置

**默认配置:**
- `closeOnEscape: true`
- `closeOnOutsideClick: true`
- `showCloseButton: true`
- `preventBodyScroll: true`
- `animationDuration: 300`

### 测试策略

1. **Mock useWalletContext**: 需要模拟 `isModalOpen`, `openModal`, `closeModal`
2. **测试分组**: 使用 describe 组织测试（返回值结构、默认配置、各方法、modalState、场景测试）
3. **act() 使用**: React state 更新需要包裹在 act() 中
4. **计数器行为**: close() 不重置 openCount，只有 open/openWithSource 增加

### 依赖关系

- `useWalletModalEnhanced` → `useWalletContext` → `BTCWalletProvider`
- 测试时需要 mock useWalletContext，不需要完整 Provider