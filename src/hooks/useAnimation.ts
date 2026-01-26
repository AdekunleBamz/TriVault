'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Animation timing functions
export const easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0 || t === 1) return t;
    return t < 0.5
      ? Math.pow(2, 10 * (2 * t - 1)) / 2
      : (2 - Math.pow(2, -10 * (2 * t - 1))) / 2;
  },
  easeInBack: (t: number) => {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },
  easeOutBack: (t: number) => {
    const s = 1.70158;
    return --t * t * ((s + 1) * t + s) + 1;
  },
  easeInOutBack: (t: number) => {
    const s = 1.70158 * 1.525;
    if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
    return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
  },
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
};

export type EasingFunction = keyof typeof easings;

/**
 * Hook for animated number transitions
 */
export function useAnimatedValue(
  targetValue: number,
  options: {
    duration?: number;
    easing?: EasingFunction;
  } = {}
): number {
  const { duration = 500, easing = 'easeOutQuad' } = options;
  const [currentValue, setCurrentValue] = useState(targetValue);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef(targetValue);

  useEffect(() => {
    if (currentValue === targetValue) return;

    const easingFn = easings[easing];
    startValueRef.current = currentValue;
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      
      const newValue =
        startValueRef.current + (targetValue - startValueRef.current) * easedProgress;
      
      setCurrentValue(newValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, easing, currentValue]);

  return currentValue;
}

/**
 * Hook for spring-based animations
 */
export function useSpring(
  target: number,
  config: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    precision?: number;
  } = {}
): number {
  const { stiffness = 170, damping = 26, mass = 1, precision = 0.01 } = config;
  const [value, setValue] = useState(target);
  const velocityRef = useRef(0);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.064);
      lastTimeRef.current = timestamp;

      const springForce = stiffness * (target - value);
      const dampingForce = damping * velocityRef.current;
      const acceleration = (springForce - dampingForce) / mass;

      velocityRef.current += acceleration * dt;
      const newValue = value + velocityRef.current * dt;

      const isSettled =
        Math.abs(target - newValue) < precision &&
        Math.abs(velocityRef.current) < precision;

      if (isSettled) {
        setValue(target);
        velocityRef.current = 0;
      } else {
        setValue(newValue);
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = undefined;
    };
  }, [target, stiffness, damping, mass, precision, value]);

  return value;
}

/**
 * Hook for requestAnimationFrame loop
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  deps: React.DependencyList = []
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Hook for transition state management
 */
export function useTransition<T>(
  value: T,
  config: {
    duration?: number;
    delay?: number;
  } = {}
): {
  value: T;
  isTransitioning: boolean;
} {
  const { duration = 300, delay = 0 } = config;
  const [current, setCurrent] = useState(value);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (current === value) return;

    setIsTransitioning(true);

    const delayTimeout = setTimeout(() => {
      setCurrent(value);
    }, delay);

    const transitionTimeout = setTimeout(() => {
      setIsTransitioning(false);
    }, delay + duration);

    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(transitionTimeout);
    };
  }, [value, current, duration, delay]);

  return { value: current, isTransitioning };
}

export default { easings, useAnimatedValue, useSpring, useAnimationFrame, useTransition };
