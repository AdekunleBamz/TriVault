'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
  className?: string;
  handleClassName?: string;
}

export function ResizablePanel({
  children,
  direction = 'horizontal',
  initialSize = 300,
  minSize = 150,
  maxSize = 600,
  onResize,
  className,
  handleClassName,
}: ResizablePanelProps) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
      startSizeRef.current = size;
    },
    [direction, size]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;
      const newSize = Math.min(maxSize, Math.max(minSize, startSizeRef.current + delta));

      setSize(newSize);
      onResize?.(newSize);
    },
    [isResizing, direction, minSize, maxSize, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp, direction]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      className={cn('relative flex', isHorizontal ? 'flex-row' : 'flex-col', className)}
      style={{
        [isHorizontal ? 'width' : 'height']: `${size}px`,
      }}
    >
      <div className="flex-1 overflow-auto">{children}</div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'flex-shrink-0',
          isHorizontal
            ? 'w-1 cursor-col-resize hover:bg-purple-500/50'
            : 'h-1 cursor-row-resize hover:bg-purple-500/50',
          'bg-gray-200 dark:bg-gray-700',
          'transition-colors',
          isResizing && 'bg-purple-500',
          handleClassName
        )}
        role="separator"
        aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
        tabIndex={0}
        onKeyDown={(e) => {
          const step = 10;
          if (isHorizontal) {
            if (e.key === 'ArrowLeft') setSize((s) => Math.max(minSize, s - step));
            if (e.key === 'ArrowRight') setSize((s) => Math.min(maxSize, s + step));
          } else {
            if (e.key === 'ArrowUp') setSize((s) => Math.max(minSize, s - step));
            if (e.key === 'ArrowDown') setSize((s) => Math.min(maxSize, s + step));
          }
        }}
      />
    </div>
  );
}

interface SplitPanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialLeftSize?: number;
  minLeftSize?: number;
  maxLeftSize?: number;
  className?: string;
}

export function SplitPanel({
  left,
  right,
  initialLeftSize = 300,
  minLeftSize = 150,
  maxLeftSize = 600,
  className,
}: SplitPanelProps) {
  const [leftSize, setLeftSize] = useState(initialLeftSize);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startSizeRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startSizeRef.current = leftSize;
  }, [leftSize]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const delta = e.clientX - startXRef.current;
      const newSize = Math.min(maxLeftSize, Math.max(minLeftSize, startSizeRef.current + delta));
      setLeftSize(newSize);
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minLeftSize, maxLeftSize]);

  return (
    <div className={cn('flex h-full', className)}>
      <div style={{ width: leftSize }} className="flex-shrink-0 overflow-auto">
        {left}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'w-1 cursor-col-resize flex-shrink-0',
          'bg-gray-200 dark:bg-gray-700',
          'hover:bg-purple-500/50',
          isResizing && 'bg-purple-500'
        )}
      />
      <div className="flex-1 overflow-auto">{right}</div>
    </div>
  );
}

export default ResizablePanel;
