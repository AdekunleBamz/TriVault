'use client';

import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  total: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  paginateData: (data: T[]) => T[];
}

/**
 * Hook for managing pagination state
 */
export function usePagination<T = unknown>(
  options: UsePaginationOptions
): UsePaginationReturn<T> {
  const { initialPage = 1, pageSize: initialPageSize = 10, total } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.ceil(total / pageSize) || 1,
    [total, pageSize]
  );

  const startIndex = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize]
  );

  const endIndex = useMemo(
    () => Math.min(startIndex + pageSize - 1, total - 1),
    [startIndex, pageSize, total]
  );

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((p) => p + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((p) => p - 1);
    }
  }, [hasPreviousPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      // Reset to page 1 when page size changes
      setCurrentPage(1);
    },
    []
  );

  const paginateData = useCallback(
    (data: T[]): T[] => {
      return data.slice(startIndex, startIndex + pageSize);
    },
    [startIndex, pageSize]
  );

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems: total,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    paginateData,
  };
}

/**
 * Hook for paginating a data array
 */
export function usePaginatedData<T>(
  data: T[],
  options: Omit<UsePaginationOptions, 'total'> = {}
) {
  const pagination = usePagination<T>({
    ...options,
    total: data.length,
  });

  const paginatedData = useMemo(
    () => pagination.paginateData(data),
    [data, pagination.paginateData]
  );

  return {
    ...pagination,
    data: paginatedData,
    allData: data,
  };
}

export default usePagination;
