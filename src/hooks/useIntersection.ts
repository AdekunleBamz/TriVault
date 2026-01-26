'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseIntersectionOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
}

interface UseIntersectionReturn {
  ref: React.RefObject<HTMLElement>;
  inView: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook for Intersection Observer
 */
export function useIntersection<T extends HTMLElement = HTMLElement>(
  options: UseIntersectionOptions = {}
): UseIntersectionReturn & { ref: React.RefObject<T> } {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = false, onChange } = options;
  
  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [inView, setInView] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (triggerOnce && hasTriggered.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        setInView(entry.isIntersecting);
        onChange?.(entry);

        if (entry.isIntersecting && triggerOnce) {
          hasTriggered.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin, triggerOnce, onChange]);

  return { ref, inView, entry };
}

/**
 * Hook for lazy loading with intersection observer
 */
export function useLazyLoad<T extends HTMLElement = HTMLElement>(options: {
  rootMargin?: string;
  onLoad?: () => void;
} = {}) {
  const { rootMargin = '200px', onLoad } = options;
  const ref = useRef<T>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          onLoad?.();
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, shouldLoad, onLoad]);

  return { ref, shouldLoad };
}

/**
 * Hook for tracking element visibility percentage
 */
export function useVisibilityRatio<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setRatio(entry.intersectionRatio);
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, ratio, isVisible: ratio > 0 };
}

/**
 * Hook for sticky detection
 */
export function useStickyDetection<T extends HTMLElement = HTMLElement>(options: {
  offset?: number;
} = {}) {
  const { offset = 0 } = options;
  const ref = useRef<T>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      {
        rootMargin: `-${offset + 1}px 0px 0px 0px`,
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [offset]);

  return {
    ref,
    sentinelRef,
    isStuck,
    StickyWrapper: useCallback(
      ({ children }: { children: React.ReactNode }) => (
        <>
          <div ref={sentinelRef} className="h-0 w-full" aria-hidden />
          <div ref={ref as React.RefObject<HTMLDivElement>}>{children}</div>
        </>
      ),
      []
    ),
  };
}

/**
 * Hook for section tracking (for table of contents)
 */
export function useSectionTracking(
  sectionIds: string[],
  options: { rootMargin?: string } = {}
) {
  const { rootMargin = '-20% 0px -80% 0px' } = options;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds, rootMargin]);

  return activeSection;
}

/**
 * Hook for reveal animations on scroll
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(options: {
  animation?: string;
  delay?: number;
  duration?: number;
} = {}) {
  const { animation = 'fade-in-up', delay = 0, duration = 500 } = options;
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isRevealed) {
          setTimeout(() => {
            setIsRevealed(true);
            element.style.opacity = '1';
            element.style.transform = 'none';
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    // Set initial hidden state
    element.style.opacity = '0';
    element.style.transform = animation.includes('up')
      ? 'translateY(20px)'
      : animation.includes('down')
      ? 'translateY(-20px)'
      : animation.includes('left')
      ? 'translateX(20px)'
      : animation.includes('right')
      ? 'translateX(-20px)'
      : 'none';
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;

    observer.observe(element);

    return () => observer.disconnect();
  }, [animation, delay, duration, isRevealed]);

  return { ref, isRevealed };
}

export default useIntersection;
