/**
 * Unified error handling system.
 * Provides standardized error types, error codes, and error recovery mechanisms.
 *
 * @example
 * ```typescript
 * import { UnifiedError, ErrorFactory, ErrorCode } from '@btc-connect/core';
 *
 * try {
 *   await manager.connect('unisat');
 * } catch (error) {
 *   if (error instanceof UnifiedError) {
 *     console.log('Error code:', error.code);
 *     console.log('Severity:', error.severity);
 *     console.log('Full message:', error.getFullMessage());
 *     console.log('Can retry:', error.canRetry());
 *   }
 * }
 *
 * // Create errors using factory
 * const error = ErrorFactory.walletNotInstalled('unisat');
 * const error2 = ErrorFactory.transactionFailed('Insufficient fee');
 * ```
 */

// ===== 错误码枚举 =====

/**
 * Standardized error codes organized by category.
 * General errors (1xxx), Wallet errors (2xxx), Network errors (3xxx),
 * Transaction errors (4xxx), Signature errors (5xxx), Config errors (6xxx).
 */
export enum ErrorCode {
  // 通用错误 (1xxx)
  UNKNOWN_ERROR = '1000',
  INVALID_ARGUMENT = '1001',
  NOT_IMPLEMENTED = '1002',
  TIMEOUT = '1003',

  // 钱包错误 (2xxx)
  WALLET_NOT_INSTALLED = '2000',
  WALLET_NOT_CONNECTED = '2001',
  WALLET_CONNECTION_FAILED = '2002',
  WALLET_DISCONNECTED = '2003',
  WALLET_LOCKED = '2004',

  // 网络错误 (3xxx)
  NETWORK_ERROR = '3000',
  NETWORK_UNSUPPORTED = '3001',
  NETWORK_SWITCH_FAILED = '3002',

  // 交易错误 (4xxx)
  TRANSACTION_FAILED = '4000',
  TRANSACTION_REJECTED = '4001',
  TRANSACTION_TIMEOUT = '4002',
  INSUFFICIENT_BALANCE = '4003',
  INVALID_ADDRESS = '4004',
  INVALID_AMOUNT = '4005',

  // 签名错误 (5xxx)
  SIGNATURE_FAILED = '5000',
  SIGNATURE_REJECTED = '5001',

  // 配置错误 (6xxx)
  CONFIG_INVALID = '6000',
  CONFIG_MISSING = '6001',
}

// ===== 错误严重级别 =====

/**
 * Error severity levels for prioritization.
 */
export enum ErrorSeverity {
  LOW = 'low',       // 低级别，不影响核心功能
  MEDIUM = 'medium', // 中级别，影响部分功能
  HIGH = 'high',     // 高级别，影响核心功能
  CRITICAL = 'critical', // 严重级别，系统无法运行
}

// ===== 错误上下文信息 =====

export interface ErrorContext {
  // 钱包信息
  walletId?: string;
  walletName?: string;

  // 网络信息
  network?: string;
  chainId?: number;

  // 账户信息
  address?: string;
  publicKey?: string;

  // 交易信息
  txId?: string;
  txHash?: string;
  amount?: string;
  toAddress?: string;

  // 操作信息
  operation?: string;
  method?: string;
  params?: any;

  // 时间信息
  timestamp?: number;
  duration?: number;

  // 额外上下文
  metadata?: Record<string, any>;

  // 建议
  suggestion?: string;

  // 是否可重试
  retryable?: boolean;

  // 重试次数
  retryCount?: number;

  // 最大重试次数
  maxRetries?: number;
}

// ===== 统一错误类 =====

/**
 * Unified error class with structured error information.
 * Provides error code, severity, context, and retry capabilities.
 *
 * @example
 * ```typescript
 * const error = new UnifiedError(
 *   ErrorCode.WALLET_NOT_INSTALLED,
 *   'UniSat wallet not found',
 *   ErrorSeverity.HIGH,
 *   { walletId: 'unisat', suggestion: 'Install UniSat wallet' }
 * );
 *
 * console.log(error.getFullMessage());
 * console.log(error.canRetry());
 * ```
 */
export class UnifiedError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;
  public readonly timestamp: number;

  constructor(
    code: ErrorCode,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {},
    originalError?: Error
  ) {
    super(message);
    this.name = 'UnifiedError';
    this.code = code;
    this.severity = severity;
    this.context = {
      timestamp: Date.now(),
      retryable: true,
      retryCount: 0,
      maxRetries: 3,
      ...context,
    };
    this.originalError = originalError;
    this.timestamp = Date.now();

    // 保持堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnifiedError);
    }
  }

  // 获取完整错误信息
  getFullMessage(): string {
    const parts = [
      `[${this.code}] ${this.message}`,
      `Severity: ${this.severity}`,
    ];

    if (this.context.walletId) {
      parts.push(`Wallet: ${this.context.walletId}`);
    }

    if (this.context.network) {
      parts.push(`Network: ${this.context.network}`);
    }

    if (this.context.operation) {
      parts.push(`Operation: ${this.context.operation}`);
    }

    if (this.context.suggestion) {
      parts.push(`Suggestion: ${this.context.suggestion}`);
    }

    return parts.join(' | ');
  }

  // 转换为 JSON
  toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }

  // 创建重试版本错误
  withRetryCount(count: number): UnifiedError {
    return new UnifiedError(
      this.code,
      this.message,
      this.severity,
      {
        ...this.context,
        retryCount: count,
      },
      this.originalError
    );
  }

  // 是否可以重试
  canRetry(): boolean {
    return (
      this.context.retryable !== false &&
      (this.context.retryCount || 0) < (this.context.maxRetries || 3)
    );
  }
}

/**
 * Factory methods for creating common error types.
 * Provides convenient constructors for wallet, network, transaction, and signature errors.
 *
 * @example
 * ```typescript
 * // Wallet errors
 * const error1 = ErrorFactory.walletNotInstalled('unisat');
 * const error2 = ErrorFactory.walletConnectionFailed('okx', 'User rejected');
 *
 * // Transaction errors
 * const error3 = ErrorFactory.transactionFailed('Insufficient fee');
 * const error4 = ErrorFactory.insufficientBalance('1000', '500');
 *
 * // Signature errors
 * const error5 = ErrorFactory.signatureRejected('User denied');
 * ```
 */
export const ErrorFactory = {
  // 钱包错误
  walletNotInstalled: (walletId: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.WALLET_NOT_INSTALLED,
      `Wallet ${walletId} is not installed`,
      ErrorSeverity.HIGH,
      { walletId, ...context }
    ),

  walletNotConnected: (walletId: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.WALLET_NOT_CONNECTED,
      `Wallet ${walletId} is not connected`,
      ErrorSeverity.HIGH,
      { walletId, ...context }
    ),

  walletConnectionFailed: (walletId: string, reason: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.WALLET_CONNECTION_FAILED,
      `Failed to connect wallet ${walletId}: ${reason}`,
      ErrorSeverity.HIGH,
      { walletId, ...context }
    ),

  // 网络错误
  networkError: (network: string, reason: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.NETWORK_ERROR,
      `Network error on ${network}: ${reason}`,
      ErrorSeverity.MEDIUM,
      { network, ...context }
    ),

  networkUnsupported: (network: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.NETWORK_UNSUPPORTED,
      `Network ${network} is not supported`,
      ErrorSeverity.MEDIUM,
      { network, ...context }
    ),

  // 交易错误
  transactionFailed: (reason: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.TRANSACTION_FAILED,
      `Transaction failed: ${reason}`,
      ErrorSeverity.HIGH,
      context
    ),

  transactionRejected: (reason: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.TRANSACTION_REJECTED,
      `Transaction rejected: ${reason}`,
      ErrorSeverity.HIGH,
      context
    ),

  insufficientBalance: (required: string, available: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.INSUFFICIENT_BALANCE,
      `Insufficient balance: required ${required}, available ${available}`,
      ErrorSeverity.HIGH,
      context
    ),

  // 签名错误
  signatureFailed: (reason: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.SIGNATURE_FAILED,
      `Signature failed: ${reason}`,
      ErrorSeverity.HIGH,
      context
    ),

  signatureRejected: (reason: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.SIGNATURE_REJECTED,
      `Signature rejected: ${reason}`,
      ErrorSeverity.HIGH,
      context
    ),

  // 通用错误
  unknownError: (message: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.UNKNOWN_ERROR,
      message || 'Unknown error occurred',
      ErrorSeverity.HIGH,
      context
    ),

  invalidArgument: (param: string, expected: string, actual: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.INVALID_ARGUMENT,
      `Invalid argument ${param}: expected ${expected}, got ${actual}`,
      ErrorSeverity.MEDIUM,
      context
    ),

  notImplemented: (feature: string, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.NOT_IMPLEMENTED,
      `Feature ${feature} is not implemented`,
      ErrorSeverity.LOW,
      context
    ),

  timeout: (operation: string, timeout: number, context?: Partial<ErrorContext>) =>
    new UnifiedError(
      ErrorCode.TIMEOUT,
      `Operation ${operation} timed out after ${timeout}ms`,
      ErrorSeverity.HIGH,
      context
    ),
};