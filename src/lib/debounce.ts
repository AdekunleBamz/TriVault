/**
 * Debounce and Throttle utilities for performance optimization
 */

/**
 * Creates a debounced version of a function
 * Only executes after the specified delay has passed without new calls
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Creates a debounced function with cancel capability
 */
export function debounceWithCancel<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (lastArgs) {
        func(...lastArgs as Parameters<T>);
      }
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debouncedFn.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      func(...lastArgs as Parameters<T>);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFn;
}

/**
 * Creates a throttled version of a function
 * Executes at most once per specified interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args as Parameters<T>);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Creates a throttled function with trailing call option
 */
export function throttleWithTrailing<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= limit) {
      lastCall = now;
      func(...args as Parameters<T>);
    } else {
      lastArgs = args;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        if (lastArgs) {
          func(...lastArgs as Parameters<T>);
        }
        timeoutId = null;
        lastArgs = null;
      }, limit - timeSinceLastCall);
    }
  };
}

/**
 * Creates a leading-edge throttled function
 * Executes immediately on first call, then ignores calls for the duration
 */
export function throttleLeading<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args as Parameters<T>);
    }
  };
}

/**
 * Creates an async debounced function
 * Returns a promise that resolves with the function result
 */
export function debounceAsync<T extends (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: {
    resolve: (value: Awaited<ReturnType<T>>) => void;
    reject: (error: unknown) => void;
  } | null = null;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve, reject) => {
      pendingPromise = { resolve, reject };

      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          pendingPromise?.resolve(result);
        } catch (error) {
          pendingPromise?.reject(error);
        }
        timeoutId = null;
        pendingPromise = null;
      }, delay);
    });
  };
}

/**
 * Creates a function that only executes once
 */
export function once<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let called = false;
  let result: ReturnType<T>;

  return (...args: Parameters<T>) => {
    if (!called) {
      called = true;
      result = func(...args);
    }
    return result;
  };
}

/**
 * Creates a function with limited call count
 */
export function limited<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  maxCalls: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let callCount = 0;

  return (...args: Parameters<T>) => {
    if (callCount < maxCalls) {
      callCount++;
      return func(...args);
    }
    return undefined;
  };
}

/**
 * Rate limit helper - allows N calls per time window
 */
export function rateLimit<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  maxCalls: number,
  windowMs: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const calls: number[] = [];

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Remove calls outside the window
    while (calls.length > 0 && calls[0] < windowStart) {
      calls.shift();
    }

    if (calls.length < maxCalls) {
      calls.push(now);
      return func(...args);
    }

    return undefined;
  };
}
