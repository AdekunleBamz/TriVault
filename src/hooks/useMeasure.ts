'use client';

import { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react';

interface Dimensions {
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
  x: number;
  y: number;
}

const initialDimensions: Dimensions = {
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  x: 0,
  y: 0,
};

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Hook to measure element dimensions using ResizeObserver
 */
export function useMeasure<T extends HTMLElement = HTMLElement>(): [
  (node: T | null) => void,
  Dimensions
] {
  const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);
  const previousNode = useRef<T | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const cleanup = useCallback(() => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
  }, []);

  const ref = useCallback(
    (node: T | null) => {
      if (previousNode.current === node) return;

      cleanup();

      if (node) {
        resizeObserverRef.current = new ResizeObserver(([entry]) => {
          if (entry) {
            const rect = entry.target.getBoundingClientRect();
            setDimensions({
              width: rect.width,
              height: rect.height,
              top: rect.top,
              left: rect.left,
              bottom: rect.bottom,
              right: rect.right,
              x: rect.x,
              y: rect.y,
            });
          }
        });
        resizeObserverRef.current.observe(node);
      }

      previousNode.current = node;
    },
    [cleanup]
  );

  // Cleanup on unmount
  useIsomorphicLayoutEffect(() => {
    return cleanup;
  }, [cleanup]);

  return [ref, dimensions];
}

/**
 * Hook to get element dimensions from a ref
 */
export function useElementSize<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      setSize({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { ref, ...size };
}

/**
 * Hook to get bounding client rect with updates on scroll/resize
 */
export function useBoundingRect<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    updateRect();

    window.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('resize', updateRect, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
    };
  }, [updateRect]);

  return { ref, rect, updateRect };
}

/**
 * Hook to check if element fits in viewport
 */
export function useInViewport<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isInViewport };
}

export default useMeasure;
