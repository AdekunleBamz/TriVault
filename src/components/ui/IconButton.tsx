'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type IconButtonVariant = 'ghost' | 'outline' | 'solid' | 'subtle';
type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  rounded?: boolean;
  loading?: boolean;
  'aria-label': string;
}

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: cn(
    'bg-transparent',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'active:bg-gray-200 dark:active:bg-gray-700',
    'text-gray-700 dark:text-gray-300'
  ),
  outline: cn(
    'bg-transparent',
    'border border-gray-300 dark:border-gray-600',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'text-gray-700 dark:text-gray-300'
  ),
  solid: cn(
    'bg-purple-600',
    'hover:bg-purple-700',
    'active:bg-purple-800',
    'text-white'
  ),
  subtle: cn(
    'bg-gray-100 dark:bg-gray-800',
    'hover:bg-gray-200 dark:hover:bg-gray-700',
    'text-gray-700 dark:text-gray-300'
  ),
};

const sizeClasses: Record<IconButtonSize, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  rounded = true,
  loading = false,
  disabled,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        'dark:focus:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        rounded ? 'rounded-full' : 'rounded-lg',
        className
      )}
      {...props}
    >
      {loading ? (
        <svg
          className={cn('animate-spin', iconSizeClasses[size])}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <span className={cn('flex items-center justify-center', iconSizeClasses[size])}>
          {icon}
        </span>
      )}
    </button>
  );
}

// Common icon button variants
interface CloseButtonProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  'aria-label'?: string;
}

export function CloseButton({ 'aria-label': ariaLabel = 'Close', ...props }: CloseButtonProps) {
  return (
    <IconButton
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      }
      aria-label={ariaLabel}
      {...props}
    />
  );
}

interface MenuButtonProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  'aria-label'?: string;
}

export function MenuButton({ 'aria-label': ariaLabel = 'Menu', ...props }: MenuButtonProps) {
  return (
    <IconButton
      icon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      }
      aria-label={ariaLabel}
      {...props}
    />
  );
}

interface ChevronButtonProps extends Omit<IconButtonProps, 'icon' | 'aria-label'> {
  direction: 'up' | 'down' | 'left' | 'right';
  'aria-label'?: string;
}

const rotationClasses = {
  up: 'rotate-180',
  down: '',
  left: 'rotate-90',
  right: '-rotate-90',
};

export function ChevronButton({ direction, 'aria-label': ariaLabel, ...props }: ChevronButtonProps) {
  return (
    <IconButton
      icon={
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          className={rotationClasses[direction]}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      }
      aria-label={ariaLabel || `Navigate ${direction}`}
      {...props}
    />
  );
}

export default IconButton;
