'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseHoverOptions {
  /** Delay before setting hover to true (ms) */
  enterDelay?: number;
  /** Delay before setting hover to false (ms) */
  leaveDelay?: number;
}

interface UseHoverReturn<T> {
  /** Ref to attach to the element */
  ref: React.RefObject<T | null>;
  /** Whether the element is currently hovered */
  isHovered: boolean;
}

/**
 * Hook to track hover state of an element
 * @param options - Optional configuration for enter/leave delays
 */
export function useHover<T extends HTMLElement = HTMLElement>(
  options: UseHoverOptions = {}
): UseHoverReturn<T> {
  const { enterDelay = 0, leaveDelay = 0 } = options;
  
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimeouts = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearTimeouts();
    
    if (enterDelay > 0) {
      enterTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, enterDelay);
    } else {
      setIsHovered(true);
    }
  }, [enterDelay, clearTimeouts]);

  const handleMouseLeave = useCallback(() => {
    clearTimeouts();
    
    if (leaveDelay > 0) {
      leaveTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, leaveDelay);
    } else {
      setIsHovered(false);
    }
  }, [leaveDelay, clearTimeouts]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeouts();
    };
  }, [handleMouseEnter, handleMouseLeave, clearTimeouts]);

  return { ref, isHovered };
}

/**
 * Hook to track hover state with callback handlers
 */
export function useHoverCallback<T extends HTMLElement = HTMLElement>(
  onEnter?: () => void,
  onLeave?: () => void
) {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    onEnter?.();
  }, [onEnter]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    onLeave?.();
  }, [onLeave]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return { ref, isHovered };
}

/**
 * Hook props-based hover (useful for components that can't use refs)
 */
export function useHoverProps() {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: useCallback(() => setIsHovered(true), []),
    onMouseLeave: useCallback(() => setIsHovered(false), []),
  };

  return { isHovered, hoverProps };
}

export default useHover;
