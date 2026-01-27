'use client';

import React, { type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'centered';
  children?: ReactNode;
}

export interface NoResultsProps {
  query?: string;
  suggestions?: string[];
  onClear?: () => void;
  className?: string;
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
}

export interface NoConnectionProps {
  onRetry?: () => void;
  className?: string;
}

export interface MaintenanceProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
  className?: string;
}

export interface ComingSoonProps {
  title?: string;
  description?: string;
  notifyEmail?: string;
  onNotify?: (email: string) => void;
  className?: string;
}

// ============================================================================
// Icons
// ============================================================================

function EmptyIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-12 w-12 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-12 w-12 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function ErrorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-12 w-12 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function WifiOffIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-12 w-12 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0zM3 3l18 18"
      />
    </svg>
  );
}

function ToolsIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-12 w-12 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
      />
    </svg>
  );
}

function RocketIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-12 w-12 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
      />
    </svg>
  );
}

function SealIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`h-12 w-12 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

// ============================================================================
// Base Empty State Component
// ============================================================================

/**
 * Generic empty state component
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'md',
  variant = 'default',
  children,
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-6 px-4',
      icon: '[&>svg]:h-8 [&>svg]:w-8',
      title: 'text-sm font-medium',
      description: 'text-xs',
    },
    md: {
      container: 'py-12 px-6',
      icon: '[&>svg]:h-12 [&>svg]:w-12',
      title: 'text-lg font-semibold',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16 px-8',
      icon: '[&>svg]:h-16 [&>svg]:w-16',
      title: 'text-xl font-bold',
      description: 'text-base',
    },
  };

  const variantClasses = {
    default: 'rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50',
    minimal: '',
    centered: 'min-h-[400px]',
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${sizeClasses[size].container}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {icon && (
        <div className={`mb-4 text-gray-400 dark:text-gray-500 ${sizeClasses[size].icon}`}>
          {icon}
        </div>
      )}
      <h3 className={`text-gray-900 dark:text-white ${sizeClasses[size].title}`}>
        {title}
      </h3>
      {description && (
        <p className={`mt-2 max-w-sm text-gray-500 dark:text-gray-400 ${sizeClasses[size].description}`}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================================================
// Specialized Empty States
// ============================================================================

/**
 * No search results state
 */
export function NoResults({
  query,
  suggestions,
  onClear,
  className = '',
}: NoResultsProps) {
  return (
    <EmptyState
      icon={<SearchIcon />}
      title={query ? `No results for "${query}"` : 'No results found'}
      description="Try adjusting your search or filter to find what you're looking for."
      action={
        onClear && (
          <button
            onClick={onClear}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Clear search
          </button>
        )
      }
      className={className}
    >
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Suggestions:
          </p>
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </EmptyState>
  );
}

/**
 * Error state with retry option
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  showDetails = false,
  className = '',
}: ErrorStateProps) {
  const errorMessage =
    message ||
    (error instanceof Error ? error.message : error) ||
    'An unexpected error occurred. Please try again.';

  return (
    <EmptyState
      icon={<ErrorIcon className="text-red-500" />}
      title={title}
      description={errorMessage}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            Try again
          </button>
        )
      }
      className={className}
    >
      {showDetails && error instanceof Error && error.stack && (
        <details className="mt-4 w-full max-w-md text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Show details
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {error.stack}
          </pre>
        </details>
      )}
    </EmptyState>
  );
}

/**
 * No internet connection state
 */
export function NoConnection({ onRetry, className = '' }: NoConnectionProps) {
  return (
    <EmptyState
      icon={<WifiOffIcon className="text-gray-400" />}
      title="No internet connection"
      description="Please check your network connection and try again."
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        )
      }
      className={className}
    />
  );
}

/**
 * Maintenance mode state
 */
export function MaintenanceMode({
  title = 'Under maintenance',
  message = "We're currently performing scheduled maintenance. Please check back soon.",
  estimatedTime,
  className = '',
}: MaintenanceProps) {
  return (
    <EmptyState
      icon={<ToolsIcon className="text-yellow-500" />}
      title={title}
      description={message}
      className={className}
    >
      {estimatedTime && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Estimated completion: <strong>{estimatedTime}</strong>
        </p>
      )}
    </EmptyState>
  );
}

/**
 * Coming soon state
 */
export function ComingSoon({
  title = 'Coming Soon',
  description = 'This feature is currently in development. Stay tuned!',
  className = '',
}: ComingSoonProps) {
  return (
    <EmptyState
      icon={<RocketIcon className="text-purple-500" />}
      title={title}
      description={description}
      className={className}
    />
  );
}

// ============================================================================
// TriVault-Specific Empty States
// ============================================================================

/**
 * No seals collected state
 */
export function NoSeals({
  onCollect,
  className = '',
}: {
  onCollect?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      icon={<SealIcon className="text-blue-500" />}
      title="No seals yet"
      description="Start your collection journey! Collect seals to earn achievements and climb the leaderboard."
      action={
        onCollect && (
          <button
            onClick={onCollect}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Collect your first seal
          </button>
        )
      }
      className={className}
    />
  );
}

/**
 * No transactions state
 */
export function NoTransactions({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon={<EmptyIcon />}
      title="No transactions"
      description="Your transaction history will appear here once you start collecting seals."
      className={className}
    />
  );
}

/**
 * Empty leaderboard state
 */
export function EmptyLeaderboard({ className = '' }: { className?: string }) {
  return (
    <EmptyState
      icon={
        <svg
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
          />
        </svg>
      }
      title="No rankings yet"
      description="Be the first to climb the leaderboard by collecting seals!"
      className={className}
    />
  );
}

// ============================================================================
// Exports
// ============================================================================

export default EmptyState;
