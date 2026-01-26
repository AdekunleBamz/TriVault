'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
    </div>
  );
}

interface TimelineItemProps {
  title: string;
  description?: string;
  time?: string;
  icon?: React.ReactNode;
  status?: 'complete' | 'current' | 'upcoming';
  isLast?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const statusColors = {
  complete: 'bg-green-500 border-green-500',
  current: 'bg-purple-500 border-purple-500',
  upcoming: 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
};

const lineColors = {
  complete: 'bg-green-500',
  current: 'bg-gray-200 dark:bg-gray-700',
  upcoming: 'bg-gray-200 dark:bg-gray-700',
};

export function TimelineItem({
  title,
  description,
  time,
  icon,
  status = 'upcoming',
  isLast = false,
  children,
  className,
}: TimelineItemProps) {
  return (
    <div className={cn('relative pl-8 pb-8', isLast && 'pb-0', className)}>
      {/* Vertical line */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-[11px] top-6 w-0.5 h-full',
            lineColors[status]
          )}
          aria-hidden="true"
        />
      )}

      {/* Dot/Icon */}
      <div
        className={cn(
          'absolute left-0 w-6 h-6 rounded-full border-2',
          'flex items-center justify-center',
          statusColors[status],
          status !== 'upcoming' && 'text-white'
        )}
      >
        {icon || (status === 'complete' && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ))}
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3
            className={cn(
              'text-sm font-semibold',
              status === 'upcoming'
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-gray-900 dark:text-white'
            )}
          >
            {title}
          </h3>
          {time && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {time}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}

interface HorizontalTimelineProps {
  items: Array<{
    title: string;
    description?: string;
    status: 'complete' | 'current' | 'upcoming';
  }>;
  className?: string;
}

export function HorizontalTimeline({ items, className }: HorizontalTimelineProps) {
  return (
    <div className={cn('flex items-start', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex-1 relative">
          {/* Connector line */}
          {index < items.length - 1 && (
            <div
              className={cn(
                'absolute top-3 left-1/2 w-full h-0.5',
                lineColors[item.status]
              )}
              aria-hidden="true"
            />
          )}

          {/* Item */}
          <div className="flex flex-col items-center relative">
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2',
                'flex items-center justify-center z-10',
                'bg-white dark:bg-gray-900',
                statusColors[item.status]
              )}
            >
              {item.status === 'complete' && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {item.status === 'current' && (
                <span className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <div className="mt-2 text-center">
              <p
                className={cn(
                  'text-xs font-medium',
                  item.status === 'upcoming'
                    ? 'text-gray-500'
                    : 'text-gray-900 dark:text-white'
                )}
              >
                {item.title}
              </p>
              {item.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
