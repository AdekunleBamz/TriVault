'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook that runs a callback once when the component mounts
 */
export function useOnMount(callback: () => void | (() => void)) {
  const callbackRef = useRef(callback);
  
  // Keep callback ref updated
  callbackRef.current = callback;

  useEffect(() => {
    return callbackRef.current();
    // Empty deps ensures this only runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Hook that runs a callback when the component unmounts
 */
export function useOnUnmount(callback: () => void) {
  const callbackRef = useRef(callback);
  
  // Keep callback ref updated
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Hook that returns true after component has mounted
 * Useful for avoiding hydration mismatches
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

/**
 * Hook that tracks if component is still mounted
 * Useful for avoiding state updates on unmounted components
 */
export function useIsMounted() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
}

/**
 * Hook that runs an async function on mount with cleanup
 */
export function useAsyncMount<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useIsMounted();

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFn();
        if (!cancelled && isMountedRef.current) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled && isMountedRef.current) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

/**
 * Hook that delays rendering until after first mount
 * Useful for client-only content
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

export default useOnMount;
