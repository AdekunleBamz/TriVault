'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Checkbox component
interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  label?: string;
  description?: string;
  className?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
}

export function Checkbox({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  label,
  description,
  className,
  id,
  size = 'md',
  error = false,
}: CheckboxProps) {
  const [isChecked, setIsChecked] = React.useState(checked ?? defaultChecked);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = e.target.checked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const checkboxElement = (
    <div className="relative">
      <input
        ref={inputRef}
        type="checkbox"
        id={id}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={cn(
          'rounded border-2 transition-colors',
          'peer-focus:ring-2 peer-focus:ring-purple-500 peer-focus:ring-offset-2',
          isChecked || indeterminate
            ? 'bg-purple-600 border-purple-600'
            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
          error && 'border-red-500',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeStyles[size]
        )}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        {(isChecked || indeterminate) && (
          <svg
            className="w-full h-full text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            {indeterminate ? (
              <path d="M5 12h14" strokeLinecap="round" />
            ) : (
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        )}
      </div>
    </div>
  );

  if (label || description) {
    return (
      <div className={cn('flex items-start gap-3', className)}>
        {checkboxElement}
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium text-gray-900 dark:text-gray-100',
                disabled && 'opacity-50',
                !disabled && 'cursor-pointer'
              )}
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

  return <span className={className}>{checkboxElement}</span>;
}

// Radio button component
interface RadioProps {
  checked?: boolean;
  onChange?: () => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  name?: string;
  value?: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Radio({
  checked = false,
  onChange,
  disabled = false,
  label,
  description,
  className,
  name,
  value,
  id,
  size = 'md',
}: RadioProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const dotSizeStyles = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const radioElement = (
    <div className="relative">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={cn(
          'rounded-full border-2 transition-colors flex items-center justify-center',
          'peer-focus:ring-2 peer-focus:ring-purple-500 peer-focus:ring-offset-2',
          checked
            ? 'border-purple-600'
            : 'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeStyles[size]
        )}
      >
        {checked && (
          <div className={cn('rounded-full bg-purple-600', dotSizeStyles[size])} />
        )}
      </div>
    </div>
  );

  if (label || description) {
    return (
      <div className={cn('flex items-start gap-3', className)}>
        {radioElement}
        <div className="flex-1">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                'text-sm font-medium text-gray-900 dark:text-gray-100',
                disabled && 'opacity-50',
                !disabled && 'cursor-pointer'
              )}
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

  return <span className={className}>{radioElement}</span>;
}

// Radio group component
interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export function RadioGroup({
  options,
  value,
  defaultValue,
  onChange,
  name,
  className,
  orientation = 'vertical',
}: RadioGroupProps) {
  const [selectedValue, setSelectedValue] = React.useState(value ?? defaultValue ?? '');

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

  return (
    <div
      className={cn(
        'gap-4',
        orientation === 'vertical' ? 'flex flex-col' : 'flex flex-wrap',
        className
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          id={`${name}-${option.value}`}
          name={name}
          value={option.value}
          checked={selectedValue === option.value}
          onChange={() => handleChange(option.value)}
          disabled={option.disabled}
          label={option.label}
          description={option.description}
        />
      ))}
    </div>
  );
}

// Checkbox group
interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export function CheckboxGroup({
  options,
  value,
  defaultValue,
  onChange,
  className,
  orientation = 'vertical',
}: CheckboxGroupProps) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(value ?? defaultValue ?? []);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValues(value);
    }
  }, [value]);

  const handleChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v) => v !== optionValue);
    setSelectedValues(newValues);
    onChange?.(newValues);
  };

  return (
    <div
      className={cn(
        'gap-4',
        orientation === 'vertical' ? 'flex flex-col' : 'flex flex-wrap',
        className
      )}
    >
      {options.map((option) => (
        <Checkbox
          key={option.value}
          id={option.value}
          checked={selectedValues.includes(option.value)}
          onChange={(checked) => handleChange(option.value, checked)}
          disabled={option.disabled}
          label={option.label}
          description={option.description}
        />
      ))}
    </div>
  );
}

export default Checkbox;
