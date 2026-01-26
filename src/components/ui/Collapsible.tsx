'use client';

import React, {
  useState,
  useCallback,
  createContext,
  useContext,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from 'react';

// ============================================================================
// Types
// ============================================================================

export interface CollapsibleProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export interface CollapsibleTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export interface CollapsibleContentProps {
  children: ReactNode;
  className?: string;
  animationDuration?: number;
  forceMount?: boolean;
}

// Accordion types
export type AccordionType = 'single' | 'multiple';

export interface AccordionSingleProps {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
}

export interface AccordionMultipleProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
} & (AccordionSingleProps | AccordionMultipleProps);

export interface AccordionItemProps {
  children: ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

export interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}

export interface AccordionContentProps {
  children: ReactNode;
  className?: string;
  animationDuration?: number;
}

// ============================================================================
// Collapsible Context
// ============================================================================

interface CollapsibleContextValue {
  open: boolean;
  disabled: boolean;
  toggle: () => void;
  contentId: string;
  triggerId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error(
      'Collapsible components must be used within a Collapsible'
    );
  }
  return context;
}

// ============================================================================
// Collapsible Components
// ============================================================================

let collapsibleIdCounter = 0;

/**
 * Collapsible root component
 */
export function Collapsible({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  className = '',
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const idRef = useRef(`collapsible-${++collapsibleIdCounter}`);
  const contentId = `${idRef.current}-content`;
  const triggerId = `${idRef.current}-trigger`;

  const toggle = useCallback(() => {
    if (disabled) return;
    
    const newOpen = !open;
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  }, [disabled, open, isControlled, onOpenChange]);

  return (
    <CollapsibleContext.Provider
      value={{ open, disabled, toggle, contentId, triggerId }}
    >
      <div
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        className={className}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

/**
 * Collapsible trigger button
 */
export function CollapsibleTrigger({
  children,
  className = '',
}: CollapsibleTriggerProps) {
  const { open, disabled, toggle, contentId, triggerId } =
    useCollapsibleContext();

  return (
    <button
      id={triggerId}
      type="button"
      aria-controls={contentId}
      aria-expanded={open}
      data-state={open ? 'open' : 'closed'}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      onClick={toggle}
      className={`w-full text-left ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Collapsible content with animation
 */
export function CollapsibleContent({
  children,
  className = '',
  animationDuration = 200,
  forceMount = false,
}: CollapsibleContentProps) {
  const { open, contentId, triggerId } = useCollapsibleContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(open ? 'auto' : 0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (open) {
      // Opening: measure height and animate
      const scrollHeight = content.scrollHeight;
      setHeight(scrollHeight);
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setHeight('auto');
        setIsAnimating(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    } else {
      // Closing: set current height, then animate to 0
      const scrollHeight = content.scrollHeight;
      setHeight(scrollHeight);
      setIsAnimating(true);

      // Force reflow
      content.offsetHeight;

      requestAnimationFrame(() => {
        setHeight(0);
      });

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [open, animationDuration]);

  if (!open && !isAnimating && !forceMount) {
    return null;
  }

  const style: CSSProperties = {
    height: height === 'auto' ? 'auto' : `${height}px`,
    overflow: 'hidden',
    transition: isAnimating
      ? `height ${animationDuration}ms ease-out`
      : undefined,
  };

  return (
    <div
      ref={contentRef}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      data-state={open ? 'open' : 'closed'}
      hidden={!open && !isAnimating}
      style={style}
      className={className}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Accordion Context
// ============================================================================

interface AccordionContextValue {
  type: AccordionType;
  value: string[];
  disabled: boolean;
  onItemToggle: (itemValue: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
}

interface AccordionItemContextValue {
  value: string;
  disabled: boolean;
  open: boolean;
  triggerId: string;
  contentId: string;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      'AccordionItem components must be used within an AccordionItem'
    );
  }
  return context;
}

// ============================================================================
// Accordion Components
// ============================================================================

let accordionIdCounter = 0;

/**
 * Accordion root component
 */
export function Accordion(props: AccordionProps) {
  const { children, className = '', disabled = false, type } = props;

  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(() => {
    if (type === 'single') {
      const defaultVal = (props as AccordionSingleProps).defaultValue;
      return defaultVal ? [defaultVal] : [];
    } else {
      return (props as AccordionMultipleProps).defaultValue ?? [];
    }
  });

  const isControlled =
    type === 'single'
      ? (props as AccordionSingleProps).value !== undefined
      : (props as AccordionMultipleProps).value !== undefined;

  const value = isControlled
    ? type === 'single'
      ? [(props as AccordionSingleProps).value!]
      : (props as AccordionMultipleProps).value!
    : uncontrolledValue;

  const onItemToggle = useCallback(
    (itemValue: string) => {
      if (disabled) return;

      let newValue: string[];

      if (type === 'single') {
        const collapsible = (props as AccordionSingleProps).collapsible ?? true;
        if (value.includes(itemValue)) {
          newValue = collapsible ? [] : [itemValue];
        } else {
          newValue = [itemValue];
        }

        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        (props as AccordionSingleProps).onValueChange?.(newValue[0] ?? '');
      } else {
        if (value.includes(itemValue)) {
          newValue = value.filter((v) => v !== itemValue);
        } else {
          newValue = [...value, itemValue];
        }

        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        (props as AccordionMultipleProps).onValueChange?.(newValue);
      }
    },
    [disabled, type, value, isControlled, props]
  );

  return (
    <AccordionContext.Provider
      value={{ type, value, disabled, onItemToggle }}
    >
      <div data-accordion-type={type} className={className}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

/**
 * Accordion item wrapper
 */
export function AccordionItem({
  children,
  value,
  disabled: itemDisabled = false,
  className = '',
}: AccordionItemProps) {
  const accordion = useAccordionContext();
  const disabled = accordion.disabled || itemDisabled;
  const open = accordion.value.includes(value);

  const idRef = useRef(`accordion-item-${++accordionIdCounter}`);
  const triggerId = `${idRef.current}-trigger`;
  const contentId = `${idRef.current}-content`;

  return (
    <AccordionItemContext.Provider
      value={{ value, disabled, open, triggerId, contentId }}
    >
      <div
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        className={`border-b border-gray-200 dark:border-gray-700 ${className}`}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

/**
 * Accordion trigger/header
 */
export function AccordionTrigger({
  children,
  className = '',
}: AccordionTriggerProps) {
  const accordion = useAccordionContext();
  const item = useAccordionItemContext();

  const handleClick = () => {
    accordion.onItemToggle(item.value);
  };

  return (
    <h3 className="flex">
      <button
        id={item.triggerId}
        type="button"
        aria-controls={item.contentId}
        aria-expanded={item.open}
        data-state={item.open ? 'open' : 'closed'}
        data-disabled={item.disabled ? '' : undefined}
        disabled={item.disabled}
        onClick={handleClick}
        className={`flex flex-1 items-center justify-between py-4 text-left font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className}`}
      >
        {children}
        <svg
          className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </h3>
  );
}

/**
 * Accordion content panel
 */
export function AccordionContent({
  children,
  className = '',
  animationDuration = 200,
}: AccordionContentProps) {
  const item = useAccordionItemContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>(item.open ? 'auto' : 0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (item.open) {
      const scrollHeight = content.scrollHeight;
      setHeight(scrollHeight);
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setHeight('auto');
        setIsAnimating(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    } else {
      const scrollHeight = content.scrollHeight;
      setHeight(scrollHeight);
      setIsAnimating(true);

      content.offsetHeight;

      requestAnimationFrame(() => {
        setHeight(0);
      });

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [item.open, animationDuration]);

  if (!item.open && !isAnimating) {
    return null;
  }

  const style: CSSProperties = {
    height: height === 'auto' ? 'auto' : `${height}px`,
    overflow: 'hidden',
    transition: isAnimating
      ? `height ${animationDuration}ms ease-out`
      : undefined,
  };

  return (
    <div
      ref={contentRef}
      id={item.contentId}
      role="region"
      aria-labelledby={item.triggerId}
      data-state={item.open ? 'open' : 'closed'}
      hidden={!item.open && !isAnimating}
      style={style}
    >
      <div className={`pb-4 pt-0 ${className}`}>{children}</div>
    </div>
  );
}

// ============================================================================
// Simple Collapsible Card
// ============================================================================

export interface CollapsibleCardProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

/**
 * Pre-styled collapsible card component
 */
export function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
  icon,
  badge,
  className = '',
}: CollapsibleCardProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={`rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      <CollapsibleTrigger className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="font-medium text-gray-900 dark:text-white">
            {title}
          </span>
          {badge}
        </div>
        <svg
          className="h-5 w-5 text-gray-500 transition-transform [[data-state=open]_&]:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-gray-200 dark:border-gray-700">
        <div className="p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default Accordion;
