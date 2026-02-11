/**
 * 错误处理类型定义
 * 包含错误类、错误码、错误上下文等
 */

import type { Network } from './base';

/** 错误严重级别 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/** 错误代码枚举 */
export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',

  // 钱包相关错误
  WALLET_NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',

  // 网络相关错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNSUPPORTED_NETWORK = 'UNSUPPORTED_NETWORK',
  NETWORK_SWITCH_FAILED = 'NETWORK_SWITCH_FAILED',

  // 操作相关错误
  SIGNATURE_ERROR = 'SIGNATURE_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // 配置相关错误
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
}

/** 错误上下文信息 */
export interface ErrorContext {
  walletId?: string;
  operation?: string;
  network?: Network;
  address?: string;
  timestamp: number;
  userAgent?: string;
  retryable?: boolean;
  suggestion?: string;
}

/** 错误处理器类型 */
export type ErrorHandler = (error: WalletError) => void;

/** 错误监听器接口 */
export interface ErrorListener {
  code: ErrorCode;
  handler: ErrorHandler;
}

/**
 * 增强的钱包错误基类
 */
export class WalletError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;

  constructor(
    message: string,
    public code: ErrorCode | string,
    context?: Partial<ErrorContext>,
    originalError?: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ) {
    super(message);
    this.name = 'WalletError';
    this.severity = severity;
    this.context = {
      timestamp: Date.now(),
      retryable: false,
      ...context,
    };
    this.originalError = originalError;
  }

  /**
   * 获取完整的错误信息
   */
  getFullMessage(): string {
    const parts = [this.message];

    if (this.context.walletId) {
      parts.push(`Wallet: ${this.context.walletId}`);
    }

    if (this.context.operation) {
      parts.push(`Operation: ${this.context.operation}`);
    }

    if (this.context.network) {
      parts.push(`Network: ${this.context.network}`);
    }

    if (this.context.suggestion) {
      parts.push(`Suggestion: ${this.context.suggestion}`);
    }

    return parts.join(' | ');
  }

  /**
   * 获取JSON序列化的错误信息
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
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
}

/**
 * 钱包未安装错误
 */
export class WalletNotInstalledError extends WalletError {
  constructor(walletId: string, context?: Partial<ErrorContext>) {
    super(
      `Wallet ${walletId} is not installed or not available`,
      ErrorCode.WALLET_NOT_INSTALLED,
      {
        walletId,
        operation: 'wallet_check',
        retryable: false,
        suggestion: `Please install ${walletId} wallet extension and refresh the page`,
        ...context,
      },
      undefined,
      ErrorSeverity.HIGH,
    );
    this.name = 'WalletNotInstalledError';
  }
}

/**
 * 钱包连接错误
 */
export class WalletConnectionError extends WalletError {
  constructor(
    walletId: string,
    message: string,
    context?: Partial<ErrorContext>,
    originalError?: Error,
  ) {
    super(
      message,
      ErrorCode.WALLET_CONNECTION_ERROR,
      {
        walletId,
        operation: 'connect',
        retryable: true,
        suggestion: 'Please try connecting again or check your wallet settings',
        ...context,
      },
      originalError,
      ErrorSeverity.HIGH,
    );
    this.name = 'WalletConnectionError';
  }
}

/**
 * 钱包断开连接错误
 */
export class WalletDisconnectedError extends WalletError {
  constructor(walletId: string, context?: Partial<ErrorContext>) {
    super(
      `Wallet ${walletId} is disconnected`,
      ErrorCode.WALLET_DISCONNECTED,
      {
        walletId,
        operation: 'disconnect',
        retryable: false,
        suggestion: 'Please reconnect your wallet to continue',
        ...context,
      },
      undefined,
      ErrorSeverity.MEDIUM,
    );
    this.name = 'WalletDisconnectedError';
  }
}

/**
 * 网络错误
 */
export class NetworkError extends WalletError {
  constructor(
    message: string,
    network?: Network,
    context?: Partial<ErrorContext>,
    originalError?: Error,
  ) {
    super(
      `Network error: ${message}`,
      ErrorCode.NETWORK_ERROR,
      {
        network,
        operation: 'network',
        retryable: true,
        suggestion: 'Please check your network connection or try switching networks',
        ...context,
      },
      originalError,
      ErrorSeverity.MEDIUM,
    );
    this.name = 'NetworkError';
  }
}

/**
 * 签名错误
 */
export class SignatureError extends WalletError {
  constructor(
    message: string,
    context?: Partial<ErrorContext>,
    originalError?: Error,
  ) {
    super(
      `Signature error: ${message}`,
      ErrorCode.SIGNATURE_ERROR,
      {
        operation: 'sign',
        retryable: false,
        suggestion: 'Please check the message format and try again',
        ...context,
      },
      originalError,
      ErrorSeverity.HIGH,
    );
    this.name = 'SignatureError';
  }
}

/**
 * 交易错误
 */
export class TransactionError extends WalletError {
  constructor(
    message: string,
    _txid?: string,
    context?: Partial<ErrorContext>,
    originalError?: Error,
  ) {
    super(
      `Transaction error: ${message}`,
      ErrorCode.TRANSACTION_ERROR,
      {
        operation: 'transaction',
        retryable: true,
        suggestion: 'Please check the transaction details and try again',
        ...context,
      },
      originalError,
      ErrorSeverity.HIGH,
    );
    this.name = 'TransactionError';
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends WalletError {
  constructor(
    operation: string,
    timeout: number,
    context?: Partial<ErrorContext>,
  ) {
    super(
      `Operation timeout: ${operation} took longer than ${timeout}ms`,
      ErrorCode.TIMEOUT_ERROR,
      {
        operation,
        retryable: true,
        suggestion: 'Please try again or check your network connection',
        ...context,
      },
      undefined,
      ErrorSeverity.MEDIUM,
    );
    this.name = 'TimeoutError';
  }
}

/**
 * 配置错误
 */
export class ConfigurationError extends WalletError {
  constructor(message: string, context?: Partial<ErrorContext>) {
    super(
      `Configuration error: ${message}`,
      ErrorCode.CONFIGURATION_ERROR,
      {
        operation: 'configuration',
        retryable: false,
        suggestion: 'Please check your wallet configuration',
        ...context,
      },
      undefined,
      ErrorSeverity.CRITICAL,
    );
    this.name = 'ConfigurationError';
  }
}

/** 错误处理器管理器 */
export class ErrorHandlerManager {
  private handlers: Map<string, ErrorHandler[]> = new Map();

  /**
   * 注册错误处理器
   */
  register(errorCode: string, handler: ErrorHandler): void {
    if (!this.handlers.has(errorCode)) {
      this.handlers.set(errorCode, []);
    }
    this.handlers.get(errorCode)?.push(handler);
  }

  /**
   * 移除错误处理器
   */
  unregister(errorCode: string, handler: ErrorHandler): void {
    const handlers = this.handlers.get(errorCode);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 处理错误
   */
  handleError(error: WalletError): void {
    const handlers = this.handlers.get(error.code);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(error);
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError);
        }
      });
    }

    // 默认错误处理
    console.error('Wallet Error:', error.getFullMessage());

    // 在开发环境中输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error.toJSON());
    }
  }
}
