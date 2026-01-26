'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

/**
 * Interactive card that responds to hover and click
 */
export function InteractiveCard({
  children,
  onClick,
  href,
  disabled = false,
  className,
  ...props
}: InteractiveCardProps) {
  const baseStyles = cn(
    'bg-white dark:bg-gray-800 rounded-xl p-6',
    'border border-gray-200 dark:border-gray-700',
    'transition-all duration-200',
    !disabled && 'hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600',
    !disabled && 'hover:-translate-y-1',
    !disabled && (onClick || href) && 'cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  if (href && !disabled) {
    return (
      <a href={href} className={baseStyles} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={
        onClick && !disabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={baseStyles}
      {...props}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Card for displaying statistics with optional change indicator
 */
export function StatsCard({ title, value, change, icon, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl p-6',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm mt-1',
                change.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">{icon}</div>
        )}
      </div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  className?: string;
}

/**
 * Card for showcasing features
 */
export function FeatureCard({ title, description, icon, badge, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl p-6',
        'border border-gray-200 dark:border-gray-700',
        'relative overflow-hidden',
        className
      )}
    >
      {badge && (
        <span className="absolute top-4 right-4 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
          {badge}
        </span>
      )}
      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
}

interface ProfileCardProps {
  name: string;
  role?: string;
  avatar: string;
  stats?: { label: string; value: string }[];
  className?: string;
}

/**
 * Card for displaying user profiles
 */
export function ProfileCard({ name, role, avatar, stats, className }: ProfileCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl p-6 text-center',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <img
        src={avatar}
        alt={name}
        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
      {role && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role}</p>
      )}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

/**
 * Card for displaying pricing plans
 */
export function PricingCard({
  name,
  price,
  period = 'month',
  features,
  highlighted = false,
  ctaText = 'Get Started',
  onCtaClick,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6 relative',
        'border-2',
        highlighted
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
        className
      )}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
          Popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
      <div className="mt-4">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {price}
        </span>
        <span className="text-gray-500 dark:text-gray-400">/{period}</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onCtaClick}
        className={cn(
          'w-full mt-6 py-2 px-4 rounded-lg font-medium transition-colors',
          highlighted
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
        )}
      >
        {ctaText}
      </button>
    </div>
  );
}

export default {
  InteractiveCard,
  StatsCard,
  FeatureCard,
  ProfileCard,
  PricingCard,
};
