'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  contentClassName?: string;
  openDelay?: number;
  closeDelay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

export function HoverCard({
  trigger,
  content,
  className,
  contentClassName,
  openDelay = 300,
  closeDelay = 200,
  side = 'bottom',
  align = 'center',
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, openDelay);
  };

  const handleMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, closeDelay);
  };

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const sideStyles: Record<string, string> = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  const alignStyles: Record<string, string> = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center: side === 'top' || side === 'bottom' 
      ? 'left-1/2 -translate-x-1/2' 
      : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="inline-block">{trigger}</div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute z-50',
            'w-64 p-4',
            'bg-white dark:bg-gray-800',
            'rounded-lg shadow-lg',
            'border border-gray-200 dark:border-gray-700',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            sideStyles[side],
            alignStyles[align],
            contentClassName
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// User hover card for profile previews
interface UserHoverCardProps {
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
  trigger: React.ReactNode;
  className?: string;
}

export function UserHoverCard({
  username,
  displayName,
  avatar,
  bio,
  stats,
  trigger,
  className,
}: UserHoverCardProps) {
  return (
    <HoverCard
      className={className}
      trigger={trigger}
      content={
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName || username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                {(displayName || username).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              {displayName && (
                <div className="font-medium text-gray-900 dark:text-white">
                  {displayName}
                </div>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                @{username}
              </div>
            </div>
          </div>
          
          {bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {bio}
            </p>
          )}
          
          {stats && stats.length > 0 && (
            <div className="flex gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}

// Token/NFT hover card
interface TokenHoverCardProps {
  name: string;
  symbol?: string;
  image?: string;
  description?: string;
  attributes?: { trait: string; value: string }[];
  trigger: React.ReactNode;
  className?: string;
}

export function TokenHoverCard({
  name,
  symbol,
  image,
  description,
  attributes,
  trigger,
  className,
}: TokenHoverCardProps) {
  return (
    <HoverCard
      className={className}
      trigger={trigger}
      content={
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {image && (
              <img
                src={image}
                alt={name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {name}
              </div>
              {symbol && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {symbol}
                </div>
              )}
            </div>
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {description}
            </p>
          )}
          
          {attributes && attributes.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {attributes.slice(0, 4).map((attr, index) => (
                <div key={index} className="text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {attr.trait}:
                  </span>{' '}
                  <span className="text-gray-900 dark:text-white font-medium">
                    {attr.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}

export default HoverCard;
