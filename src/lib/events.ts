/**
 * Type-safe event emitter utilities
 */

type EventHandler<T = unknown> = (data: T) => void;
type EventMap = Record<string, unknown>;

/**
 * Type-safe event emitter class
 */
export class EventEmitter<Events extends EventMap = EventMap> {
  private listeners = new Map<keyof Events, Set<EventHandler<unknown>>>();

  on<E extends keyof Events>(event: E, handler: EventHandler<Events[E]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(handler as EventHandler<unknown>);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  once<E extends keyof Events>(event: E, handler: EventHandler<Events[E]>): () => void {
    const onceHandler = ((data: Events[E]) => {
      this.off(event, onceHandler);
      handler(data);
    }) as EventHandler<Events[E]>;

    return this.on(event, onceHandler);
  }

  off<E extends keyof Events>(event: E, handler: EventHandler<Events[E]>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler<unknown>);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<E extends keyof Events>(event: E, data: Events[E]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${String(event)}":`, error);
        }
      });
    }
  }

  removeAllListeners<E extends keyof Events>(event?: E): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount<E extends keyof Events>(event: E): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  eventNames(): (keyof Events)[] {
    return Array.from(this.listeners.keys());
  }
}

/**
 * Create a typed event bus for application-wide events
 */
export function createEventBus<Events extends EventMap>() {
  return new EventEmitter<Events>();
}

/**
 * Pub/Sub pattern implementation
 */
export class PubSub<Topics extends EventMap = EventMap> {
  private subscribers = new Map<keyof Topics, Set<EventHandler<unknown>>>();
  private history = new Map<keyof Topics, unknown[]>();
  private historyLimit: number;

  constructor(options: { historyLimit?: number } = {}) {
    this.historyLimit = options.historyLimit ?? 0;
  }

  subscribe<T extends keyof Topics>(
    topic: T,
    handler: EventHandler<Topics[T]>,
    options: { replay?: boolean } = {}
  ): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }

    this.subscribers.get(topic)!.add(handler as EventHandler<unknown>);

    // Replay history if requested
    if (options.replay && this.history.has(topic)) {
      this.history.get(topic)!.forEach((data) => {
        handler(data as Topics[T]);
      });
    }

    return () => this.unsubscribe(topic, handler);
  }

  unsubscribe<T extends keyof Topics>(topic: T, handler: EventHandler<Topics[T]>): void {
    this.subscribers.get(topic)?.delete(handler as EventHandler<unknown>);
  }

  publish<T extends keyof Topics>(topic: T, data: Topics[T]): void {
    // Store in history
    if (this.historyLimit > 0) {
      if (!this.history.has(topic)) {
        this.history.set(topic, []);
      }
      const topicHistory = this.history.get(topic)!;
      topicHistory.push(data);
      if (topicHistory.length > this.historyLimit) {
        topicHistory.shift();
      }
    }

    // Notify subscribers
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in subscriber for "${String(topic)}":`, error);
        }
      });
    }
  }

  clearHistory<T extends keyof Topics>(topic?: T): void {
    if (topic) {
      this.history.delete(topic);
    } else {
      this.history.clear();
    }
  }
}

/**
 * Observable value that emits changes
 */
export class Observable<T> {
  private value: T;
  private subscribers = new Set<EventHandler<T>>();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  update(updater: (current: T) => T): void {
    this.set(updater(this.value));
  }

  subscribe(handler: EventHandler<T>): () => void {
    this.subscribers.add(handler);
    // Immediately emit current value
    handler(this.value);
    return () => this.subscribers.delete(handler);
  }

  private notify(): void {
    this.subscribers.forEach((handler) => handler(this.value));
  }
}

/**
 * Computed observable that derives from other observables
 */
export function computed<T, D extends unknown[]>(
  deps: { [K in keyof D]: Observable<D[K]> },
  compute: (...values: D) => T
): Observable<T> {
  const getValues = () => deps.map((dep) => dep.get()) as D;
  const result = new Observable(compute(...getValues()));

  deps.forEach((dep) => {
    dep.subscribe(() => {
      result.set(compute(...getValues()));
    });
  });

  return result;
}

/**
 * Create an event channel for structured communication
 */
export function createChannel<T>() {
  const listeners = new Set<EventHandler<T>>();
  let lastValue: T | undefined;

  return {
    send(data: T): void {
      lastValue = data;
      listeners.forEach((handler) => handler(data));
    },

    receive(handler: EventHandler<T>): () => void {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },

    getLastValue(): T | undefined {
      return lastValue;
    },

    clear(): void {
      listeners.clear();
      lastValue = undefined;
    },
  };
}

export default EventEmitter;
