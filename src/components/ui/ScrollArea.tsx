'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
  hideScrollbar?: boolean;
  scrollbarWidth?: 'thin' | 'medium' | 'thick';
  onScrollEnd?: () => void;
  scrollEndThreshold?: number;
}

/**
 * Custom scroll area with styled scrollbars
 */
export function ScrollArea({
  children,
  className,
  orientation = 'vertical',
  hideScrollbar = false,
  scrollbarWidth = 'medium',
  onScrollEnd,
  scrollEndThreshold = 50,
}: ScrollAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollbar, setShowScrollbar] = useState(false);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !onScrollEnd) return;

    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } =
      containerRef.current;

    const isAtVerticalEnd = scrollHeight - scrollTop - clientHeight <= scrollEndThreshold;
    const isAtHorizontalEnd = scrollWidth - scrollLeft - clientWidth <= scrollEndThreshold;

    if (
      (orientation === 'vertical' && isAtVerticalEnd) ||
      (orientation === 'horizontal' && isAtHorizontalEnd) ||
      (orientation === 'both' && (isAtVerticalEnd || isAtHorizontalEnd))
    ) {
      onScrollEnd();
    }
  }, [onScrollEnd, orientation, scrollEndThreshold]);

  const scrollbarWidthClass = {
    thin: 'scrollbar-thin',
    medium: 'scrollbar-medium',
    thick: 'scrollbar-thick',
  }[scrollbarWidth];

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onMouseEnter={() => setShowScrollbar(true)}
      onMouseLeave={() => setShowScrollbar(false)}
      className={cn(
        'relative',
        orientation === 'vertical' && 'overflow-y-auto overflow-x-hidden',
        orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
        orientation === 'both' && 'overflow-auto',
        hideScrollbar && 'scrollbar-hide',
        !hideScrollbar && scrollbarWidthClass,
        className
      )}
      style={{
        scrollbarGutter: 'stable',
      }}
    >
      {children}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .scrollbar-medium::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .scrollbar-thick::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: ${showScrollbar ? 'rgba(155, 155, 155, 0.5)' : 'transparent'};
          border-radius: 9999px;
          transition: background 0.2s;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 155, 155, 0.7);
        }
      `}</style>
    </div>
  );
}

interface ScrollToOptions {
  position: number;
  behavior?: 'smooth' | 'auto';
  direction?: 'vertical' | 'horizontal';
}

/**
 * Scroll container with programmatic scroll control
 */
export function ScrollContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback(({ position, behavior = 'smooth', direction = 'vertical' }: ScrollToOptions) => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      [direction === 'vertical' ? 'top' : 'left']: position,
      behavior,
    });
  }, []);

  const scrollToTop = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    scrollTo({ position: 0, behavior, direction: 'vertical' });
  }, [scrollTo]);

  const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    if (!containerRef.current) return;
    scrollTo({ position: containerRef.current.scrollHeight, behavior, direction: 'vertical' });
  }, [scrollTo]);

  return (
    <div ref={containerRef} className={cn('overflow-auto', className)}>
      {children}
    </div>
  );
}

interface ScrollProgressProps {
  containerRef?: React.RefObject<HTMLElement>;
  className?: string;
  position?: 'top' | 'bottom';
}

/**
 * Scroll progress indicator
 */
export function ScrollProgress({
  containerRef,
  className,
  position = 'top',
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef?.current ?? document.documentElement;

    const handleScroll = () => {
      const scrollTop = container === document.documentElement
        ? window.scrollY
        : container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progressPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, progressPercent)));
    };

    const target = containerRef?.current ?? window;
    target.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => target.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  return (
    <div
      className={cn(
        'fixed left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
    >
      <div
        className="h-full bg-blue-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

interface ScrollShadowProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

/**
 * Scroll area with shadow indicators
 */
export function ScrollShadow({
  children,
  className,
  orientation = 'vertical',
}: ScrollShadowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showStartShadow, setShowStartShadow] = useState(false);
  const [showEndShadow, setShowEndShadow] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (orientation === 'vertical') {
        setShowStartShadow(container.scrollTop > 0);
        setShowEndShadow(
          container.scrollHeight - container.scrollTop - container.clientHeight > 1
        );
      } else {
        setShowStartShadow(container.scrollLeft > 0);
        setShowEndShadow(
          container.scrollWidth - container.scrollLeft - container.clientWidth > 1
        );
      }
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [orientation]);

  return (
    <div className={cn('relative', className)}>
      {showStartShadow && (
        <div
          className={cn(
            'absolute z-10 pointer-events-none',
            orientation === 'vertical'
              ? 'top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-gray-900'
              : 'left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-gray-900'
          )}
        />
      )}
      <div
        ref={containerRef}
        className={cn(
          orientation === 'vertical' ? 'overflow-y-auto' : 'overflow-x-auto'
        )}
      >
        {children}
      </div>
      {showEndShadow && (
        <div
          className={cn(
            'absolute z-10 pointer-events-none',
            orientation === 'vertical'
              ? 'bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-900'
              : 'right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-900'
          )}
        />
      )}
    </div>
  );
}

export default ScrollArea;
