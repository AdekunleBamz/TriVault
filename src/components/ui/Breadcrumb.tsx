'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
  showHomeIcon?: boolean;
}

export function Breadcrumb({
  items,
  separator,
  className,
  maxItems,
  showHomeIcon = false,
}: BreadcrumbProps) {
  // Handle collapsing when maxItems is set
  const displayItems = React.useMemo(() => {
    if (!maxItems || items.length <= maxItems) return items;

    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));

    return [
      firstItem,
      { label: '...', href: undefined } as BreadcrumbItem,
      ...lastItems,
    ];
  }, [items, maxItems]);

  const defaultSeparator = (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const homeIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <span className="mx-1" aria-hidden="true">
                  {separator || defaultSeparator}
                </span>
              )}
              
              {isLast || !item.href ? (
                <span
                  className={cn(
                    'flex items-center gap-1.5',
                    isLast
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {isFirst && showHomeIcon ? homeIcon : item.icon}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5',
                    'text-gray-500 dark:text-gray-400',
                    'hover:text-gray-700 dark:hover:text-gray-200',
                    'transition-colors'
                  )}
                >
                  {isFirst && showHomeIcon ? homeIcon : item.icon}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Breadcrumb with dropdown for collapsed items
interface BreadcrumbWithDropdownProps extends BreadcrumbProps {
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

export function BreadcrumbWithDropdown({
  items,
  separator,
  className,
  showHomeIcon,
  onItemClick,
}: BreadcrumbWithDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const maxItems = 3;

  if (items.length <= maxItems) {
    return (
      <Breadcrumb
        items={items}
        separator={separator}
        className={className}
        showHomeIcon={showHomeIcon}
      />
    );
  }

  const firstItem = items[0];
  const middleItems = items.slice(1, -1);
  const lastItem = items[items.length - 1];

  const defaultSeparator = (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1">
        {/* First item */}
        <li className="flex items-center gap-1">
          {firstItem.href ? (
            <Link
              href={firstItem.href}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showHomeIcon ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              ) : (
                firstItem.label
              )}
            </Link>
          ) : (
            <span className="text-gray-500">{firstItem.label}</span>
          )}
        </li>

        {/* Separator */}
        <li className="mx-1">{separator || defaultSeparator}</li>

        {/* Dropdown for middle items */}
        <li className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ...
          </button>
          {isDropdownOpen && (
            <ul className="absolute left-0 top-full mt-1 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 min-w-[150px]">
              {middleItems.map((item, idx) => (
                <li key={idx}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onItemClick?.(item, idx + 1);
                      }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="block px-4 py-2 text-sm text-gray-500">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>

        {/* Separator */}
        <li className="mx-1">{separator || defaultSeparator}</li>

        {/* Last item */}
        <li className="text-gray-900 dark:text-white font-medium" aria-current="page">
          {lastItem.label}
        </li>
      </ol>
    </nav>
  );
}

// Simple breadcrumb from path
interface PathBreadcrumbProps {
  path: string;
  homeLabel?: string;
  className?: string;
}

export function PathBreadcrumb({ path, homeLabel = 'Home', className }: PathBreadcrumbProps) {
  const segments = path.split('/').filter(Boolean);
  
  const items: BreadcrumbItem[] = [
    { label: homeLabel, href: '/' },
    ...segments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/' + segments.slice(0, index + 1).join('/'),
    })),
  ];

  return <Breadcrumb items={items} className={className} showHomeIcon />;
}

export default Breadcrumb;
