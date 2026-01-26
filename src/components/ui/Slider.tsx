'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

export function Slider({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  disabled = false,
  className,
  showValue = false,
  formatValue = (v) => String(v),
  size = 'md',
  color = 'purple',
}: SliderProps) {
  const [currentValue, setCurrentValue] = useState(value ?? defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value);
    }
  }, [value]);

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return currentValue;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step, currentValue]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    const newValue = calculateValue(e.clientX);
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || disabled) return;
      const newValue = calculateValue(e.clientX);
      setCurrentValue(newValue);
      onChange?.(newValue);
    },
    [isDragging, disabled, calculateValue, onChange]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onChangeEnd?.(currentValue);
    }
  }, [isDragging, currentValue, onChangeEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const percentage = ((currentValue - min) / (max - min)) * 100;

  const sizeStyles = {
    sm: { track: 'h-1', thumb: 'w-3 h-3' },
    md: { track: 'h-2', thumb: 'w-4 h-4' },
    lg: { track: 'h-3', thumb: 'w-5 h-5' },
  };

  const colorStyles = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={trackRef}
        className={cn(
          'relative w-full rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer',
          sizeStyles[size].track,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Filled track */}
        <div
          className={cn('absolute left-0 top-0 h-full rounded-full', colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'rounded-full bg-white shadow-md border-2',
            'transition-transform',
            isDragging ? 'scale-110' : 'scale-100',
            colorStyles[color].replace('bg-', 'border-'),
            sizeStyles[size].thumb
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {showValue && (
        <div className="mt-1 text-center text-sm text-gray-600 dark:text-gray-300">
          {formatValue(currentValue)}
        </div>
      )}
    </div>
  );
}

// Range slider with two handles
interface RangeSliderProps {
  value?: [number, number];
  defaultValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: [number, number]) => void;
  disabled?: boolean;
  className?: string;
  minDistance?: number;
}

export function RangeSlider({
  value,
  defaultValue = [25, 75],
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  className,
  minDistance = 0,
}: RangeSliderProps) {
  const [range, setRange] = useState<[number, number]>(value ?? defaultValue);
  const [activeThumb, setActiveThumb] = useState<'start' | 'end' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setRange(value);
    }
  }, [value]);

  const calculateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  const handleMouseDown = (thumb: 'start' | 'end') => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveThumb(thumb);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!activeThumb || disabled) return;
      const newValue = calculateValue(e.clientX);

      setRange((prev) => {
        let newRange: [number, number] = [...prev];
        if (activeThumb === 'start') {
          newRange[0] = Math.min(newValue, prev[1] - minDistance);
          newRange[0] = Math.max(min, newRange[0]);
        } else {
          newRange[1] = Math.max(newValue, prev[0] + minDistance);
          newRange[1] = Math.min(max, newRange[1]);
        }
        onChange?.(newRange);
        return newRange;
      });
    },
    [activeThumb, disabled, calculateValue, min, max, minDistance, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setActiveThumb(null);
  }, []);

  useEffect(() => {
    if (activeThumb) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeThumb, handleMouseMove, handleMouseUp]);

  const startPercent = ((range[0] - min) / (max - min)) * 100;
  const endPercent = ((range[1] - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={trackRef}
        className={cn(
          'relative w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Filled track */}
        <div
          className="absolute top-0 h-full bg-purple-500 rounded-full"
          style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
        />

        {/* Start thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-purple-500 cursor-grab"
          style={{ left: `${startPercent}%` }}
          onMouseDown={handleMouseDown('start')}
        />

        {/* End thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-purple-500 cursor-grab"
          style={{ left: `${endPercent}%` }}
          onMouseDown={handleMouseDown('end')}
        />
      </div>

      <div className="flex justify-between mt-1 text-sm text-gray-600 dark:text-gray-300">
        <span>{range[0]}</span>
        <span>{range[1]}</span>
      </div>
    </div>
  );
}

export default Slider;
