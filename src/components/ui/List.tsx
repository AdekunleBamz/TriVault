'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ListProps {
  children: React.ReactNode;
  ordered?: boolean;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  dividers?: boolean;
  className?: string;
}

const spacingClasses = {
  none: '',
  sm: 'space-y-1',
  md: 'space-y-2',
  lg: 'space-y-4',
};

export function List({
  children,
  ordered = false,
  spacing = 'md',
  dividers = false,
  className,
}: ListProps) {
  const Component = ordered ? 'ol' : 'ul';

  return (
    <Component
      className={cn(
        !dividers && spacingClasses[spacing],
        dividers && 'divide-y divide-gray-200 dark:divide-gray-700',
        ordered && 'list-decimal list-inside',
        className
      )}
    >
      {children}
    </Component>
  );
}

interface ListItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ListItem({
  children,
  icon,
  action,
  onClick,
  active = false,
  disabled = false,
  className,
}: ListItemProps) {
  const isClickable = Boolean(onClick) && !disabled;

  return (
    <li
      onClick={disabled ? undefined : onClick}
      className={cn(
        'flex items-center gap-3',
        'px-3 py-2',
        isClickable && 'cursor-pointer',
        isClickable && 'hover:bg-gray-50 dark:hover:bg-gray-800',
        isClickable && 'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800',
        active && 'bg-purple-50 dark:bg-purple-950/20',
        disabled && 'opacity-50 cursor-not-allowed',
        'transition-colors',
        className
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {icon && (
        <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
          {icon}
        </span>
      )}
      <span className="flex-1 min-w-0">{children}</span>
      {action && <span className="flex-shrink-0">{action}</span>}
    </li>
  );
}

interface DescriptionListProps {
  children: React.ReactNode;
  horizontal?: boolean;
  className?: string;
}

export function DescriptionList({
  children,
  horizontal = false,
  className,
}: DescriptionListProps) {
  return (
    <dl
      className={cn(
        horizontal
          ? 'grid grid-cols-[auto_1fr] gap-x-4 gap-y-2'
          : 'space-y-4',
        className
      )}
    >
      {children}
    </dl>
  );
}

interface DescriptionItemProps {
  term: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DescriptionItem({
  term,
  children,
  className,
}: DescriptionItemProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {term}
      </dt>
      <dd className="text-sm text-gray-900 dark:text-white">{children}</dd>
    </div>
  );
}

interface BulletListProps {
  items: string[];
  icon?: React.ReactNode;
  className?: string;
}

export function BulletList({ items, icon, className }: BulletListProps) {
  const defaultIcon = (
    <svg
      className="w-4 h-4 text-purple-500"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <ul className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">{icon ?? defaultIcon}</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default List;
