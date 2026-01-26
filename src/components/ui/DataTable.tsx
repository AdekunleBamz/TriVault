'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Table root
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse', className)}>
        {children}
      </table>
    </div>
  );
}

// Table header
interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn('bg-gray-50 dark:bg-gray-800', className)}>
      {children}
    </thead>
  );
}

// Table body
interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)}>
      {children}
    </tbody>
  );
}

// Table row
interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hoverable?: boolean;
}

export function TableRow({ 
  children, 
  className, 
  onClick, 
  selected = false,
  hoverable = true 
}: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors',
        hoverable && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        selected && 'bg-purple-50 dark:bg-purple-900/20',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Table header cell
interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
  align?: 'left' | 'center' | 'right';
}

export function TableHead({ 
  children, 
  className, 
  sortable = false,
  sorted = null,
  onSort,
  align = 'left' 
}: TableHeadProps) {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        alignStyles[align],
        sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className={cn('flex items-center gap-1', align === 'right' && 'justify-end', align === 'center' && 'justify-center')}>
        {children}
        {sortable && (
          <span className="ml-1">
            {sorted === 'asc' && '↑'}
            {sorted === 'desc' && '↓'}
            {!sorted && '↕'}
          </span>
        )}
      </div>
    </th>
  );
}

// Table cell
interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
}

export function TableCell({ 
  children, 
  className, 
  align = 'left',
  colSpan 
}: TableCellProps) {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
        alignStyles[align],
        className
      )}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

// Table footer
interface TableFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function TableFooter({ children, className }: TableFooterProps) {
  return (
    <tfoot className={cn('bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </tfoot>
  );
}

// Empty table state
interface TableEmptyProps {
  message?: string;
  colSpan: number;
  className?: string;
}

export function TableEmpty({ message = 'No data available', colSpan, className }: TableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn('px-4 py-12 text-center text-gray-500 dark:text-gray-400', className)}
      >
        {message}
      </td>
    </tr>
  );
}

// Table loading skeleton
interface TableSkeletonProps {
  rows?: number;
  columns: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns, className }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className={className}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Table pagination
interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}: TablePaginationProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3', className)}>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={cn(
            'px-3 py-1 text-sm rounded border',
            'border-gray-300 dark:border-gray-600',
            'hover:bg-gray-50 dark:hover:bg-gray-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={cn(
            'px-3 py-1 text-sm rounded border',
            'border-gray-300 dark:border-gray-600',
            'hover:bg-gray-50 dark:hover:bg-gray-700',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Table;
