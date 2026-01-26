'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Throttle a value - only update at most once per delay period
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastExecuted.current >= delay) {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }
    }, delay - (Date.now() - lastExecuted.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
}

/**
 * Create a throttled callback function
 */
export function useThrottleCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const lastExecuted = useRef(0);
  const trailingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<unknown[] | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (trailingTimeoutRef.current) {
        clearTimeout(trailingTimeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      const remaining = delay - (now - lastExecuted.current);

      lastArgsRef.current = args;

      if (remaining <= 0) {
        // Execute immediately
        lastExecuted.current = now;
        if (trailingTimeoutRef.current) {
          clearTimeout(trailingTimeoutRef.current);
          trailingTimeoutRef.current = null;
        }
        callback(...args);
      } else if (!trailingTimeoutRef.current) {
        // Schedule trailing call
        trailingTimeoutRef.current = setTimeout(() => {
          lastExecuted.current = Date.now();
          trailingTimeoutRef.current = null;
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
          }
        }, remaining);
      }
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...deps]
  );
}

interface ThrottleOptions {
  leading?: boolean; // Execute on leading edge
  trailing?: boolean; // Execute on trailing edge
}

/**
 * Create a throttled function with leading/trailing options
 */
export function useThrottleFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
  options: ThrottleOptions = { leading: true, trailing: true }
): { run: T; cancel: () => void; flush: () => void } {
  const { leading = true, trailing = true } = options;

  const fnRef = useRef(fn);
  const lastExecuted = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<unknown[] | null>(null);
  const pendingRef = useRef(false);

  // Keep fn ref updated
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingRef.current = false;
    lastArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (pendingRef.current && lastArgsRef.current) {
      fnRef.current(...lastArgsRef.current);
      lastExecuted.current = Date.now();
    }
    cancel();
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  const run = useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      const remaining = delay - (now - lastExecuted.current);

      lastArgsRef.current = args;

      if (remaining <= 0 || remaining > delay) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        if (leading) {
          lastExecuted.current = now;
          fnRef.current(...args);
          pendingRef.current = false;
        } else {
          pendingRef.current = true;
        }
      } else if (!timeoutRef.current && trailing) {
        pendingRef.current = true;
        timeoutRef.current = setTimeout(() => {
          lastExecuted.current = leading ? Date.now() : 0;
          timeoutRef.current = null;
          if (pendingRef.current && lastArgsRef.current) {
            fnRef.current(...lastArgsRef.current);
            pendingRef.current = false;
          }
        }, remaining);
      }
    }) as T,
    [delay, leading, trailing]
  );

  return { run, cancel, flush };
}

export default useThrottle;
