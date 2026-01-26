'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HighlightProps {
  children: React.ReactNode;
  color?: 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red';
  className?: string;
}

const colorClasses = {
  yellow: 'bg-yellow-200 dark:bg-yellow-800/50',
  green: 'bg-green-200 dark:bg-green-800/50',
  blue: 'bg-blue-200 dark:bg-blue-800/50',
  purple: 'bg-purple-200 dark:bg-purple-800/50',
  pink: 'bg-pink-200 dark:bg-pink-800/50',
  red: 'bg-red-200 dark:bg-red-800/50',
};

export function Highlight({
  children,
  color = 'yellow',
  className,
}: HighlightProps) {
  return (
    <mark
      className={cn(
        'px-0.5 rounded-sm',
        'text-inherit',
        colorClasses[color],
        className
      )}
    >
      {children}
    </mark>
  );
}

interface TextHighlightProps {
  text: string;
  highlight: string;
  color?: 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red';
  caseSensitive?: boolean;
  className?: string;
}

export function TextHighlight({
  text,
  highlight,
  color = 'yellow',
  caseSensitive = false,
  className,
}: TextHighlightProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    caseSensitive ? 'g' : 'gi'
  );

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isHighlight = caseSensitive
          ? part === highlight
          : part.toLowerCase() === highlight.toLowerCase();

        if (isHighlight) {
          return (
            <Highlight key={index} color={color}>
              {part}
            </Highlight>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

interface MultiHighlightProps {
  text: string;
  highlights: Array<{
    term: string;
    color?: 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red';
  }>;
  caseSensitive?: boolean;
  className?: string;
}

export function MultiHighlight({
  text,
  highlights,
  caseSensitive = false,
  className,
}: MultiHighlightProps) {
  if (highlights.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Build regex from all terms
  const terms = highlights.map((h) =>
    h.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const regex = new RegExp(`(${terms.join('|')})`, caseSensitive ? 'g' : 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const matchingHighlight = highlights.find((h) =>
          caseSensitive
            ? part === h.term
            : part.toLowerCase() === h.term.toLowerCase()
        );

        if (matchingHighlight) {
          return (
            <Highlight key={index} color={matchingHighlight.color || 'yellow'}>
              {part}
            </Highlight>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
  className?: string;
}

export function GradientText({
  children,
  from = 'purple-500',
  via,
  to = 'pink-500',
  className,
}: GradientTextProps) {
  return (
    <span
      className={cn(
        'bg-clip-text text-transparent bg-gradient-to-r',
        `from-${from}`,
        via && `via-${via}`,
        `to-${to}`,
        className
      )}
    >
      {children}
    </span>
  );
}

export default Highlight;
