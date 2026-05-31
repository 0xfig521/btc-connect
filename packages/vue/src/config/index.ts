/**
 * Configuration management system
 *
 * Provides unified configuration management for themes, networks, feature toggles,
 * and other wallet settings. Supports reactive updates and validation.
 */

import type { ModalConfig } from '@btc-connect/core';
import { type Ref, ref } from 'vue';

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Component size type
 */
export type ComponentSize = 'sm' | 'md' | 'lg';

/**
 * Component variant type
 */
export type ComponentVariant = 'select' | 'button' | 'compact';

/**
 * Animation type
 */
export type AnimationType = 'scale' | 'fade' | 'slide' | 'none';

/**
 * Network type
 */
export type NetworkType = 'livenet' | 'testnet' | 'regtest';

/**
 * Feature toggle configuration
 */
export interface FeatureConfig {
  /** 是否显示余额 */
  balance: boolean;
  /** 是否启用交易功能 */
  transactions: boolean;
  /** 是否启用网络切换 */
  networkSwitch: boolean;
  /** 是否显示测试网络 */
  showTestnet: boolean;
  /** 是否显示回归测试网络 */
  showRegtest: boolean;
  /** 是否启用自动连接 */
  autoConnect: boolean;
  /** 是否启用性能监控 */
  performanceMonitor: boolean;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** 主题模式 */
  mode: ThemeMode;
  /** 自定义主题颜色 */
  colors?: Record<string, string>;
  /** 是否跟随系统主题 */
  followSystem: boolean;
}

/**
 * Wallet configuration
 */
export interface WalletConfig {
  /** 钱包排序 */
  order: string[];
  /** 特色钱包列表 */
  featured: string[];
  /** 隐藏的钱包列表 */
  hidden: string[];
}

/**
 * UI configuration
 */
export interface UIConfig {
  /** 默认组件尺寸 */
  size: ComponentSize;
  /** 默认组件变体 */
  variant: ComponentVariant;
  /** 动画类型 */
  animation: AnimationType;
  /** 连接超时时间（毫秒） */
  connectTimeout: number;
  /** 模态框配置 */
  modalConfig?: ModalConfig;
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  /** 是否启用缓存 */
  enableCache: boolean;
  /** 缓存过期时间（毫秒） */
  cacheExpireTime: number;
  /** 钱包检测间隔（毫秒） */
  walletDetectionInterval: number;
  /** 钱包检测超时（毫秒） */
  walletDetectionTimeout: number;
  /** 状态更新节流时间（毫秒） */
  stateUpdateThrottle: number;
}

/**
 * Development configuration
 */
export interface DevConfig {
  /** 是否启用调试模式 */
  debug: boolean;
  /** 是否显示性能指标 */
  showPerformanceMetrics: boolean;
  /** 是否启用详细日志 */
  verboseLogging: boolean;
}

/**
 * Complete Vue configuration interface
 */
export interface VueConfig {
  /** 主题配置 */
  theme: ThemeConfig;
  /** 钱包配置 */
  wallets: WalletConfig;
  /** UI 配置 */
  ui: UIConfig;
  /** 功能开关 */
  features: FeatureConfig;
  /** 性能配置 */
  performance: PerformanceConfig;
  /** 开发配置 */
  dev: DevConfig;
}

/**
 * Default configuration values
 */
export const defaultConfig: VueConfig = {
  theme: {
    mode: 'light',
    followSystem: true,
  },
  wallets: {
    order: ['unisat', 'okx', 'xverse'],
    featured: ['unisat', 'okx'],
    hidden: [],
  },
  ui: {
    size: 'md',
    variant: 'select',
    animation: 'scale',
    connectTimeout: 10000,
  },
  features: {
    balance: true,
    transactions: true,
    networkSwitch: true,
    showTestnet: false,
    showRegtest: false,
    autoConnect: true,
    performanceMonitor: false,
  },
  performance: {
    enableCache: true,
    cacheExpireTime: 5 * 60 * 1000, // 5分钟
    walletDetectionInterval: 300,
    walletDetectionTimeout: 20000,
    stateUpdateThrottle: 100,
  },
  dev: {
    debug: process.env.NODE_ENV === 'development',
    showPerformanceMetrics: false,
    verboseLogging: process.env.NODE_ENV === 'development',
  },
};

/**
 * Merge configuration objects deeply
 *
 * @param base - Base configuration object
 * @param overrides - Override values
 * @returns Merged configuration
 *
 * @example
 * ```typescript
 * import { mergeConfig, defaultConfig } from '@btc-connect/vue';
 *
 * const customConfig = mergeConfig(defaultConfig, {
 *   theme: { mode: 'dark' },
 *   wallets: { featured: ['unisat'] }
 * });
 * ```
 */
export function mergeConfig<T extends Record<string, any>>(
  base: T,
  overrides: Partial<T>,
): T {
  const result = { ...base };

  for (const key in overrides) {
    const value = overrides[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = mergeConfig((result[key] || {}) as any, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Configuration validator class
 *
 * Validates configuration values and throws errors for invalid settings.
 */
export class ConfigValidator {
  static validateThemeConfig(config: ThemeConfig): void {
    const validModes: ThemeMode[] = ['light', 'dark', 'auto'];
    if (!validModes.includes(config.mode)) {
      throw new Error(
        `Invalid theme mode: ${config.mode}. Must be one of: ${validModes.join(', ')}`,
      );
    }
  }

  static validateWalletConfig(config: WalletConfig): void {
    if (!Array.isArray(config.order)) {
      throw new Error('Wallet order must be an array');
    }

    if (!Array.isArray(config.featured)) {
      throw new Error('Featured wallets must be an array');
    }
  }

  static validateUIConfig(config: UIConfig): void {
    const validSizes: ComponentSize[] = ['sm', 'md', 'lg'];
    const validVariants: ComponentVariant[] = ['select', 'button', 'compact'];
    const validAnimations: AnimationType[] = ['scale', 'fade', 'slide', 'none'];

    if (!validSizes.includes(config.size)) {
      throw new Error(
        `Invalid size: ${config.size}. Must be one of: ${validSizes.join(', ')}`,
      );
    }

    if (!validVariants.includes(config.variant)) {
      throw new Error(
        `Invalid variant: ${config.variant}. Must be one of: ${validVariants.join(', ')}`,
      );
    }

    if (!validAnimations.includes(config.animation)) {
      throw new Error(
        `Invalid animation: ${config.animation}. Must be one of: ${validAnimations.join(', ')}`,
      );
    }

    if (config.connectTimeout <= 0) {
      throw new Error('Connect timeout must be greater than 0');
    }
  }

  static validatePerformanceConfig(config: PerformanceConfig): void {
    if (config.cacheExpireTime <= 0) {
      throw new Error('Cache expire time must be greater than 0');
    }

    if (config.walletDetectionInterval <= 0) {
      throw new Error('Wallet detection interval must be greater than 0');
    }

    if (config.walletDetectionTimeout <= 0) {
      throw new Error('Wallet detection timeout must be greater than 0');
    }

    if (config.stateUpdateThrottle < 0) {
      throw new Error('State update throttle must be non-negative');
    }
  }

  static validateConfig(config: Partial<VueConfig>): void {
    if (config.theme) {
      ConfigValidator.validateThemeConfig(config.theme);
    }

    if (config.wallets) {
      ConfigValidator.validateWalletConfig(config.wallets);
    }

    if (config.ui) {
      ConfigValidator.validateUIConfig(config.ui);
    }

    if (config.performance) {
      ConfigValidator.validatePerformanceConfig(config.performance);
    }
  }
}

/**
 * Create a reactive configuration manager
 *
 * Provides a reactive configuration system with validation, updates, and reset functionality.
 *
 * @param initialConfig - Initial configuration overrides
 * @returns Configuration manager with reactive config and methods
 * @returns {Ref<VueConfig>} returns.config - Reactive configuration object
 * @returns {(updates: Partial<VueConfig>) => void} returns.updateConfig - Update configuration
 * @returns {() => void} returns.resetConfig - Reset to default configuration
 * @returns {() => ThemeConfig} returns.getThemeConfig - Get theme configuration
 * @returns {() => WalletConfig} returns.getWalletConfig - Get wallet configuration
 * @returns {() => UIConfig} returns.getUIConfig - Get UI configuration
 * @returns {() => FeatureConfig} returns.getFeatureConfig - Get feature configuration
 * @returns {() => PerformanceConfig} returns.getPerformanceConfig - Get performance configuration
 * @returns {() => DevConfig} returns.getDevConfig - Get development configuration
 *
 * @example
 * ```typescript
 * import { createConfigManager } from '@btc-connect/vue';
 *
 * const configManager = createConfigManager({
 *   theme: { mode: 'dark' },
 *   features: { autoConnect: false }
 * });
 *
 * // Update configuration
 * configManager.updateConfig({ theme: { mode: 'light' } });
 *
 * // Get specific config
 * const themeConfig = configManager.getThemeConfig();
 * console.log('Theme:', themeConfig.mode);
 *
 * // Reset to defaults
 * configManager.resetConfig();
 * ```
 */
export function createConfigManager(initialConfig?: Partial<VueConfig>) {
  // 合并配置
  const config = ref<VueConfig>(
    mergeConfig(defaultConfig, initialConfig || {}),
  ) as Ref<VueConfig>;

  // 更新配置
  function updateConfig(updates: Partial<VueConfig>): void {
    // 验证配置
    ConfigValidator.validateConfig(updates);

    // 合并更新
    config.value = mergeConfig(config.value, updates);

    // 开发模式下输出日志
    if (config.value.dev.debug) {
      console.log('🔧 [Config] Configuration updated:', updates);
    }
  }

  // 重置配置
  function resetConfig(): void {
    config.value = { ...defaultConfig };

    if (config.value.dev.debug) {
      console.log('🔄 [Config] Configuration reset to defaults');
    }
  }

  // 获取特定配置
  function getThemeConfig(): ThemeConfig {
    return config.value.theme;
  }

  function getWalletConfig(): WalletConfig {
    return config.value.wallets;
  }

  function getUIConfig(): UIConfig {
    return config.value.ui;
  }

  function getFeatureConfig(): FeatureConfig {
    return config.value.features;
  }

  function getPerformanceConfig(): PerformanceConfig {
    return config.value.performance;
  }

  function getDevConfig(): DevConfig {
    return config.value.dev;
  }

  return {
    config,
    updateConfig,
    resetConfig,
    getThemeConfig,
    getWalletConfig,
    getUIConfig,
    getFeatureConfig,
    getPerformanceConfig,
    getDevConfig,
  };
}

/**
 * Configuration manager type
 */
export type ConfigManager = ReturnType<typeof createConfigManager>;

/**
 * Global configuration instance (singleton)
 */
let globalConfigManager: ConfigManager | null = null;

/**
 * Get or create the global configuration manager
 *
 * @returns Global configuration manager instance
 *
 * @example
 * ```typescript
 * import { useConfig } from '@btc-connect/vue';
 *
 * const config = useConfig();
 * console.log('Theme:', config.getThemeConfig().mode);
 * ```
 */
export function useConfig(): ConfigManager {
  if (!globalConfigManager) {
    globalConfigManager = createConfigManager();
  }

  return globalConfigManager;
}

/**
 * Initialize global configuration with custom settings
 *
 * @param config - Configuration overrides
 * @returns Configuration manager instance
 *
 * @example
 * ```typescript
 * import { initGlobalConfig } from '@btc-connect/vue';
 *
 * // Initialize before using any wallet components
 * initGlobalConfig({
 *   theme: { mode: 'auto', followSystem: true },
 *   features: { showTestnet: true }
 * });
 * ```
 */
export function initGlobalConfig(config?: Partial<VueConfig>): ConfigManager {
  globalConfigManager = createConfigManager(config);
  return globalConfigManager;
}
