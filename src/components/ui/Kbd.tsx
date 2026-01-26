'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface KbdProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

const sizeClasses = {
  sm: 'px-1 py-0.5 text-xs min-w-[1.25rem]',
  md: 'px-1.5 py-0.5 text-sm min-w-[1.5rem]',
  lg: 'px-2 py-1 text-base min-w-[1.75rem]',
};

const variantClasses = {
  default: cn(
    'bg-gray-100 dark:bg-gray-800',
    'border-b-2 border-gray-300 dark:border-gray-600',
    'text-gray-800 dark:text-gray-200'
  ),
  outline: cn(
    'bg-transparent',
    'border border-gray-300 dark:border-gray-600',
    'text-gray-700 dark:text-gray-300'
  ),
};

export function Kbd({
  children,
  size = 'md',
  variant = 'default',
  className,
}: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'font-mono font-medium',
        'rounded-md',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </kbd>
  );
}

interface KeyboardShortcutProps {
  keys: string[];
  separator?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Common key symbols
const keySymbols: Record<string, string> = {
  cmd: '⌘',
  command: '⌘',
  ctrl: '⌃',
  control: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  tab: '⇥',
  backspace: '⌫',
  delete: '⌦',
  escape: 'Esc',
  esc: 'Esc',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  space: '␣',
};

function formatKey(key: string): string {
  const lowerKey = key.toLowerCase();
  return keySymbols[lowerKey] || key.toUpperCase();
}

export function KeyboardShortcut({
  keys,
  separator = '+',
  size = 'sm',
  className,
}: KeyboardShortcutProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <Kbd size={size}>{formatKey(key)}</Kbd>
          {index < keys.length - 1 && (
            <span className="text-gray-400 dark:text-gray-500 text-xs mx-0.5">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </span>
  );
}

interface ShortcutHintProps {
  label: string;
  keys: string[];
  className?: string;
}

export function ShortcutHint({ label, keys, className }: ShortcutHintProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4',
        'text-sm text-gray-600 dark:text-gray-400',
        className
      )}
    >
      <span>{label}</span>
      <KeyboardShortcut keys={keys} size="sm" />
    </div>
  );
}

interface ShortcutListProps {
  shortcuts: Array<{ label: string; keys: string[] }>;
  className?: string;
}

export function ShortcutList({ shortcuts, className }: ShortcutListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {shortcuts.map((shortcut, index) => (
        <ShortcutHint
          key={index}
          label={shortcut.label}
          keys={shortcut.keys}
        />
      ))}
    </div>
  );
}

export default Kbd;
