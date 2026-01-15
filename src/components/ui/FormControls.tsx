'use client';

import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

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

export function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = '',
}: SwitchProps) {
  const styles = sizeStyles[size];

  return (
    <label
      className={`inline-flex items-center gap-3 cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex flex-shrink-0 ${styles.track} border-2 border-transparent rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          checked ? 'bg-purple-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`pointer-events-none inline-block ${styles.thumb} rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
            checked ? styles.translate : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-gray-300">{label}</span>}
    </label>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className = '',
}: CheckboxProps) {
  return (
    <label
      className={`inline-flex items-start gap-3 cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
            checked
              ? 'bg-purple-500 border-purple-500'
              : 'border-gray-500 bg-transparent'
          }`}
        >
          {checked && (
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      {(label || description) && (
        <div>
          {label && <span className="text-gray-300 font-medium">{label}</span>}
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  name: string;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  value,
  onChange,
  options,
  name,
  disabled = false,
  className = '',
}: RadioGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-start gap-3 cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
                value === option.value
                  ? 'border-purple-500'
                  : 'border-gray-500'
              }`}
            >
              {value === option.value && (
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-300 font-medium">{option.label}</span>
            {option.description && (
              <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
