'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'online' | 'offline' | 'away' | 'busy' | 'success' | 'warning' | 'error' | 'pending';

interface StatusDotProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  label?: string;
  className?: string;
}

const statusColors: Record<StatusType, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  pending: 'bg-blue-500',
};

const statusLabels: Record<StatusType, string> = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Busy',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  pending: 'Pending',
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function StatusDot({
  status,
  size = 'md',
  pulse = false,
  label,
  className,
}: StatusDotProps) {
  const displayLabel = label ?? statusLabels[status];

  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      role="status"
      aria-label={displayLabel}
    >
      <span className="relative inline-flex">
        <span
          className={cn(
            'rounded-full',
            sizeClasses[size],
            statusColors[status]
          )}
        />
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex rounded-full opacity-75',
              sizeClasses[size],
              statusColors[status],
              'animate-ping'
            )}
            aria-hidden="true"
          />
        )}
      </span>
      {label !== undefined && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {displayLabel}
        </span>
      )}
    </span>
  );
}

interface ConnectionStatusProps {
  isConnected: boolean;
  showLabel?: boolean;
  className?: string;
}

export function ConnectionStatus({
  isConnected,
  showLabel = true,
  className,
}: ConnectionStatusProps) {
  return (
    <StatusDot
      status={isConnected ? 'online' : 'offline'}
      pulse={isConnected}
      label={showLabel ? (isConnected ? 'Connected' : 'Disconnected') : undefined}
      className={className}
    />
  );
}

interface NetworkStatusProps {
  isOnline: boolean;
  showLabel?: boolean;
  className?: string;
}

export function NetworkStatus({
  isOnline,
  showLabel = true,
  className,
}: NetworkStatusProps) {
  return (
    <StatusDot
      status={isOnline ? 'online' : 'offline'}
      pulse={!isOnline}
      label={showLabel ? (isOnline ? 'Online' : 'Offline') : undefined}
      className={className}
    />
  );
}

interface TransactionStatusProps {
  status: 'pending' | 'success' | 'error';
  showLabel?: boolean;
  className?: string;
}

export function TransactionStatus({
  status,
  showLabel = true,
  className,
}: TransactionStatusProps) {
  const labels = {
    pending: 'Pending',
    success: 'Confirmed',
    error: 'Failed',
  };

  return (
    <StatusDot
      status={status}
      pulse={status === 'pending'}
      label={showLabel ? labels[status] : undefined}
      className={className}
    />
  );
}

export default StatusDot;
