'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Hook to get the previous value of a prop or state
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook to get the previous value with initial value option
 */
export function usePreviousWithInitial<T>(value: T, initialValue: T): T {
  const ref = useRef<T>(initialValue);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook to track if a value has changed
 */
export function useHasChanged<T>(value: T): boolean {
  const previous = usePrevious(value);
  return previous !== value;
}

/**
 * Hook to track change direction of a number
 */
export function useChangeDirection(value: number): 'up' | 'down' | 'same' | null {
  const previous = usePrevious(value);

  if (previous === undefined) return null;
  if (value > previous) return 'up';
  if (value < previous) return 'down';
  return 'same';
}

/**
 * Hook to track the delta/difference from previous value
 */
export function useDelta(value: number): number {
  const previous = usePrevious(value);
  return previous !== undefined ? value - previous : 0;
}

/**
 * Hook to get value history
 */
export function useValueHistory<T>(value: T, maxHistory: number = 10): T[] {
  const [history, setHistory] = useState<T[]>([value]);

  useEffect(() => {
    setHistory((prev) => {
      const newHistory = [...prev, value];
      if (newHistory.length > maxHistory) {
        return newHistory.slice(newHistory.length - maxHistory);
      }
      return newHistory;
    });
  }, [value, maxHistory]);

  return history;
}

/**
 * Hook to compare current and previous and run callback on change
 */
export function useOnChange<T>(
  value: T,
  callback: (current: T, previous: T | undefined) => void,
  compare?: (a: T, b: T | undefined) => boolean
): void {
  const previous = usePrevious(value);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const hasChanged = compare
      ? !compare(value, previous)
      : value !== previous;

    if (hasChanged) {
      callbackRef.current(value, previous);
    }
  }, [value, previous, compare]);
}

/**
 * Hook to track first render
 */
export function useIsFirstRender(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
}

/**
 * Hook to run effect only after first render
 */
export function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook to get the latest value (always current in callbacks)
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/**
 * Hook to track mounted state
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

/**
 * Hook to get stable callback reference
 */
export function useStableCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  );
}
