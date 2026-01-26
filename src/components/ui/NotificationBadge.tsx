'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  dot?: boolean;
  color?: 'red' | 'green' | 'blue' | 'purple' | 'orange' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  children?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function NotificationBadge({
  count,
  maxCount = 99,
  showZero = false,
  dot = false,
  color = 'red',
  size = 'md',
  position = 'top-right',
  children,
  className,
  animate = false,
}: NotificationBadgeProps) {
  const showBadge = dot || (count !== undefined && (count > 0 || showZero));
  const displayCount = count !== undefined && count > maxCount ? `${maxCount}+` : count;

  const colorStyles = {
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white',
    gray: 'bg-gray-500 text-white',
  };

  const sizeStyles = dot
    ? {
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
      }
    : {
        sm: 'min-w-[16px] h-4 text-[10px] px-1',
        md: 'min-w-[20px] h-5 text-xs px-1.5',
        lg: 'min-w-[24px] h-6 text-sm px-2',
      };

  const positionStyles = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  if (!children) {
    // Standalone badge
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium',
          colorStyles[color],
          sizeStyles[size],
          animate && 'animate-pulse',
          className
        )}
      >
        {!dot && displayCount}
      </span>
    );
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      {children}
      {showBadge && (
        <span
          className={cn(
            'absolute inline-flex items-center justify-center rounded-full font-medium',
            colorStyles[color],
            sizeStyles[size],
            positionStyles[position],
            animate && 'animate-pulse'
          )}
        >
          {!dot && displayCount}
        </span>
      )}
    </div>
  );
}

// Status indicator dot
interface StatusDotProps {
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export function StatusDot({ status, size = 'md', className, pulse = false }: StatusDotProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    invisible: 'bg-gray-300 border border-gray-400',
  };

  const sizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        statusColors[status],
        sizeStyles[size],
        pulse && status === 'online' && 'animate-pulse',
        className
      )}
    />
  );
}

// Badge with icon
interface IconBadgeProps {
  icon: React.ReactNode;
  count?: number;
  color?: 'red' | 'green' | 'blue' | 'purple' | 'orange';
  className?: string;
}

export function IconBadge({ icon, count, color = 'red', className }: IconBadgeProps) {
  return (
    <NotificationBadge count={count} color={color} className={className}>
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800">
        {icon}
      </span>
    </NotificationBadge>
  );
}

// Avatar with status indicator
interface AvatarWithStatusProps {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarWithStatus({
  src,
  alt = '',
  fallback,
  status,
  size = 'md',
  className,
}: AvatarWithStatusProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const statusSizeStyles = {
    sm: 'w-2 h-2 right-0 bottom-0',
    md: 'w-3 h-3 right-0 bottom-0',
    lg: 'w-3.5 h-3.5 right-0.5 bottom-0.5',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn('rounded-full object-cover', sizeStyles[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-purple-500 flex items-center justify-center text-white font-medium',
            sizeStyles[size]
          )}
        >
          {fallback?.charAt(0).toUpperCase() || '?'}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-white dark:border-gray-900',
            statusColors[status],
            statusSizeStyles[size]
          )}
        />
      )}
    </div>
  );
}

// Ribbon badge for cards
interface RibbonBadgeProps {
  text: string;
  color?: 'red' | 'green' | 'blue' | 'purple' | 'orange';
  position?: 'top-left' | 'top-right';
  className?: string;
}

export function RibbonBadge({
  text,
  color = 'purple',
  position = 'top-right',
  className,
}: RibbonBadgeProps) {
  const colorStyles = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const positionStyles = {
    'top-right': 'top-0 right-0 -translate-y-1/2 translate-x-0',
    'top-left': 'top-0 left-0 -translate-y-1/2 translate-x-0',
  };

  return (
    <span
      className={cn(
        'absolute px-3 py-1 text-xs font-medium text-white rounded-full shadow-md',
        colorStyles[color],
        positionStyles[position],
        className
      )}
    >
      {text}
    </span>
  );
}

export default NotificationBadge;
