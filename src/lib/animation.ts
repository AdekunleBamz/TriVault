/**
 * Animation utilities and easing functions
 */

// Common easing functions
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
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeInBounce: (t: number) => 1 - easings.easeOutBounce(1 - t),
  easeInOutBounce: (t: number) =>
    t < 0.5
      ? (1 - easings.easeOutBounce(1 - 2 * t)) / 2
      : (1 + easings.easeOutBounce(2 * t - 1)) / 2,
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export type EasingFunction = (t: number) => number;
export type EasingName = keyof typeof easings;

/**
 * Animate a value from start to end over duration
 */
export function animate(
  from: number,
  to: number,
  duration: number,
  callback: (value: number) => void,
  options?: {
    easing?: EasingName | EasingFunction;
    onComplete?: () => void;
  }
): () => void {
  const { easing = 'easeOutQuad', onComplete } = options || {};
  const easingFn = typeof easing === 'function' ? easing : easings[easing];
  
  const startTime = performance.now();
  let animationFrame: number;

  const tick = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFn(progress);
    const value = from + (to - from) * easedProgress;

    callback(value);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  };

  animationFrame = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(animationFrame);
}

/**
 * Animate multiple values simultaneously
 */
export function animateMultiple(
  values: { from: number; to: number }[],
  duration: number,
  callback: (values: number[]) => void,
  options?: {
    easing?: EasingName | EasingFunction;
    onComplete?: () => void;
  }
): () => void {
  const { easing = 'easeOutQuad', onComplete } = options || {};
  const easingFn = typeof easing === 'function' ? easing : easings[easing];
  
  const startTime = performance.now();
  let animationFrame: number;

  const tick = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFn(progress);

    const currentValues = values.map(
      ({ from, to }) => from + (to - from) * easedProgress
    );

    callback(currentValues);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  };

  animationFrame = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(animationFrame);
}

/**
 * Spring animation parameters
 */
interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
}

/**
 * Create a spring animation
 */
export function spring(
  from: number,
  to: number,
  callback: (value: number, velocity: number) => void,
  config?: SpringConfig & { onComplete?: () => void }
): () => void {
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
    precision = 0.01,
    onComplete,
  } = config || {};

  let position = from;
  let velocity = 0;
  let lastTime = performance.now();
  let animationFrame: number;

  const tick = (currentTime: number) => {
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.064);
    lastTime = currentTime;

    const springForce = -stiffness * (position - to);
    const dampingForce = -damping * velocity;
    const acceleration = (springForce + dampingForce) / mass;

    velocity += acceleration * deltaTime;
    position += velocity * deltaTime;

    callback(position, velocity);

    const isAtRest =
      Math.abs(position - to) < precision && Math.abs(velocity) < precision;

    if (!isAtRest) {
      animationFrame = requestAnimationFrame(tick);
    } else {
      callback(to, 0);
      onComplete?.();
    }
  };

  animationFrame = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(animationFrame);
}

/**
 * Create staggered animations
 */
export function stagger(
  items: number,
  delay: number,
  callback: (index: number) => void
): () => void {
  const timeouts: NodeJS.Timeout[] = [];

  for (let i = 0; i < items; i++) {
    const timeout = setTimeout(() => callback(i), i * delay);
    timeouts.push(timeout);
  }

  return () => timeouts.forEach(clearTimeout);
}

/**
 * CSS keyframe animation classes (for Tailwind)
 */
export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',
  zoomIn: 'animate-in zoom-in duration-300',
  zoomOut: 'animate-out zoom-out duration-300',
  spinIn: 'animate-in spin-in duration-300',
  bounceIn: 'animate-bounce',
  pulse: 'animate-pulse',
  ping: 'animate-ping',
} as const;

/**
 * Get staggered delay class for index
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): string {
  return `delay-[${index * baseDelay}ms]`;
}
