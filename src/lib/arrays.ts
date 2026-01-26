/**
 * Array manipulation utilities
 */

/**
 * Remove duplicate values from array
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Remove duplicate objects by key
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Group array items by key
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Group array items by function
 */
export function groupByFn<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey = fn(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Flatten nested arrays
 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.reduce<T[]>((flat, item) => {
    return flat.concat(Array.isArray(item) ? item : [item]);
  }, []);
}

/**
 * Deep flatten nested arrays
 */
export function flattenDeep<T>(arr: unknown[]): T[] {
  return arr.reduce<T[]>((flat, item) => {
    return flat.concat(
      Array.isArray(item) ? flattenDeep<T>(item) : (item as T)
    );
  }, []);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get random item(s) from array
 */
export function sample<T>(arr: T[], count: number = 1): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, count);
}

/**
 * Get random item from array
 */
export function randomItem<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get first N items
 */
export function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

/**
 * Get last N items
 */
export function takeLast<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

/**
 * Get first item
 */
export function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

/**
 * Get last item
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

/**
 * Find min value by key
 */
export function minBy<T>(arr: T[], key: keyof T): T | undefined {
  if (arr.length === 0) return undefined;
  return arr.reduce((min, item) => (item[key] < min[key] ? item : min));
}

/**
 * Find max value by key
 */
export function maxBy<T>(arr: T[], key: keyof T): T | undefined {
  if (arr.length === 0) return undefined;
  return arr.reduce((max, item) => (item[key] > max[key] ? item : max));
}

/**
 * Sum array of numbers
 */
export function sum(arr: number[]): number {
  return arr.reduce((total, n) => total + n, 0);
}

/**
 * Sum array by key
 */
export function sumBy<T>(arr: T[], key: keyof T): number {
  return arr.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

/**
 * Calculate average
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * Difference between two arrays
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * Intersection of two arrays
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * Union of two arrays
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return unique([...arr1, ...arr2]);
}

/**
 * Move item in array
 */
export function move<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...arr];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

/**
 * Swap items in array
 */
export function swap<T>(arr: T[], indexA: number, indexB: number): T[] {
  const result = [...arr];
  [result[indexA], result[indexB]] = [result[indexB], result[indexA]];
  return result;
}

/**
 * Insert item at index
 */
export function insertAt<T>(arr: T[], index: number, item: T): T[] {
  const result = [...arr];
  result.splice(index, 0, item);
  return result;
}

/**
 * Remove item at index
 */
export function removeAt<T>(arr: T[], index: number): T[] {
  const result = [...arr];
  result.splice(index, 1);
  return result;
}

/**
 * Update item at index
 */
export function updateAt<T>(arr: T[], index: number, item: T): T[] {
  const result = [...arr];
  result[index] = item;
  return result;
}

/**
 * Range of numbers
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Partition array by predicate
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  
  for (const item of arr) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  
  return [pass, fail];
}

/**
 * Count items matching predicate
 */
export function countBy<T>(arr: T[], predicate: (item: T) => boolean): number {
  return arr.filter(predicate).length;
}

/**
 * Sort by key (stable sort)
 */
export function sortBy<T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  const multiplier = order === 'asc' ? 1 : -1;
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return -1 * multiplier;
    if (a[key] > b[key]) return 1 * multiplier;
    return 0;
  });
}
