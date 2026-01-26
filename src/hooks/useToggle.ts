'use client';

import { useState, useCallback } from 'react';

/**
 * Hook to toggle a boolean state
 * @param initialValue - Initial boolean value (default: false)
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
}

/**
 * Simplified toggle that returns a tuple
 */
export function useToggleState(initialValue: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle];
}

/**
 * Hook to cycle through a list of values
 */
export function useCycle<T>(values: T[], initialIndex: number = 0) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % values.length);
  }, [values.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + values.length) % values.length);
  }, [values.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, values.length - 1)));
  }, [values.length]);

  return {
    value: values[currentIndex],
    index: currentIndex,
    next,
    prev,
    goTo,
  };
}

/**
 * Hook to toggle between two values
 */
export function useToggleValue<T>(values: [T, T], initialIndex: 0 | 1 = 0) {
  const [index, setIndex] = useState<0 | 1>(initialIndex);

  const toggle = useCallback(() => {
    setIndex((i) => (i === 0 ? 1 : 0));
  }, []);

  const setFirst = useCallback(() => {
    setIndex(0);
  }, []);

  const setSecond = useCallback(() => {
    setIndex(1);
  }, []);

  return {
    value: values[index],
    isFirst: index === 0,
    isSecond: index === 1,
    toggle,
    setFirst,
    setSecond,
  };
}

/**
 * Hook for disclosure (show/hide) with controlled/uncontrolled support
 */
export function useDisclosure(
  defaultIsOpen: boolean = false,
  controlledIsOpen?: boolean,
  onOpen?: () => void,
  onClose?: () => void
) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultIsOpen);
  
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const open = useCallback(() => {
    if (!isControlled) {
      setUncontrolledIsOpen(true);
    }
    onOpen?.();
  }, [isControlled, onOpen]);

  const close = useCallback(() => {
    if (!isControlled) {
      setUncontrolledIsOpen(false);
    }
    onClose?.();
  }, [isControlled, onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

export default useToggle;
