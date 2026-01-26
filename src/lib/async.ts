/**
 * Async utility functions
 */

/**
 * Wait for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for next animation frame
 */
export function nextFrame(): Promise<number> {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

/**
 * Wait for next tick (microtask)
 */
export function nextTick(): Promise<void> {
  return Promise.resolve();
}

/**
 * Execute promises in sequence
 */
export async function sequence<T>(
  tasks: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

/**
 * Execute promises with concurrency limit
 */
export async function parallel<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const p = Promise.resolve().then(() => task()).then((result) => {
      results[i] = result;
    });

    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((e) => e === p),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError: Error = new Error('Timeout')
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(timeoutError), ms);
  });

  return Promise.race([promise, timeout]);
}

/**
 * Wrap promise to never reject (returns error as value)
 */
export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<[T, null] | [null, E]> {
  try {
    const result = await promise;
    return [result, null];
  } catch (error) {
    return [null, error as E];
  }
}

/**
 * Create a deferred promise
 */
export function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Execute callback when idle (requestIdleCallback polyfill)
 */
export function whenIdle(callback: () => void, timeout: number = 1000): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * Create a mutex lock
 */
export function createMutex() {
  let locked = false;
  const queue: (() => void)[] = [];

  const acquire = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!locked) {
        locked = true;
        resolve();
      } else {
        queue.push(resolve);
      }
    });
  };

  const release = () => {
    const next = queue.shift();
    if (next) {
      next();
    } else {
      locked = false;
    }
  };

  return { acquire, release };
}

/**
 * Poll until condition is true
 */
export async function pollUntil(
  condition: () => boolean | Promise<boolean>,
  options: { interval?: number; timeout?: number } = {}
): Promise<void> {
  const { interval = 100, timeout = 30000 } = options;
  const startTime = Date.now();

  while (true) {
    if (await condition()) {
      return;
    }

    if (Date.now() - startTime > timeout) {
      throw new Error('Polling timeout');
    }

    await sleep(interval);
  }
}

/**
 * Create cancelable promise
 */
export function makeCancelable<T>(promise: Promise<T>) {
  let canceled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then((val) => {
        if (!canceled) resolve(val);
      })
      .catch((error) => {
        if (!canceled) reject(error);
      });
  });

  return {
    promise: wrappedPromise,
    cancel: () => {
      canceled = true;
    },
  };
}

/**
 * Memoize async function
 */
export function memoizeAsync<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
) {
  const cache = new Map<string, T>();
  const pending = new Map<string, Promise<T>>();

  return async (...args: Args): Promise<T> => {
    const key = keyFn(...args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    if (pending.has(key)) {
      return pending.get(key)!;
    }

    const promise = fn(...args);
    pending.set(key, promise);

    try {
      const result = await promise;
      cache.set(key, result);
      return result;
    } finally {
      pending.delete(key);
    }
  };
}
