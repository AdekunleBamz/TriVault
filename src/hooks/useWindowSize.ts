'use client';

import { useState, useEffect, useCallback } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook to get current window dimensions
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook to get window size with debounce
 */
export function useWindowSizeDebounced(delay: number = 100): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return windowSize;
}

/**
 * Hook to check if window is within a certain breakpoint
 */
export function useBreakpoint() {
  const { width } = useWindowSize();

  return {
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    isLargeDesktop: width >= 1280,
    
    // Tailwind breakpoints
    isSm: width >= 640,
    isMd: width >= 768,
    isLg: width >= 1024,
    isXl: width >= 1280,
    is2xl: width >= 1536,
    
    // Current breakpoint name
    breakpoint: width < 640
      ? 'xs'
      : width < 768
      ? 'sm'
      : width < 1024
      ? 'md'
      : width < 1280
      ? 'lg'
      : width < 1536
      ? 'xl'
      : '2xl',
  };
}

/**
 * Hook to check if window is in portrait or landscape orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const { width, height } = useWindowSize();
  return height > width ? 'portrait' : 'landscape';
}

/**
 * Hook to detect if on mobile device (not just screen width)
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is an old IE property
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouchDevice;
}

/**
 * Hook to get element dimensions
 */
export function useElementSize<T extends HTMLElement>(): [
  (node: T | null) => void,
  { width: number; height: number }
] {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [element, setElement] = useState<T | null>(null);

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [element]);

  return [ref, size];
}

/**
 * Hook to check if viewport is at least a certain width
 */
export function useMinWidth(minWidth: number): boolean {
  const { width } = useWindowSize();
  return width >= minWidth;
}

/**
 * Hook to check if viewport is at most a certain width
 */
export function useMaxWidth(maxWidth: number): boolean {
  const { width } = useWindowSize();
  return width <= maxWidth;
}

/**
 * Hook to get scroll position
 */
export function useScrollPosition(): { x: number; y: number } {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
}

/**
 * Hook to check if user has scrolled past a certain point
 */
export function useScrollPast(threshold: number): boolean {
  const { y } = useScrollPosition();
  return y > threshold;
}

/**
 * Hook to get viewport dimensions and scroll info
 */
export function useViewport() {
  const windowSize = useWindowSize();
  const scrollPosition = useScrollPosition();
  const breakpoint = useBreakpoint();
  const orientation = useOrientation();

  return {
    ...windowSize,
    ...scrollPosition,
    ...breakpoint,
    orientation,
    scrollPercent: typeof document !== 'undefined'
      ? (scrollPosition.y / (document.body.scrollHeight - window.innerHeight)) * 100
      : 0,
  };
}
