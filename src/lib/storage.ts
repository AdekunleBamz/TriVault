/**
 * Local storage management utilities for TriVault
 */

const STORAGE_PREFIX = 'trivault_';

export interface StorageOptions {
  expiresIn?: number; // milliseconds
}

interface StoredValue<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Set item in localStorage with optional expiration
 */
export function setStorageItem<T>(
  key: string,
  value: T,
  options?: StorageOptions
): void {
  if (typeof window === 'undefined') return;

  const prefixedKey = STORAGE_PREFIX + key;
  const storedValue: StoredValue<T> = {
    value,
    timestamp: Date.now(),
    expiresAt: options?.expiresIn ? Date.now() + options.expiresIn : undefined,
  };

  try {
    localStorage.setItem(prefixedKey, JSON.stringify(storedValue));
  } catch (error) {
    console.error('Failed to set localStorage item:', error);
    // If storage is full, try to clear expired items
    clearExpiredItems();
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(storedValue));
    } catch {
      console.error('Storage still full after cleanup');
    }
  }
}

/**
 * Get item from localStorage
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  const prefixedKey = STORAGE_PREFIX + key;

  try {
    const item = localStorage.getItem(prefixedKey);
    if (!item) return null;

    const storedValue: StoredValue<T> = JSON.parse(item);

    // Check expiration
    if (storedValue.expiresAt && Date.now() > storedValue.expiresAt) {
      localStorage.removeItem(prefixedKey);
      return null;
    }

    return storedValue.value;
  } catch (error) {
    console.error('Failed to get localStorage item:', error);
    return null;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;

  const prefixedKey = STORAGE_PREFIX + key;
  localStorage.removeItem(prefixedKey);
}

/**
 * Check if item exists in localStorage
 */
export function hasStorageItem(key: string): boolean {
  return getStorageItem(key) !== null;
}

/**
 * Clear all TriVault items from localStorage
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Clear expired items from localStorage
 */
export function clearExpiredItems(): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;

    try {
      const item = localStorage.getItem(key);
      if (!item) continue;

      const storedValue: StoredValue<unknown> = JSON.parse(item);
      if (storedValue.expiresAt && now > storedValue.expiresAt) {
        keysToRemove.push(key);
      }
    } catch {
      // Invalid JSON, remove it
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Get all TriVault keys from localStorage
 */
export function getAllStorageKeys(): string[] {
  if (typeof window === 'undefined') return [];

  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keys.push(key.replace(STORAGE_PREFIX, ''));
    }
  }

  return keys;
}

/**
 * Get storage usage in bytes
 */
export function getStorageUsage(): { used: number; available: number; total: number } {
  if (typeof window === 'undefined') {
    return { used: 0, available: 0, total: 0 };
  }

  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        used += key.length + value.length;
      }
    }
  }

  // Most browsers support ~5MB
  const total = 5 * 1024 * 1024;
  return {
    used,
    available: total - used,
    total,
  };
}

// Predefined storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LAST_COLLECTION: 'last_collection',
  VIEWED_ACHIEVEMENTS: 'viewed_achievements',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  RECENT_TRANSACTIONS: 'recent_transactions',
  FAVORITES: 'favorites',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
