'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions<T> {
  threshold?: number;
  initialPage?: number;
  fetchData: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for infinite scroll functionality
 */
export function useInfiniteScroll<T>({
  threshold = 100,
  initialPage = 1,
  fetchData,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchData(page);
      setData((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setError(null);
    setHasMore(true);
    setIsLoading(false);
  }, [initialPage]);

  // Initial load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadMore();
    }
  }, [loadMore]);

  // Intersection Observer for automatic loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, threshold]);

  return {
    data,
    isLoading,
    error,
    hasMore,
    loadMore,
    reset,
    sentinelRef,
  };
}

interface UsePaginationOptions<T> {
  pageSize?: number;
  initialPage?: number;
  fetchData: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>;
}

/**
 * Hook for traditional pagination
 */
export function useServerPagination<T>({
  pageSize = 10,
  initialPage = 1,
  fetchData,
}: UsePaginationOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const fetchPage = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchData(pageNum, pageSize);
        setData(result.data);
        setTotal(result.total);
        setPage(pageNum);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setIsLoading(false);
      }
    },
    [fetchData, pageSize]
  );

  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= totalPages) {
        fetchPage(pageNum);
      }
    },
    [fetchPage, totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(page + 1);
    }
  }, [goToPage, page, hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      goToPage(page - 1);
    }
  }, [goToPage, page, hasPrevPage]);

  // Initial load
  useEffect(() => {
    fetchPage(initialPage);
  }, [fetchPage, initialPage]);

  return {
    data,
    page,
    pageSize,
    total,
    totalPages,
    isLoading,
    error,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    refresh: () => fetchPage(page),
  };
}

/**
 * Hook for cursor-based pagination
 */
export function useCursorPagination<T, C = string>({
  fetchData,
}: {
  fetchData: (cursor: C | null) => Promise<{ data: T[]; nextCursor: C | null }>;
}) {
  const [data, setData] = useState<T[]>([]);
  const [cursor, setCursor] = useState<C | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchData(cursor);
      setData((prev) => [...prev, ...result.data]);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading, hasMore, fetchData]);

  const reset = useCallback(() => {
    setData([]);
    setCursor(null);
    setError(null);
    setHasMore(true);
    setIsLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    cursor,
    hasMore,
    isLoading,
    error,
    loadMore,
    reset,
  };
}

export default useInfiniteScroll;
