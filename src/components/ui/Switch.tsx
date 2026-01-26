'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className,
  id,
}: SwitchProps) {
  const [isChecked, setIsChecked] = React.useState(checked ?? defaultChecked);

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const sizeStyles = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const switchElement = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleChange}
      className={cn(
        'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        isChecked 
          ? 'bg-purple-600' 
          : 'bg-gray-200 dark:bg-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
        sizeStyles[size].track
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow ring-0',
          'transform transition duration-200 ease-in-out',
          isChecked ? sizeStyles[size].translate : 'translate-x-0',
          sizeStyles[size].thumb
        )}
      />
    </button>
  );

  if (label || description) {
    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="flex-shrink-0 pt-0.5">
          {switchElement}
        </div>
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium text-gray-900 dark:text-gray-100',
                disabled && 'opacity-50',
                !disabled && 'cursor-pointer'
              )}
              onClick={handleChange}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn('text-sm text-gray-500 dark:text-gray-400', disabled && 'opacity-50')}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <span className={className}>{switchElement}</span>;
}

// Switch group for multiple options
interface SwitchGroupOption {
  id: string;
  label: string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
}

interface SwitchGroupProps {
  options: SwitchGroupOption[];
  onChange?: (id: string, checked: boolean) => void;
  className?: string;
}

export function SwitchGroup({ options, onChange, className }: SwitchGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {options.map((option) => (
        <Switch
          key={option.id}
          id={option.id}
          checked={option.checked}
          disabled={option.disabled}
          label={option.label}
          description={option.description}
          onChange={(checked) => onChange?.(option.id, checked)}
        />
      ))}
    </div>
  );
}

// Labeled switch with icon indicators
interface LabeledSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  onLabel?: string;
  offLabel?: string;
  className?: string;
}

export function LabeledSwitch({
  checked = false,
  onChange,
  disabled = false,
  onLabel = 'On',
  offLabel = 'Off',
  className,
}: LabeledSwitchProps) {
  const [isChecked, setIsChecked] = React.useState(checked);

  React.useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn(
        'text-sm',
        !isChecked ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'
      )}>
        {offLabel}
      </span>
      <Switch
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={cn(
        'text-sm',
        isChecked ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'
      )}>
        {onLabel}
      </span>
    </div>
  );
}

// Switch with loading state
interface LoadingSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => Promise<void>;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function LoadingSwitch({
  checked = false,
  onChange,
  disabled = false,
  label,
  className,
}: LoadingSwitchProps) {
  const [isChecked, setIsChecked] = React.useState(checked);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = async () => {
    if (disabled || isLoading) return;
    const newValue = !isChecked;
    setIsLoading(true);
    try {
      await onChange?.(newValue);
      setIsChecked(newValue);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled || isLoading}
        onClick={handleChange}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full',
          'border-2 border-transparent transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          isChecked ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700',
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-flex h-5 w-5 items-center justify-center',
            'rounded-full bg-white shadow ring-0',
            'transform transition duration-200',
            isChecked ? 'translate-x-5' : 'translate-x-0'
          )}
        >
          {isLoading && (
            <svg className="animate-spin h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </span>
      </button>
      {label && (
        <span className={cn(
          'text-sm text-gray-900 dark:text-gray-100',
          (disabled || isLoading) && 'opacity-50'
        )}>
          {label}
        </span>
      )}
    </div>
  );
}

export default Switch;
