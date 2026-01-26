/**
 * Queue utilities for managing async operations
 */

export type QueueTask<T> = () => Promise<T>;

interface QueueOptions {
  concurrency?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Async queue with concurrency control
 */
export class AsyncQueue<T = unknown> {
  private queue: { task: QueueTask<T>; resolve: (value: T) => void; reject: (error: Error) => void }[] = [];
  private running = 0;
  private concurrency: number;
  private paused = false;

  constructor(options: QueueOptions = {}) {
    this.concurrency = options.concurrency ?? 1;
  }

  add(task: QueueTask<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.paused || this.running >= this.concurrency) return;

    const item = this.queue.shift();
    if (!item) return;

    this.running++;

    try {
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      item.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.running--;
      this.process();
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.process();
  }

  clear(): void {
    this.queue = [];
  }

  get pending(): number {
    return this.queue.length;
  }

  get active(): number {
    return this.running;
  }

  get size(): number {
    return this.queue.length + this.running;
  }

  get isPaused(): boolean {
    return this.paused;
  }
}

/**
 * Priority queue
 */
export class PriorityQueue<T = unknown> {
  private queues = new Map<number, { task: QueueTask<T>; resolve: (value: T) => void; reject: (error: Error) => void }[]>();
  private running = 0;
  private concurrency: number;

  constructor(options: QueueOptions = {}) {
    this.concurrency = options.concurrency ?? 1;
  }

  add(task: QueueTask<T>, priority = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.queues.has(priority)) {
        this.queues.set(priority, []);
      }
      this.queues.get(priority)!.push({ task, resolve, reject });
      this.process();
    });
  }

  private getNextTask() {
    const priorities = Array.from(this.queues.keys()).sort((a, b) => b - a);
    
    for (const priority of priorities) {
      const queue = this.queues.get(priority)!;
      if (queue.length > 0) {
        return queue.shift();
      }
    }
    
    return undefined;
  }

  private async process(): Promise<void> {
    if (this.running >= this.concurrency) return;

    const item = this.getNextTask();
    if (!item) return;

    this.running++;

    try {
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      item.reject(error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.running--;
      this.process();
    }
  }

  get size(): number {
    let total = this.running;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total;
  }
}

/**
 * Rate-limited queue
 */
export class RateLimitedQueue<T = unknown> {
  private queue: AsyncQueue<T>;
  private lastExecution = 0;
  private minInterval: number;

  constructor(options: { concurrency?: number; rateLimit?: number } = {}) {
    this.queue = new AsyncQueue({ concurrency: 1 });
    this.minInterval = options.rateLimit ? 1000 / options.rateLimit : 0;
  }

  async add(task: QueueTask<T>): Promise<T> {
    return this.queue.add(async () => {
      const now = Date.now();
      const elapsed = now - this.lastExecution;
      
      if (elapsed < this.minInterval) {
        await new Promise((resolve) => setTimeout(resolve, this.minInterval - elapsed));
      }
      
      this.lastExecution = Date.now();
      return task();
    });
  }
}

/**
 * Batch queue - collects items and processes them in batches
 */
export class BatchQueue<T, R = void> {
  private batch: T[] = [];
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private processor: (items: T[]) => Promise<R>;
  private maxBatchSize: number;
  private maxWait: number;

  constructor(
    processor: (items: T[]) => Promise<R>,
    options: { maxBatchSize?: number; maxWait?: number } = {}
  ) {
    this.processor = processor;
    this.maxBatchSize = options.maxBatchSize ?? 10;
    this.maxWait = options.maxWait ?? 100;
  }

  add(item: T): void {
    this.batch.push(item);

    if (this.batch.length >= this.maxBatchSize) {
      this.flush();
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), this.maxWait);
    }
  }

  async flush(): Promise<R | undefined> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.batch.length === 0) return;

    const items = this.batch;
    this.batch = [];
    return this.processor(items);
  }
}

/**
 * Retry queue - automatically retries failed tasks
 */
export class RetryQueue<T = unknown> {
  private maxRetries: number;
  private retryDelay: number;
  private backoff: boolean;

  constructor(options: { maxRetries?: number; retryDelay?: number; backoff?: boolean } = {}) {
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.backoff = options.backoff ?? true;
  }

  async execute(task: QueueTask<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await task();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.maxRetries) {
          const delay = this.backoff ? this.retryDelay * Math.pow(2, attempt) : this.retryDelay;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

export default {
  AsyncQueue,
  PriorityQueue,
  RateLimitedQueue,
  BatchQueue,
  RetryQueue,
};
