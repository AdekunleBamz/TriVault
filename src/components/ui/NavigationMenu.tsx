'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
  disabled?: boolean;
}

interface NavigationMenuProps {
  items: NavItem[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Navigation menu with support for nested items and badges
 */
export function NavigationMenu({
  items,
  orientation = 'horizontal',
  className,
}: NavigationMenuProps) {
  const [openMenus, setOpenMenus] = useState<Set<number>>(new Set());

  const toggleMenu = (index: number) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <nav
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row gap-1' : 'flex-col gap-0.5',
        className
      )}
    >
      {items.map((item, index) => (
        <NavMenuItem
          key={index}
          item={item}
          isOpen={openMenus.has(index)}
          onToggle={() => toggleMenu(index)}
          orientation={orientation}
        />
      ))}
    </nav>
  );
}

interface NavMenuItemProps {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
  orientation: 'horizontal' | 'vertical';
  depth?: number;
}

function NavMenuItem({
  item,
  isOpen,
  onToggle,
  orientation,
  depth = 0,
}: NavMenuItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const content = (
    <>
      {item.icon && <span className="mr-2">{item.icon}</span>}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
          {item.badge}
        </span>
      )}
      {hasChildren && (
        <svg
          className={cn(
            'ml-2 h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </>
  );

  const baseStyles = cn(
    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
    'text-gray-700 dark:text-gray-200',
    !item.disabled && 'hover:bg-gray-100 dark:hover:bg-gray-800',
    item.disabled && 'opacity-50 cursor-not-allowed',
    depth > 0 && 'ml-4'
  );

  if (hasChildren) {
    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={item.disabled ? undefined : onToggle}
          className={baseStyles}
          disabled={item.disabled}
        >
          {content}
        </button>
        {isOpen && (
          <div
            className={cn(
              'py-1',
              orientation === 'horizontal'
                ? 'absolute left-0 top-full mt-1 min-w-[200px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50'
                : 'border-l border-gray-200 dark:border-gray-700 ml-4 mt-1'
            )}
          >
            {item.children!.map((child, idx) => (
              <NavMenuItem
                key={idx}
                item={child}
                isOpen={false}
                onToggle={() => {}}
                orientation={orientation}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        className={baseStyles}
        onClick={item.disabled ? (e) => e.preventDefault() : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={item.disabled ? undefined : item.onClick}
      className={baseStyles}
      disabled={item.disabled}
    >
      {content}
    </button>
  );
}

interface MobileNavProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile navigation drawer
 */
export function MobileNav({ items, isOpen, onClose }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl z-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4">
          <NavigationMenu items={items} orientation="vertical" />
        </nav>
      </div>
    </>
  );
}

interface BreadcrumbNavProps {
  items: { label: string; href?: string }[];
  separator?: React.ReactNode;
  className?: string;
}

/**
 * Breadcrumb navigation
 */
export function BreadcrumbNav({
  items,
  separator = '/',
  className,
}: BreadcrumbNavProps) {
  return (
    <nav className={cn('flex items-center text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="mx-2 text-gray-400">{separator}</span>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default NavigationMenu;
