'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-gray-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export function NoSealsState({ onCollect }: { onCollect?: () => void }) {
  return (
    <EmptyState
      icon={<span className="text-5xl">🦭</span>}
      title="No Seals Yet"
      description="Start your collection by collecting seals from different vaults!"
      action={
        onCollect && (
          <button
            onClick={onCollect}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          >
            Collect Your First Seal
          </button>
        )
      }
    />
  );
}

export function NoResultsState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<span className="text-5xl">🔍</span>}
      title="No Results Found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
    />
  );
}

export function ErrorState({ 
  onRetry,
  message = 'Something went wrong. Please try again.',
}: { 
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon={<span className="text-5xl">😕</span>}
      title="Oops!"
      description={message}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-gray-700 rounded-lg font-medium text-white hover:bg-gray-600 transition-colors"
          >
            Try Again
          </button>
        )
      }
    />
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4" />
      <p className="text-gray-400">{message}</p>
    </div>
  );
}

export function WalletNotConnectedState({ onConnect }: { onConnect?: () => void }) {
  return (
    <EmptyState
      icon={<span className="text-5xl">🔗</span>}
      title="Connect Your Wallet"
      description="Connect your wallet to view your collection and start collecting seals."
      action={
        onConnect && (
          <button
            onClick={onConnect}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
          >
            Connect Wallet
          </button>
        )
      }
    />
  );
}
