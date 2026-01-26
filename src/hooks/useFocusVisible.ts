'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Track focus-visible state for an element
 * Distinguishes between keyboard and mouse focus
 */
export function useFocusVisible<T extends HTMLElement = HTMLElement>(): {
  ref: React.RefObject<T>;
  isFocused: boolean;
  isFocusVisible: boolean;
  focusProps: {
    onFocus: () => void;
    onBlur: () => void;
  };
} {
  const ref = useRef<T>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const hadKeyboardEvent = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        hadKeyboardEvent.current = true;
      }
    };

    const handleMouseDown = () => {
      hadKeyboardEvent.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsFocusVisible(hadKeyboardEvent.current);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsFocusVisible(false);
  }, []);

  return {
    ref,
    isFocused,
    isFocusVisible,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}

/**
 * Track if any element on the page has focus-visible
 */
export function useFocusVisibleWithin(): boolean {
  const [hasFocusVisible, setHasFocusVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target?.matches?.(':focus-visible')) {
        setHasFocusVisible(true);
      }
    };

    const handleFocusOut = () => {
      setHasFocusVisible(false);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return hasFocusVisible;
}

/**
 * Hook to programmatically manage focus
 */
export function useFocusManager<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  const focus = useCallback(() => {
    ref.current?.focus();
  }, []);

  const blur = useCallback(() => {
    ref.current?.blur();
  }, []);

  const focusFirst = useCallback(() => {
    if (!ref.current) return;
    
    const focusable = ref.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, []);

  const focusLast = useCallback(() => {
    if (!ref.current) return;
    
    const focusables = ref.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusables[focusables.length - 1]?.focus();
  }, []);

  return {
    ref,
    focus,
    blur,
    focusFirst,
    focusLast,
  };
}

/**
 * Hook to manage focus ring styles
 */
export function useFocusRing(): {
  isFocusVisible: boolean;
  focusRingProps: {
    onFocus: () => void;
    onBlur: () => void;
    onKeyUp: (e: React.KeyboardEvent) => void;
  };
  focusRingClass: string;
} {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const hadKeyboardFocus = useRef(false);

  const handleFocus = useCallback(() => {
    if (hadKeyboardFocus.current) {
      setIsFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      hadKeyboardFocus.current = true;
    }
  }, []);

  useEffect(() => {
    const handleMouseDown = () => {
      hadKeyboardFocus.current = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        hadKeyboardFocus.current = true;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const focusRingClass = isFocusVisible
    ? 'ring-2 ring-offset-2 ring-blue-500 outline-none'
    : '';

  return {
    isFocusVisible,
    focusRingProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyUp: handleKeyUp,
    },
    focusRingClass,
  };
}

export default useFocusVisible;
