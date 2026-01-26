'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CollapseProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
  duration?: number;
}

export function Collapse({ children, isOpen, className, duration = 300 }: CollapseProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(isOpen ? 'auto' : 0);

  useEffect(() => {
    if (isOpen) {
      const contentHeight = contentRef.current?.scrollHeight || 0;
      setHeight(contentHeight);
      
      const timer = setTimeout(() => {
        setHeight('auto');
      }, duration);
      
      return () => clearTimeout(timer);
    } else {
      const contentHeight = contentRef.current?.scrollHeight || 0;
      setHeight(contentHeight);
      
      // Force reflow
      contentRef.current?.offsetHeight;
      
      requestAnimationFrame(() => {
        setHeight(0);
      });
    }
  }, [isOpen, duration]);

  return (
    <div
      ref={contentRef}
      className={cn('overflow-hidden transition-all', className)}
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Collapsible with built-in trigger
interface CollapsibleProps {
  trigger: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  triggerClassName?: string;
}

export function Collapsible({
  trigger,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  className,
  contentClassName,
  triggerClassName,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(open ?? defaultOpen);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleToggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn('w-full text-left', triggerClassName)}
        aria-expanded={isOpen}
      >
        {typeof trigger === 'function' ? trigger(isOpen) : trigger}
      </button>
      <Collapse isOpen={isOpen} className={contentClassName}>
        {children}
      </Collapse>
    </div>
  );
}

// Collapsible card variant
interface CollapsibleCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function CollapsibleCard({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className,
  icon,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <Collapse isOpen={isOpen}>
        <div className="px-4 pb-4 pt-0">{children}</div>
      </Collapse>
    </div>
  );
}

// Collapsible section with smooth height animation
interface CollapsibleSectionProps {
  header: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  divider?: boolean;
}

export function CollapsibleSection({
  header,
  children,
  defaultOpen = true,
  className,
  divider = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 dark:text-white">{header}</span>
        <span
          className={cn(
            'text-gray-500 transition-transform duration-200',
            isOpen ? 'rotate-0' : '-rotate-90'
          )}
        >
          ▼
        </span>
      </button>
      {divider && (
        <div className="border-b border-gray-200 dark:border-gray-700" />
      )}
      <Collapse isOpen={isOpen}>
        <div className="py-3">{children}</div>
      </Collapse>
    </div>
  );
}

// Expandable text component
interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
  showMoreText?: string;
  showLessText?: string;
}

export function ExpandableText({
  text,
  maxLines = 3,
  className,
  showMoreText = 'Show more',
  showLessText = 'Show less',
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * maxLines;
      setNeedsExpansion(textRef.current.scrollHeight > maxHeight);
    }
  }, [text, maxLines]);

  return (
    <div className={className}>
      <p
        ref={textRef}
        className={cn(
          'text-gray-600 dark:text-gray-300',
          !isExpanded && needsExpansion && 'line-clamp-3'
        )}
        style={!isExpanded && needsExpansion ? { WebkitLineClamp: maxLines } : undefined}
      >
        {text}
      </p>
      {needsExpansion && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
        >
          {isExpanded ? showLessText : showMoreText}
        </button>
      )}
    </div>
  );
}

export default Collapse;
