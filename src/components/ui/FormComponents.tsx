'use client';

import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Form field wrapper with label, error, and description
 */
export function FormField({
  label,
  name,
  error,
  description,
  required,
  children,
  className,
}: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {React.isValidElement(children) &&
        React.cloneElement(children as React.ReactElement<{ id?: string; 'aria-describedby'?: string }>, {
          id: name,
          'aria-describedby': [description && descriptionId, error && errorId]
            .filter(Boolean)
            .join(' ') || undefined,
        })}
      {description && !error && (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: { label: string; value: string; disabled?: boolean }[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Radio button group
 */
export function RadioGroup({
  name,
  value,
  onChange,
  options,
  orientation = 'vertical',
  className,
}: RadioGroupProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            option.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => !option.disabled && onChange?.(option.value)}
            disabled={option.disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

interface CheckboxGroupProps {
  name: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  options: { label: string; value: string; disabled?: boolean }[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Checkbox group
 */
export function CheckboxGroup({
  name,
  value = [],
  onChange,
  options,
  orientation = 'vertical',
  className,
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange?.([...value, optionValue]);
    } else {
      onChange?.(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div
      role="group"
      className={cn(
        'flex gap-3',
        orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            option.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="checkbox"
            name={name}
            value={option.value}
            checked={value.includes(option.value)}
            onChange={(e) => !option.disabled && handleChange(option.value, e.target.checked)}
            disabled={option.disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

/**
 * Form action buttons container
 */
export function FormActions({ children, align = 'right', className }: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex gap-3 pt-4',
        align === 'left' && 'justify-start',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        align === 'between' && 'justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}

interface FieldsetProps {
  legend: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Fieldset with legend
 */
export function Fieldset({ legend, description, children, className }: FieldsetProps) {
  return (
    <fieldset className={cn('border border-gray-200 dark:border-gray-700 rounded-lg p-4', className)}>
      <legend className="text-lg font-medium text-gray-900 dark:text-white px-2">{legend}</legend>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

interface InlineFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

/**
 * Inline form layout
 */
export const InlineForm = forwardRef<HTMLFormElement, InlineFormProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('flex items-end gap-3', className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);
InlineForm.displayName = 'InlineForm';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Form section with title
 */
export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default {
  FormField,
  RadioGroup,
  CheckboxGroup,
  FormActions,
  Fieldset,
  InlineForm,
  FormSection,
};
