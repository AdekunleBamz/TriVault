'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

/**
 * Search input with icon and clear button
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, onClear, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState('');
    const currentValue = value ?? internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(currentValue as string);
      }
    };

    return (
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={ref}
          type="search"
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full pl-10 pr-10 py-2 rounded-lg',
            'border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            className
          )}
          {...props}
        />
        {currentValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrength?: boolean;
}

/**
 * Password input with visibility toggle and strength indicator
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, value, onChange, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const [internalValue, setInternalValue] = useState('');
    const currentValue = (value ?? internalValue) as string;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const getStrength = (password: string): { level: number; label: string; color: string } => {
      let score = 0;
      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
      if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
      if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
      if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-green-500' };
      return { level: 5, label: 'Very Strong', color: 'bg-emerald-500' };
    };

    const strength = showStrength && currentValue ? getStrength(currentValue) : null;

    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            value={currentValue}
            onChange={handleChange}
            className={cn(
              'w-full px-4 py-2 pr-10 rounded-lg',
              'border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {visible ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {strength && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    level <= strength.level ? strength.color : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">{strength.label}</p>
          </div>
        )}
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Number input with increment/decrement buttons
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value = 0, onChange, min, max, step = 1, ...props }, ref) => {
    const handleChange = (newValue: number) => {
      if (min !== undefined && newValue < min) return;
      if (max !== undefined && newValue > max) return;
      onChange?.(newValue);
    };

    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => handleChange(value - step)}
          disabled={min !== undefined && value <= min}
          className={cn(
            'px-3 py-2 rounded-l-lg',
            'border border-r-0 border-gray-300 dark:border-gray-600',
            'bg-gray-100 dark:bg-gray-700',
            'hover:bg-gray-200 dark:hover:bg-gray-600',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          −
        </button>
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className={cn(
            'w-20 px-3 py-2 text-center',
            'border-y border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => handleChange(value + step)}
          disabled={max !== undefined && value >= max}
          className={cn(
            'px-3 py-2 rounded-r-lg',
            'border border-l-0 border-gray-300 dark:border-gray-600',
            'bg-gray-100 dark:bg-gray-700',
            'hover:bg-gray-200 dark:hover:bg-gray-600',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          +
        </button>
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

/**
 * Input for entering multiple tags
 */
export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag...',
  maxTags = 10,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag && !value.includes(tag) && value.length < maxTags) {
        onChange?.([...value, tag]);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange?.(value.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange?.(value.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 p-2 rounded-lg',
        'border border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-800',
        className
      )}
    >
      {value.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="hover:text-blue-900 dark:hover:text-blue-100"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length < maxTags ? placeholder : ''}
        disabled={value.length >= maxTags}
        className="flex-1 min-w-[100px] bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-500"
      />
    </div>
  );
}

export default {
  SearchInput,
  PasswordInput,
  NumberInput,
  TagInput,
};
