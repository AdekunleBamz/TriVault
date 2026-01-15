'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

interface UseAsyncReturn<T, P extends unknown[]> extends UseAsyncState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing async operations with loading/error states
 */
export function useAsync<T, P extends unknown[] = []>(
  asyncFunction: (...params: P) => Promise<T>,
  immediate = false
): UseAsyncReturn<T, P> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
  });

  const isMounted = useRef(true);

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFunction(...params);
        if (isMounted.current) {
          setState({ data: result, error: null, isLoading: false });
        }
        return result;
      } catch (error) {
        if (isMounted.current) {
          const err = error instanceof Error ? error : new Error(String(error));
          setState({ data: null, error: err, isLoading: false });
        }
        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return { ...state, execute, reset };
}

/**
 * Hook for polling data at intervals
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number,
  enabled = true
): UseAsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFn();
      if (isMounted.current) {
        setState({ data: result, error: null, isLoading: false });
      }
    } catch (error) {
      if (isMounted.current) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState((prev) => ({ ...prev, error: err, isLoading: false }));
      }
    }
  }, [fetchFn]);

  useEffect(() => {
    isMounted.current = true;

    if (!enabled) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    fetchData();

    const interval = setInterval(fetchData, intervalMs);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchData, intervalMs, enabled]);

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

/**
 * Hook for retry logic
 */
export function useRetry<T>(
  asyncFn: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): UseAsyncState<T> & {
  execute: () => Promise<T | null>;
  retryCount: number;
} {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (): Promise<T | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    setRetryCount(0);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFn();
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (error) {
        setRetryCount(attempt);

        if (attempt === maxRetries) {
          const err = error instanceof Error ? error : new Error(String(error));
          setState({ data: null, error: err, isLoading: false });
          return null;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    return null;
  }, [asyncFn, maxRetries, retryDelay]);

  return { ...state, execute, retryCount };
}
