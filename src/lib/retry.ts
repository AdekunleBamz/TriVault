interface RetryOptions {
  maxAttempts?: number
  delayMs?: number
  backoff?: 'linear' | 'exponential'
  maxDelayMs?: number
  onRetry?: (attempt: number, error: Error) => void
}

const DEFAULT_MAX_ATTEMPTS = 3
const DEFAULT_DELAY_MS = 1000
const DEFAULT_MAX_DELAY_MS = 30000

function calculateDelay(attempt: number, baseDelay: number, backoff: string, maxDelay: number): number {
  let delay: number
  if (backoff === 'exponential') {
    delay = baseDelay * Math.pow(2, attempt - 1)
  } else {
    delay = baseDelay * attempt
  }
  return Math.min(delay, maxDelay)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts || DEFAULT_MAX_ATTEMPTS
  const delayMs = options.delayMs || DEFAULT_DELAY_MS
  const backoff = options.backoff || 'exponential'
  const maxDelayMs = options.maxDelayMs || DEFAULT_MAX_DELAY_MS

  let lastError: Error = new Error('Unknown error')

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxAttempts) {
        throw lastError
      }

      const delay = calculateDelay(attempt, delayMs, backoff, maxDelayMs)
      options.onRetry?.(attempt, lastError)
      await sleep(delay)
    }
  }

  throw lastError
}

export function withRetry<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
): (...args: T) => Promise<R> {
  return (...args: T) => retry(() => fn(...args), options)
}
