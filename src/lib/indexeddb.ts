/**
 * IndexedDB Storage Utilities
 *
 * Provides a type-safe, Promise-based wrapper around IndexedDB
 * for persistent client-side storage with better DX than raw IndexedDB.
 */

// ============================================================================
// Types
// ============================================================================

export interface DBConfig {
  name: string;
  version: number;
  stores: StoreConfig[];
}

export interface StoreConfig {
  name: string;
  keyPath?: string;
  autoIncrement?: boolean;
  indexes?: IndexConfig[];
}

export interface IndexConfig {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

export interface QueryOptions<T> {
  index?: string;
  range?: IDBKeyRange;
  direction?: IDBCursorDirection;
  limit?: number;
  offset?: number;
  filter?: (item: T) => boolean;
}

export interface StorageItem<T> {
  key: IDBValidKey;
  value: T;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

// ============================================================================
// IndexedDB Manager
// ============================================================================

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private config: DBConfig;
  private connecting: Promise<IDBDatabase> | null = null;

  constructor(config: DBConfig) {
    this.config = config;
  }

  /**
   * Open connection to database
   */
  async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.connecting) return this.connecting;

    this.connecting = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported'));
        return;
      }

      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });

    return this.connecting;
  }

  /**
   * Create object stores during upgrade
   */
  private createStores(db: IDBDatabase): void {
    for (const store of this.config.stores) {
      // Skip if store already exists
      if (db.objectStoreNames.contains(store.name)) {
        continue;
      }

      const objectStore = db.createObjectStore(store.name, {
        keyPath: store.keyPath,
        autoIncrement: store.autoIncrement,
      });

      // Create indexes
      if (store.indexes) {
        for (const index of store.indexes) {
          objectStore.createIndex(index.name, index.keyPath, {
            unique: index.unique,
            multiEntry: index.multiEntry,
          });
        }
      }
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.connecting = null;
    }
  }

  /**
   * Delete the entire database
   */
  async deleteDatabase(): Promise<void> {
    this.close();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.config.name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a store accessor
   */
  store<T>(name: string): StoreAccessor<T> {
    return new StoreAccessor<T>(this, name);
  }

  /**
   * Get database instance (internal use)
   */
  async getDB(): Promise<IDBDatabase> {
    return this.connect();
  }
}

// ============================================================================
// Store Accessor
// ============================================================================

export class StoreAccessor<T> {
  constructor(
    private manager: IndexedDBManager,
    private storeName: string
  ) {}

  /**
   * Get an item by key
   */
  async get(key: IDBValidKey): Promise<T | undefined> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all items
   */
  async getAll(options?: QueryOptions<T>): Promise<T[]> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      let source: IDBObjectStore | IDBIndex = store;
      if (options?.index) {
        source = store.index(options.index);
      }

      const request = options?.range
        ? source.getAll(options.range)
        : source.getAll();

      request.onsuccess = () => {
        let results = request.result;

        // Apply filter
        if (options?.filter) {
          results = results.filter(options.filter);
        }

        // Apply offset and limit
        if (options?.offset || options?.limit) {
          const start = options.offset ?? 0;
          const end = options.limit ? start + options.limit : undefined;
          results = results.slice(start, end);
        }

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Put an item (insert or update)
   */
  async put(value: T, key?: IDBValidKey): Promise<IDBValidKey> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = key ? store.put(value, key) : store.put(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add an item (fails if key exists)
   */
  async add(value: T, key?: IDBValidKey): Promise<IDBValidKey> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = key ? store.add(value, key) : store.add(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete an item by key
   */
  async delete(key: IDBValidKey): Promise<void> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all items
   */
  async clear(): Promise<void> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Count items
   */
  async count(range?: IDBKeyRange): Promise<number> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = range ? store.count(range) : store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all keys
   */
  async getAllKeys(range?: IDBKeyRange): Promise<IDBValidKey[]> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = range ? store.getAllKeys(range) : store.getAllKeys();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Iterate with cursor
   */
  async forEach(
    callback: (value: T, key: IDBValidKey) => void | Promise<void>,
    options?: { index?: string; range?: IDBKeyRange; direction?: IDBCursorDirection }
  ): Promise<void> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      let source: IDBObjectStore | IDBIndex = store;
      if (options?.index) {
        source = store.index(options.index);
      }

      const request = source.openCursor(options?.range, options?.direction);

      request.onsuccess = async () => {
        const cursor = request.result;
        if (cursor) {
          await callback(cursor.value, cursor.key);
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Batch put multiple items
   */
  async putMany(items: T[]): Promise<IDBValidKey[]> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const keys: IDBValidKey[] = [];

      transaction.oncomplete = () => resolve(keys);
      transaction.onerror = () => reject(transaction.error);

      for (const item of items) {
        const request = store.put(item);
        request.onsuccess = () => keys.push(request.result);
      }
    });
  }

  /**
   * Batch delete multiple items
   */
  async deleteMany(keys: IDBValidKey[]): Promise<void> {
    const db = await this.manager.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const key of keys) {
        store.delete(key);
      }
    });
  }
}

// ============================================================================
// Key-Value Store (Simplified API)
// ============================================================================

export class KeyValueStore<T = unknown> {
  private manager: IndexedDBManager;
  private storeName: string;

  constructor(dbName: string = 'trivault-kv', storeName: string = 'keyvalue') {
    this.manager = new IndexedDBManager({
      name: dbName,
      version: 1,
      stores: [{ name: storeName, keyPath: 'key' }],
    });
    this.storeName = storeName;
  }

  /**
   * Get a value by key
   */
  async get<V = T>(key: string): Promise<V | undefined> {
    const store = this.manager.store<StorageItem<V>>(this.storeName);
    const item = await store.get(key);
    
    if (!item) return undefined;
    
    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      await store.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  /**
   * Set a value
   */
  async set<V = T>(
    key: string,
    value: V,
    options?: { ttl?: number }
  ): Promise<void> {
    const store = this.manager.store<StorageItem<V>>(this.storeName);
    const existing = await store.get(key);
    
    const item: StorageItem<V> = {
      key,
      value,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      expiresAt: options?.ttl ? Date.now() + options.ttl : undefined,
    };
    
    await store.put(item);
  }

  /**
   * Delete a value
   */
  async delete(key: string): Promise<void> {
    const store = this.manager.store(this.storeName);
    await store.delete(key);
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== undefined;
  }

  /**
   * Get all keys
   */
  async keys(): Promise<string[]> {
    const store = this.manager.store<StorageItem<T>>(this.storeName);
    const keys = await store.getAllKeys();
    return keys as string[];
  }

  /**
   * Get all entries
   */
  async entries(): Promise<Array<[string, T]>> {
    const store = this.manager.store<StorageItem<T>>(this.storeName);
    const items = await store.getAll();
    const now = Date.now();
    
    return items
      .filter((item) => !item.expiresAt || item.expiresAt > now)
      .map((item) => [item.key as string, item.value]);
  }

  /**
   * Clear all values
   */
  async clear(): Promise<void> {
    const store = this.manager.store(this.storeName);
    await store.clear();
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    const store = this.manager.store<StorageItem<T>>(this.storeName);
    const items = await store.getAll();
    const now = Date.now();
    
    const expiredKeys = items
      .filter((item) => item.expiresAt && item.expiresAt <= now)
      .map((item) => item.key);
    
    if (expiredKeys.length > 0) {
      await store.deleteMany(expiredKeys);
    }
    
    return expiredKeys.length;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.manager.close();
  }
}

// ============================================================================
// Session Storage Wrapper (Sync API)
// ============================================================================

export class SessionStore<T extends Record<string, unknown> = Record<string, unknown>> {
  private prefix: string;

  constructor(prefix: string = 'trivault:') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    if (typeof sessionStorage === 'undefined') return undefined;
    
    try {
      const item = sessionStorage.getItem(this.getKey(key as string));
      return item ? JSON.parse(item) : undefined;
    } catch {
      return undefined;
    }
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    if (typeof sessionStorage === 'undefined') return;
    
    try {
      sessionStorage.setItem(this.getKey(key as string), JSON.stringify(value));
    } catch {
      // Storage quota exceeded or not available
    }
  }

  delete<K extends keyof T>(key: K): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(this.getKey(key as string));
  }

  has<K extends keyof T>(key: K): boolean {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(this.getKey(key as string)) !== null;
  }

  clear(): void {
    if (typeof sessionStorage === 'undefined') return;
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a TriVault-specific database manager
 */
export function createTriVaultDB(): IndexedDBManager {
  return new IndexedDBManager({
    name: 'trivault',
    version: 1,
    stores: [
      {
        name: 'seals',
        keyPath: 'id',
        indexes: [
          { name: 'by-wallet', keyPath: 'wallet' },
          { name: 'by-timestamp', keyPath: 'timestamp' },
          { name: 'by-type', keyPath: 'sealType' },
        ],
      },
      {
        name: 'transactions',
        keyPath: 'hash',
        indexes: [
          { name: 'by-wallet', keyPath: 'wallet' },
          { name: 'by-timestamp', keyPath: 'timestamp' },
          { name: 'by-status', keyPath: 'status' },
        ],
      },
      {
        name: 'preferences',
        keyPath: 'key',
      },
      {
        name: 'cache',
        keyPath: 'key',
        indexes: [{ name: 'by-expires', keyPath: 'expiresAt' }],
      },
    ],
  });
}

/**
 * Create a simple key-value store
 */
export function createKVStore<T = unknown>(name?: string): KeyValueStore<T> {
  return new KeyValueStore<T>(name);
}

/**
 * Create a session store
 */
export function createSessionStore<
  T extends Record<string, unknown> = Record<string, unknown>
>(prefix?: string): SessionStore<T> {
  return new SessionStore<T>(prefix);
}

// ============================================================================
// Exports
// ============================================================================

export default IndexedDBManager;
