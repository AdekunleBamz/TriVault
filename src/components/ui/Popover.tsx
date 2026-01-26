'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  className?: string;
  contentClassName?: string;
  offset?: number;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({
  trigger,
  content,
  placement = 'bottom',
  className,
  contentClassName,
  offset = 8,
  closeOnClickOutside = true,
  closeOnEscape = true,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  }, [onOpenChange]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!closeOnClickOutside) return;
    
    if (
      triggerRef.current &&
      contentRef.current &&
      !triggerRef.current.contains(event.target as Node) &&
      !contentRef.current.contains(event.target as Node)
    ) {
      handleOpenChange(false);
    }
  }, [closeOnClickOutside, handleOpenChange]);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (!closeOnEscape) return;
    
    if (event.key === 'Escape') {
      handleOpenChange(false);
    }
  }, [closeOnEscape, handleOpenChange]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClickOutside, handleEscape]);

  const placementStyles: Record<PopoverPlacement, string> = {
    top: `bottom-full left-1/2 -translate-x-1/2 mb-${offset / 4}`,
    bottom: `top-full left-1/2 -translate-x-1/2 mt-${offset / 4}`,
    left: `right-full top-1/2 -translate-y-1/2 mr-${offset / 4}`,
    right: `left-full top-1/2 -translate-y-1/2 ml-${offset / 4}`,
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        ref={triggerRef}
        onClick={() => handleOpenChange(!isOpen)}
        className="cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="false"
          className={cn(
            'absolute z-50 min-w-[200px]',
            'bg-white dark:bg-gray-800 rounded-lg shadow-lg',
            'border border-gray-200 dark:border-gray-700',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            placementStyles[placement],
            contentClassName
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// Controlled popover variant
interface ControlledPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  className?: string;
  contentClassName?: string;
}

export function ControlledPopover({
  open,
  onOpenChange,
  trigger,
  content,
  placement = 'bottom',
  className,
  contentClassName,
}: ControlledPopoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange]);

  const placementStyles: Record<PopoverPlacement, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        ref={triggerRef}
        onClick={() => onOpenChange(!open)}
        className="cursor-pointer"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {trigger}
      </div>
      
      {open && (
        <div
          ref={contentRef}
          role="dialog"
          aria-modal="false"
          className={cn(
            'absolute z-50 min-w-[200px]',
            'bg-white dark:bg-gray-800 rounded-lg shadow-lg',
            'border border-gray-200 dark:border-gray-700',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            placementStyles[placement],
            contentClassName
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// Popover trigger button
interface PopoverTriggerButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverTriggerButton({ children, className }: PopoverTriggerButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2',
        'rounded-lg border border-gray-300 dark:border-gray-600',
        'hover:bg-gray-50 dark:hover:bg-gray-700',
        'transition-colors',
        className
      )}
    >
      {children}
    </button>
  );
}

// Popover content wrapper
interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverContent({ children, className }: PopoverContentProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}

export default Popover;
