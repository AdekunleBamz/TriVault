'use client';

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type DependencyList,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  status: AsyncStatus;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface AsyncActions<T, TArgs extends unknown[]> {
  execute: (...args: TArgs) => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: Error) => void;
}

export type UseAsyncReturn<T, TArgs extends unknown[]> = AsyncState<T> &
  AsyncActions<T, TArgs>;

export interface UseAsyncOptions<T> {
  /** Initial data value */
  initialData?: T;
  /** Execute immediately on mount */
  immediate?: boolean;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Callback when execution starts */
  onLoading?: () => void;
  /** Callback when state is reset */
  onReset?: () => void;
  /** Retry configuration */
  retry?: {
    count: number;
    delay?: number;
    exponential?: boolean;
  };
  /** Abort previous request when new one starts */
  abortPrevious?: boolean;
}

export interface UseDeferredOptions<T> {
  initialData?: T;
  delay?: number;
}

export interface UsePollingOptions<T> extends UseAsyncOptions<T> {
  interval: number;
  enabled?: boolean;
  retryOnError?: boolean;
}

// ============================================================================
// useAsync Hook
// ============================================================================

/**
 * Hook for managing async operation state
 */
export function useAsync<T, TArgs extends unknown[] = []>(
  asyncFn: (...args: TArgs) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, TArgs> {
  const {
    initialData,
    immediate = false,
    onSuccess,
    onError,
    onLoading,
    onReset,
    retry,
    abortPrevious = true,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    error: undefined,
    status: 'idle',
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const executionCountRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const setStatus = useCallback((status: AsyncStatus) => {
    setState((prev) => ({
      ...prev,
      status,
      isIdle: status === 'idle',
      isLoading: status === 'loading',
      isSuccess: status === 'success',
      isError: status === 'error',
    }));
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<T> => {
      // Abort previous request if configured
      if (abortPrevious && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const executionId = ++executionCountRef.current;

      setStatus('loading');
      onLoading?.();

      let lastError: Error | undefined;
      const maxAttempts = retry ? retry.count + 1 : 1;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          // Check if this execution is still current
          if (executionId !== executionCountRef.current) {
            throw new Error('Execution cancelled');
          }

          const result = await asyncFn(...args);

          // Check if component is still mounted and execution is current
          if (!mountedRef.current || executionId !== executionCountRef.current) {
            throw new Error('Execution cancelled');
          }

          setState({
            data: result,
            error: undefined,
            status: 'success',
            isIdle: false,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
          onSuccess?.(result);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Don't retry if cancelled or aborted
          if (lastError.message === 'Execution cancelled' || controller.signal.aborted) {
            throw lastError;
          }

          // Retry with delay if configured
          if (attempt < maxAttempts - 1 && retry) {
            const delay = retry.exponential
              ? (retry.delay ?? 1000) * Math.pow(2, attempt)
              : retry.delay ?? 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      // All attempts failed
      if (mountedRef.current && executionId === executionCountRef.current) {
        setState({
          data: undefined,
          error: lastError,
          status: 'error',
          isIdle: false,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });
        onError?.(lastError!);
      }
      throw lastError;
    },
    [asyncFn, onSuccess, onError, onLoading, retry, abortPrevious, setStatus]
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({
      data: initialData,
      error: undefined,
      status: 'idle',
      isIdle: true,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
    onReset?.();
  }, [initialData, onReset]);

  const setData = useCallback((data: T) => {
    setState((prev) => ({
      ...prev,
      data,
      status: 'success',
      isIdle: false,
      isLoading: false,
      isSuccess: true,
      isError: false,
    }));
  }, []);

  const setError = useCallback((error: Error) => {
    setState((prev) => ({
      ...prev,
      error,
      status: 'error',
      isIdle: false,
      isLoading: false,
      isSuccess: false,
      isError: true,
    }));
  }, []);

  // Execute immediately if configured
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as TArgs));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

// ============================================================================
// useAsyncEffect Hook
// ============================================================================

/**
 * Hook for async effects with automatic cleanup
 */
export function useAsyncEffect<T>(
  asyncFn: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  options: UseAsyncOptions<T> = {}
): AsyncState<T> {
  const { onSuccess, onError, onLoading, retry } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: options.initialData,
    error: undefined,
    status: 'idle',
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const run = async () => {
      setState((prev) => ({
        ...prev,
        status: 'loading',
        isIdle: false,
        isLoading: true,
        isSuccess: false,
        isError: false,
      }));
      onLoading?.();

      let lastError: Error | undefined;
      const maxAttempts = retry ? retry.count + 1 : 1;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const result = await asyncFn(controller.signal);

          if (mounted && !controller.signal.aborted) {
            setState({
              data: result,
              error: undefined,
              status: 'success',
              isIdle: false,
              isLoading: false,
              isSuccess: true,
              isError: false,
            });
            onSuccess?.(result);
          }
          return;
        } catch (error) {
          if (controller.signal.aborted) return;
          lastError = error instanceof Error ? error : new Error(String(error));

          if (attempt < maxAttempts - 1 && retry) {
            const delay = retry.exponential
              ? (retry.delay ?? 1000) * Math.pow(2, attempt)
              : retry.delay ?? 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      if (mounted && !controller.signal.aborted) {
        setState({
          data: undefined,
          error: lastError,
          status: 'error',
          isIdle: false,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });
        onError?.(lastError!);
      }
    };

    run();

    return () => {
      mounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

// ============================================================================
// useDeferred Hook
// ============================================================================

/**
 * Hook for deferred values with loading state
 */
export function useDeferred<T>(
  value: T,
  options: UseDeferredOptions<T> = {}
): { value: T; isPending: boolean } {
  const { delay = 300 } = options;
  const [deferredValue, setDeferredValue] = useState(value);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (value === deferredValue) {
      setIsPending(false);
      return;
    }

    setIsPending(true);

    timeoutRef.current = setTimeout(() => {
      setDeferredValue(value);
      setIsPending(false);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, deferredValue]);

  return { value: deferredValue, isPending };
}

// ============================================================================
// usePolling Hook
// ============================================================================

/**
 * Hook for polling async operations
 */
export function usePolling<T>(
  asyncFn: () => Promise<T>,
  options: UsePollingOptions<T>
): AsyncState<T> & { stop: () => void; start: () => void } {
  const { interval, enabled = true, retryOnError = false, ...asyncOptions } = options;

  const [isPolling, setIsPolling] = useState(enabled);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const mountedRef = useRef(true);

  const asyncState = useAsync(asyncFn, asyncOptions);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isPolling) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Execute immediately
    asyncState.execute();

    // Set up polling
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      
      // Skip if previous request is still loading
      if (asyncState.isLoading) return;
      
      // Skip if error and retryOnError is false
      if (asyncState.isError && !retryOnError) return;
      
      asyncState.execute();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPolling, interval, retryOnError]);

  const stop = useCallback(() => {
    setIsPolling(false);
  }, []);

  const start = useCallback(() => {
    setIsPolling(true);
  }, []);

  return {
    ...asyncState,
    stop,
    start,
  };
}

// ============================================================================
// useMutation Hook
// ============================================================================

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | undefined, variables: TVariables) => void;
}

/**
 * Hook for mutation operations (like POST, PUT, DELETE)
 */
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
) {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<{
    data: TData | undefined;
    error: Error | undefined;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
  }>({
    data: undefined,
    error: undefined,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState({
        data: undefined,
        error: undefined,
        isLoading: true,
        isSuccess: false,
        isError: false,
      });

      try {
        const data = await mutationFn(variables);
        setState({
          data,
          error: undefined,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });
        onSuccess?.(data, variables);
        onSettled?.(data, undefined, variables);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({
          data: undefined,
          error,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });
        onError?.(error, variables);
        onSettled?.(undefined, error, variables);
        throw error;
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const reset = useCallback(() => {
    setState({
      data: undefined,
      error: undefined,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    mutateAsync: mutate,
    reset,
  };
}

// ============================================================================
// Utility: createAsyncState
// ============================================================================

/**
 * Create an async state object
 */
export function createAsyncState<T>(
  status: AsyncStatus,
  data?: T,
  error?: Error
): AsyncState<T> {
  return {
    data,
    error,
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}

// ============================================================================
// Exports
// ============================================================================

export default useAsync;
