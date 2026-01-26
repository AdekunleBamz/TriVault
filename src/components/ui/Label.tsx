'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
}

export function Label({
  required,
  optional,
  description,
  error,
  children,
  className,
  ...props
}: LabelProps) {
  return (
    <div className="space-y-1">
      <label
        className={cn(
          'block text-sm font-medium',
          'text-gray-700 dark:text-gray-300',
          error && 'text-red-600 dark:text-red-400',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {required && (
          <span className="ml-1 text-red-500" aria-label="required">
            *
          </span>
        )}
        {optional && (
          <span className="ml-1 text-gray-400 text-xs font-normal">
            (optional)
          </span>
        )}
      </label>
      {description && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({
  label,
  htmlFor,
  required,
  optional,
  description,
  error,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label
        htmlFor={htmlFor}
        required={required}
        optional={optional}
        description={description}
        error={error}
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

interface FormGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormGroup({
  title,
  description,
  children,
  className,
}: FormGroupProps) {
  return (
    <fieldset className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <legend className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </legend>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

interface HelpTextProps {
  children: React.ReactNode;
  error?: boolean;
  className?: string;
}

export function HelpText({ children, error, className }: HelpTextProps) {
  return (
    <p
      className={cn(
        'text-xs mt-1',
        error
          ? 'text-red-600 dark:text-red-400'
          : 'text-gray-500 dark:text-gray-400',
        className
      )}
      role={error ? 'alert' : undefined}
    >
      {children}
    </p>
  );
}

export default Label;
