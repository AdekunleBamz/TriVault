/**
 * In-memory cache with TTL and LRU eviction
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessedAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
}

export class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;
  private maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? 5 * 60 * 1000; // Default 5 minutes
    this.maxSize = options.maxSize ?? 1000;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Update access time for LRU
    entry.accessedAt = Date.now();
    return entry.value;
  }

  set(key: string, value: T, customTtl?: number): void {
    // Evict least recently used if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiresAt = Date.now() + (customTtl ?? this.ttl);
    this.cache.set(key, {
      value,
      expiresAt,
      accessedAt: Date.now(),
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  private evictLRU(): void {
    let oldest: { key: string; accessedAt: number } | null = null;
    
    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.accessedAt < oldest.accessedAt) {
        oldest = { key, accessedAt: entry.accessedAt };
      }
    }
    
    if (oldest) {
      this.cache.delete(oldest.key);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Create a cached version of an async function
 */
export function createCachedFunction<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  options: {
    keyGenerator?: (...args: Args) => string;
    ttl?: number;
    maxSize?: number;
  } = {}
): (...args: Args) => Promise<R> {
  const cache = new MemoryCache<R>({ ttl: options.ttl, maxSize: options.maxSize });
  const keyGenerator = options.keyGenerator ?? ((...args) => JSON.stringify(args));

  return async (...args: Args): Promise<R> => {
    const key = keyGenerator(...args);
    
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Stale-while-revalidate cache
 */
export class SWRCache<T> {
  private cache = new Map<string, { value: T; staleAt: number; expiresAt: number }>();
  private pending = new Map<string, Promise<T>>();
  
  constructor(
    private fetcher: (key: string) => Promise<T>,
    private options: {
      staleTime?: number;
      cacheTime?: number;
    } = {}
  ) {}

  async get(key: string): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();

    // Return from cache if valid
    if (entry && now < entry.expiresAt) {
      // Revalidate in background if stale
      if (now > entry.staleAt) {
        this.revalidate(key);
      }
      return entry.value;
    }

    // Check for pending request
    const pending = this.pending.get(key);
    if (pending) return pending;

    // Fetch fresh data
    return this.revalidate(key);
  }

  private async revalidate(key: string): Promise<T> {
    const promise = this.fetcher(key);
    this.pending.set(key, promise);

    try {
      const value = await promise;
      const staleTime = this.options.staleTime ?? 30000;
      const cacheTime = this.options.cacheTime ?? 5 * 60 * 1000;
      
      this.cache.set(key, {
        value,
        staleAt: Date.now() + staleTime,
        expiresAt: Date.now() + cacheTime,
      });
      
      return value;
    } finally {
      this.pending.delete(key);
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}

/**
 * Request deduplication for concurrent identical requests
 */
export class RequestDeduplicator<T> {
  private pending = new Map<string, Promise<T>>();

  async execute(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) return existing;

    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

/**
 * Simple key-value storage cache with localStorage persistence
 */
export function createPersistentCache<T>(
  namespace: string,
  options: { ttl?: number } = {}
) {
  const { ttl = 24 * 60 * 60 * 1000 } = options;

  const getKey = (key: string) => `${namespace}:${key}`;

  return {
    get(key: string): T | null {
      if (typeof localStorage === 'undefined') return null;

      try {
        const raw = localStorage.getItem(getKey(key));
        if (!raw) return null;

        const { value, expiresAt } = JSON.parse(raw);
        if (Date.now() > expiresAt) {
          localStorage.removeItem(getKey(key));
          return null;
        }

        return value;
      } catch {
        return null;
      }
    },

    set(key: string, value: T): void {
      if (typeof localStorage === 'undefined') return;

      try {
        const data = {
          value,
          expiresAt: Date.now() + ttl,
        };
        localStorage.setItem(getKey(key), JSON.stringify(data));
      } catch {
        // Storage full or quota exceeded
      }
    },

    delete(key: string): void {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(getKey(key));
    },

    clear(): void {
      if (typeof localStorage === 'undefined') return;

      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith(`${namespace}:`)
      );
      keys.forEach((k) => localStorage.removeItem(k));
    },
  };
}

export default {
  MemoryCache,
  createCachedFunction,
  SWRCache,
  RequestDeduplicator,
  createPersistentCache,
};
