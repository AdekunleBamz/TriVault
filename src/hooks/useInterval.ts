'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook for running a callback at regular intervals
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Hook for running a callback at intervals with pause/resume control
 */
export function useControllableInterval(
  callback: () => void,
  delay: number
): {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
} {
  const [isRunning, setIsRunning] = useState(false);
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => savedCallback.current(), delay);
  }, [delay]);

  const stop = useCallback(() => {
    if (!intervalRef.current) return;
    setIsRunning(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { start, stop, isRunning };
}

/**
 * Hook for running a callback after a delay
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * Hook for running a timeout with reset capability
 */
export function useResettableTimeout(
  callback: () => void,
  delay: number
): {
  reset: () => void;
  clear: () => void;
} {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    timeoutRef.current = setTimeout(() => savedCallback.current(), delay);
  }, [delay, clear]);

  useEffect(() => {
    return clear;
  }, [clear]);

  return { reset, clear };
}

/**
 * Hook that returns a counter that increments at a given interval
 */
export function useIntervalCounter(
  interval: number,
  options?: {
    start?: number;
    end?: number;
    loop?: boolean;
    autoStart?: boolean;
  }
): {
  count: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  isRunning: boolean;
} {
  const { start: startValue = 0, end, loop = false, autoStart = true } = options || {};
  
  const [count, setCount] = useState(startValue);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        const next = prev + 1;
        if (end !== undefined && next >= end) {
          if (loop) {
            return startValue;
          }
          stop();
          return end;
        }
        return next;
      });
    }, interval);
  }, [interval, end, loop, startValue, stop]);

  const reset = useCallback(() => {
    stop();
    setCount(startValue);
  }, [startValue, stop]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoStart, start]);

  return { count, start, stop, reset, isRunning };
}

/**
 * Hook for polling data at regular intervals
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
} {
  const { enabled = true, onSuccess, onError } = options || {};
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [fetchFn, onSuccess, onError]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchFnRef.current();
      setData(result);
      setError(null);
      onSuccessRef.current?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onErrorRef.current?.(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    refetch();
    const id = setInterval(refetch, interval);
    return () => clearInterval(id);
  }, [enabled, interval, refetch]);

  return { data, error, isLoading, refetch };
}
