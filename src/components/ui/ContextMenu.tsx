'use client';

import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface ContextMenuItem {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  children?: ContextMenuItem[];
}

interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
}

interface MenuPosition {
  x: number;
  y: number;
}

const ContextMenuContext = createContext<{
  closeMenu: () => void;
} | null>(null);

/**
 * Context menu wrapper component
 */
export function ContextMenu({ children, items, disabled = false }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      
      e.preventDefault();
      e.stopPropagation();

      // Calculate position ensuring menu stays within viewport
      const x = Math.min(e.clientX, window.innerWidth - 200);
      const y = Math.min(e.clientY, window.innerHeight - 300);

      setPosition({ x, y });
      setIsOpen(true);
    },
    [disabled]
  );

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    const handleScroll = () => {
      closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, closeMenu]);

  return (
    <ContextMenuContext.Provider value={{ closeMenu }}>
      <div ref={containerRef} onContextMenu={handleContextMenu} className="inline-block">
        {children}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50"
          style={{ left: position.x, top: position.y }}
        >
          <ContextMenuContent items={items} />
        </div>
      )}
    </ContextMenuContext.Provider>
  );
}

interface ContextMenuContentProps {
  items: ContextMenuItem[];
  className?: string;
}

function ContextMenuContent({ items, className }: ContextMenuContentProps) {
  return (
    <div
      className={cn(
        'min-w-[160px] py-1',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      {items.map((item, index) => (
        <ContextMenuItemComponent key={index} item={item} />
      ))}
    </div>
  );
}

function ContextMenuItemComponent({ item }: { item: ContextMenuItem }) {
  const context = useContext(ContextMenuContext);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  if (item.separator) {
    return <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />;
  }

  const hasSubmenu = item.children && item.children.length > 0;

  const handleClick = () => {
    if (item.disabled || hasSubmenu) return;
    
    item.onClick?.();
    context?.closeMenu();
  };

  return (
    <div
      ref={itemRef}
      className="relative"
      onMouseEnter={() => hasSubmenu && setIsSubmenuOpen(true)}
      onMouseLeave={() => hasSubmenu && setIsSubmenuOpen(false)}
    >
      <button
        onClick={handleClick}
        disabled={item.disabled}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
          'transition-colors',
          item.disabled
            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            : item.danger
            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
      >
        {item.icon && <span className="w-4 h-4">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {item.shortcut && (
          <span className="text-xs text-gray-400 dark:text-gray-500">{item.shortcut}</span>
        )}
        {hasSubmenu && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {hasSubmenu && isSubmenuOpen && (
        <div className="absolute left-full top-0 ml-1">
          <ContextMenuContent items={item.children!} />
        </div>
      )}
    </div>
  );
}

/**
 * Hook for programmatic context menu
 */
export function useContextMenu(items: ContextMenuItem[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });

  const show = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    setIsOpen(false);
  }, []);

  const ContextMenuPortal = useCallback(() => {
    if (!isOpen) return null;

    return (
      <ContextMenuContext.Provider value={{ closeMenu: hide }}>
        <div
          className="fixed inset-0 z-40"
          onClick={hide}
          onContextMenu={(e) => {
            e.preventDefault();
            hide();
          }}
        />
        <div className="fixed z-50" style={{ left: position.x, top: position.y }}>
          <ContextMenuContent items={items} />
        </div>
      </ContextMenuContext.Provider>
    );
  }, [isOpen, position, items, hide]);

  return {
    isOpen,
    show,
    hide,
    ContextMenuPortal,
  };
}

export default ContextMenu;
