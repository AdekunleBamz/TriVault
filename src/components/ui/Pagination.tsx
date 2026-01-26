'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  const totalNumbers = siblingCount * 2 + 3;
  const totalBlocks = totalNumbers + 2;

  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [1, 'ellipsis', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className,
}: PaginationProps) {
  const pages = generatePageNumbers(currentPage, totalPages, siblingCount);

  const buttonClasses = cn(
    'inline-flex items-center justify-center',
    'min-w-[40px] h-10 px-3',
    'text-sm font-medium',
    'border border-gray-200 dark:border-gray-700',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'focus:outline-none focus:ring-2 focus:ring-purple-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-colors'
  );

  const activeClasses = cn(
    'bg-purple-600 text-white border-purple-600',
    'hover:bg-purple-700 dark:hover:bg-purple-500'
  );

  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      aria-label="Pagination"
    >
      {showFirstLast && (
        <button
          type="button"
          className={cn(buttonClasses, 'rounded-l-lg')}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          ««
        </button>
      )}

      <button
        type="button"
        className={cn(buttonClasses, !showFirstLast && 'rounded-l-lg')}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        «
      </button>

      {pages.map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn(buttonClasses, 'cursor-default')}
              aria-hidden
            >
              …
            </span>
          );
        }

        return (
          <button
            key={page}
            type="button"
            className={cn(
              buttonClasses,
              page === currentPage && activeClasses
            )}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Go to page ${page}`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        className={cn(buttonClasses, !showFirstLast && 'rounded-r-lg')}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        »
      </button>

      {showFirstLast && (
        <button
          type="button"
          className={cn(buttonClasses, 'rounded-r-lg')}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          »»
        </button>
      )}
    </nav>
  );
}

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: SimplePaginationProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <button
        type="button"
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-lg',
          'bg-gray-100 dark:bg-gray-800',
          'hover:bg-gray-200 dark:hover:bg-gray-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        className={cn(
          'px-4 py-2 text-sm font-medium rounded-lg',
          'bg-gray-100 dark:bg-gray-800',
          'hover:bg-gray-200 dark:hover:bg-gray-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
