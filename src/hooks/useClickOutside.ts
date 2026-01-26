'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to detect clicks outside of a specified element
 * @param handler - Callback function when click outside is detected
 * @param events - DOM events to listen for (default: mousedown, touchstart)
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  events: string[] = ['mousedown', 'touchstart']
) {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);

  // Keep handler ref up to date
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref.current;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handlerRef.current();
    };

    // Add event listeners
    events.forEach((eventName) => {
      document.addEventListener(eventName, listener);
    });

    return () => {
      // Remove event listeners
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener);
      });
    };
  }, [events]);

  return ref;
}

/**
 * Hook to detect clicks outside of multiple elements
 */
export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  events: string[] = ['mousedown', 'touchstart']
) {
  const refs = useRef<(T | null)[]>([]);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const addRef = useCallback((el: T | null, index: number) => {
    refs.current[index] = el;
  }, []);

  useEffect(() => {
    const listener = (event: Event) => {
      const target = event.target as Node;
      
      // Check if click is inside any of the refs
      const isInside = refs.current.some(
        (el) => el && el.contains(target)
      );

      if (!isInside) {
        handlerRef.current();
      }
    };

    events.forEach((eventName) => {
      document.addEventListener(eventName, listener);
    });

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, listener);
      });
    };
  }, [events]);

  return { refs, addRef };
}

export default useClickOutside;
