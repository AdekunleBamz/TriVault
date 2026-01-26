'use client';

import { useEffect, useRef } from 'react';

type EventMap = WindowEventMap & DocumentEventMap & HTMLElementEventMap;

/**
 * Hook to add event listener to window with automatic cleanup
 */
export function useWindowEvent<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) {
  const handlerRef = useRef(handler);

  // Update ref when handler changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: WindowEventMap[K]) => {
      handlerRef.current(event);
    };

    window.addEventListener(eventName, listener, options);

    return () => {
      window.removeEventListener(eventName, listener, options);
    };
  }, [eventName, options]);
}

/**
 * Hook to add event listener to document with automatic cleanup
 */
export function useDocumentEvent<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: DocumentEventMap[K]) => {
      handlerRef.current(event);
    };

    document.addEventListener(eventName, listener, options);

    return () => {
      document.removeEventListener(eventName, listener, options);
    };
  }, [eventName, options]);
}

/**
 * Hook to add event listener to any element with automatic cleanup
 */
export function useEventListener<
  K extends keyof EventMap,
  T extends HTMLElement | Window | Document = HTMLElement
>(
  eventName: K,
  handler: (event: EventMap[K]) => void,
  element?: React.RefObject<T | null> | T | null,
  options?: boolean | AddEventListenerOptions
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    // Get the target element
    const targetElement: T | Window | Document | null =
      element && 'current' in element
        ? element.current
        : element ?? (typeof window !== 'undefined' ? window : null);

    if (!targetElement) return;

    const listener = (event: Event) => {
      handlerRef.current(event as EventMap[K]);
    };

    targetElement.addEventListener(eventName, listener, options);

    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Hook to listen for specific key press
 */
export function useKeyPress(
  targetKey: string,
  handler: (event: KeyboardEvent) => void,
  options?: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean }
) {
  useWindowEvent('keydown', (event) => {
    const { ctrl, shift, alt, meta } = options || {};

    if (ctrl && !event.ctrlKey) return;
    if (shift && !event.shiftKey) return;
    if (alt && !event.altKey) return;
    if (meta && !event.metaKey) return;

    if (event.key === targetKey) {
      handler(event);
    }
  });
}

/**
 * Hook to listen for escape key
 */
export function useEscapeKey(handler: () => void) {
  useKeyPress('Escape', handler);
}

/**
 * Hook to prevent scroll when a condition is true
 */
export function useLockBodyScroll(lock: boolean = true) {
  useEffect(() => {
    if (!lock) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}

export default useEventListener;
