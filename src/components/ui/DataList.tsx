'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DataListItem {
  id: string | number;
  [key: string]: unknown;
}

interface Column<T extends DataListItem> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
}

interface DataListProps<T extends DataListItem> {
  items: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
  className?: string;
}

/**
 * Data list with sorting, selection, and custom rendering
 */
export function DataList<T extends DataListItem>({
  items,
  columns,
  isLoading = false,
  emptyMessage = 'No items found',
  onRowClick,
  selectedIds,
  onSelectionChange,
  className,
}: DataListProps<T>) {
  const isSelectable = selectedIds !== undefined && onSelectionChange !== undefined;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedIds?.size === items.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map((item) => item.id)));
    }
  };

  const handleSelectItem = (id: string | number) => {
    if (!onSelectionChange || !selectedIds) return;

    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const getValue = (item: T, key: keyof T | string): unknown => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => (obj as Record<string, unknown>)?.[k], item as unknown);
    }
    return item[key as keyof T];
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('text-center py-12 text-gray-500 dark:text-gray-400', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-3 gap-4">
          {isSelectable && (
            <input
              type="checkbox"
              checked={selectedIds?.size === items.length && items.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          )}
          {columns.map((column) => (
            <div
              key={String(column.key)}
              className={cn(
                'text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )}
              style={{ width: column.width, flex: column.width ? undefined : 1 }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={cn(
              'flex items-center px-4 py-3 gap-4 bg-white dark:bg-gray-900',
              onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
              selectedIds?.has(item.id) && 'bg-blue-50 dark:bg-blue-900/20'
            )}
          >
            {isSelectable && (
              <input
                type="checkbox"
                checked={selectedIds?.has(item.id) ?? false}
                onChange={() => handleSelectItem(item.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}
            {columns.map((column) => (
              <div
                key={String(column.key)}
                className={cn(
                  'text-sm text-gray-900 dark:text-white',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
                style={{ width: column.width, flex: column.width ? undefined : 1 }}
              >
                {column.render
                  ? column.render(item)
                  : String(getValue(item, column.key) ?? '')}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

/**
 * Virtual list for large datasets
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StackedListProps {
  items: {
    id: string | number;
    primary: React.ReactNode;
    secondary?: React.ReactNode;
    meta?: React.ReactNode;
    avatar?: React.ReactNode;
    action?: React.ReactNode;
  }[];
  onItemClick?: (id: string | number) => void;
  className?: string;
}

/**
 * Stacked list with primary/secondary content layout
 */
export function StackedList({ items, onItemClick, className }: StackedListProps) {
  return (
    <ul className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)}>
      {items.map((item) => (
        <li
          key={item.id}
          onClick={() => onItemClick?.(item.id)}
          className={cn(
            'flex items-center gap-4 px-4 py-4 bg-white dark:bg-gray-900',
            onItemClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          {item.avatar && <div className="flex-shrink-0">{item.avatar}</div>}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {item.primary}
            </div>
            {item.secondary && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {item.secondary}
              </div>
            )}
          </div>
          {item.meta && (
            <div className="text-sm text-gray-500 dark:text-gray-400">{item.meta}</div>
          )}
          {item.action && <div>{item.action}</div>}
        </li>
      ))}
    </ul>
  );
}

export default DataList;
