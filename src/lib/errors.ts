/**
 * Error handling utilities for TriVault
 */

// Error codes and messages
export const ERROR_MESSAGES: Record<string, string> = {
  USER_REJECTED: 'Transaction was rejected by user',
  INSUFFICIENT_FUNDS: 'Insufficient funds to complete transaction',
  NETWORK_ERROR: 'Network error. Please check your connection',
  CONTRACT_ERROR: 'Smart contract error occurred',
  UNKNOWN_ERROR: 'An unexpected error occurred',
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  WRONG_NETWORK: 'Please switch to Base network',
  TRANSACTION_FAILED: 'Transaction failed. Please try again',
  GAS_ESTIMATION_FAILED: 'Failed to estimate gas',
  TIMEOUT: 'Request timed out. Please try again',
  RATE_LIMITED: 'Too many requests. Please wait a moment',
};

// Error code type
export type ErrorCode = keyof typeof ERROR_MESSAGES;

/**
 * Custom application error
 */
export class TriVaultError extends Error {
  public code: ErrorCode;
  public originalError?: Error;

  constructor(code: ErrorCode, originalError?: Error) {
    super(ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR);
    this.name = 'TriVaultError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Parse error from wallet/contract interactions
 */
export function parseWalletError(error: unknown): TriVaultError {
  if (error instanceof TriVaultError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const originalError = error instanceof Error ? error : new Error(String(error));

  // User rejection
  if (
    errorMessage.includes('user rejected') ||
    errorMessage.includes('user denied') ||
    errorMessage.includes('rejected the request')
  ) {
    return new TriVaultError('USER_REJECTED', originalError);
  }

  // Insufficient funds
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance')
  ) {
    return new TriVaultError('INSUFFICIENT_FUNDS', originalError);
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('fetch')
  ) {
    return new TriVaultError('NETWORK_ERROR', originalError);
  }

  // Wrong network
  if (
    errorMessage.includes('wrong network') ||
    errorMessage.includes('chain mismatch') ||
    errorMessage.includes('unsupported chain')
  ) {
    return new TriVaultError('WRONG_NETWORK', originalError);
  }

  // Gas estimation
  if (errorMessage.includes('gas')) {
    return new TriVaultError('GAS_ESTIMATION_FAILED', originalError);
  }

  // Timeout
  if (errorMessage.includes('timeout')) {
    return new TriVaultError('TIMEOUT', originalError);
  }

  // Rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
    return new TriVaultError('RATE_LIMITED', originalError);
  }

  // Default to unknown error
  return new TriVaultError('UNKNOWN_ERROR', originalError);
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof TriVaultError) {
    return error.message;
  }

  const parsed = parseWalletError(error);
  return parsed.message;
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const parsed = parseWalletError(error);
  
  console.error('[TriVault Error]', {
    code: parsed.code,
    message: parsed.message,
    originalError: parsed.originalError,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  const parsed = parseWalletError(error);
  
  const recoverableCodes: ErrorCode[] = [
    'USER_REJECTED',
    'NETWORK_ERROR',
    'TIMEOUT',
    'RATE_LIMITED',
  ];
  
  return recoverableCodes.includes(parsed.code);
}

/**
 * Create error boundary fallback props
 */
export function createErrorFallbackProps(error: Error, resetFn: () => void) {
  const parsed = parseWalletError(error);
  
  return {
    title: 'Something went wrong',
    message: parsed.message,
    canRetry: isRecoverableError(error),
    onRetry: resetFn,
    errorCode: parsed.code,
  };
}
