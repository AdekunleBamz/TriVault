'use client';

import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      resize = 'vertical',
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      id,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = useState(0);
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    useEffect(() => {
      const currentValue = value ?? defaultValue ?? '';
      setCharCount(String(currentValue).length);
    }, [value, defaultValue]);

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        adjustHeight(textareaRef.current);
      }
    }, [value, autoResize]);

    const adjustHeight = (element: HTMLTextAreaElement) => {
      element.style.height = 'auto';
      const lineHeight = parseInt(getComputedStyle(element).lineHeight) || 24;
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      const scrollHeight = element.scrollHeight;
      
      element.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      
      if (autoResize) {
        adjustHeight(e.target);
      }
      
      onChange?.(e);
    };

    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <textarea
            id={textareaId}
            ref={textareaRef}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            maxLength={maxLength}
            rows={autoResize ? minRows : undefined}
            className={cn(
              'w-full px-3 py-2',
              'rounded-lg border transition-colors',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500',
              props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900',
              autoResize ? 'resize-none overflow-hidden' : resizeStyles[resize],
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
            {...props}
          />
        </div>

        <div className="flex justify-between mt-1">
          <div>
            {error && (
              <p id={`${textareaId}-error`} className="text-sm text-red-500">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p id={`${textareaId}-helper`} className="text-sm text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </div>
          
          {showCount && (
            <p className={cn(
              'text-sm',
              maxLength && charCount > maxLength * 0.9
                ? 'text-orange-500'
                : 'text-gray-500 dark:text-gray-400',
              maxLength && charCount >= maxLength && 'text-red-500'
            )}>
              {charCount}{maxLength ? `/${maxLength}` : ''}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Textarea with floating label
interface FloatingTextareaProps extends TextareaProps {
  label: string;
}

export const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);
    const textareaId = props.id || `floating-textarea-${Math.random().toString(36).substr(2, 9)}`;

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative">
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full px-3 pt-6 pb-2',
            'rounded-lg border transition-colors',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        <label
          htmlFor={textareaId}
          className={cn(
            'absolute left-3 transition-all duration-200 pointer-events-none',
            isFloating
              ? 'top-1 text-xs text-purple-600 dark:text-purple-400'
              : 'top-4 text-base text-gray-400'
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

FloatingTextarea.displayName = 'FloatingTextarea';

export default Textarea;
