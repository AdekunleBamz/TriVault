/**
 * URL manipulation utilities
 */

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const query = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  
  if (!query) return {};
  
  return query.split('&').reduce((acc, param) => {
    const [key, value] = param.split('=');
    if (key) {
      acc[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Build query string from object
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
  options: { skipNull?: boolean; skipEmpty?: boolean } = {}
): string {
  const { skipNull = true, skipEmpty = true } = options;
  
  const entries = Object.entries(params).filter(([, value]) => {
    if (skipNull && (value === null || value === undefined)) return false;
    if (skipEmpty && value === '') return false;
    return true;
  });
  
  if (entries.length === 0) return '';
  
  return '?' + entries
    .map(([key, value]) => 
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');
}

/**
 * Update query parameters in a URL
 */
export function updateQueryParams(
  url: string,
  params: Record<string, string | number | boolean | null | undefined>
): string {
  const [base, existingQuery] = url.split('?');
  const existingParams = existingQuery ? parseQueryString(existingQuery) : {};
  const mergedParams = { ...existingParams, ...params };
  
  // Remove null/undefined values
  Object.keys(mergedParams).forEach(key => {
    if (mergedParams[key] === null || mergedParams[key] === undefined) {
      delete mergedParams[key];
    }
  });
  
  const queryString = buildQueryString(mergedParams);
  return base + queryString;
}

/**
 * Remove query parameters from URL
 */
export function removeQueryParams(url: string, keys: string[]): string {
  const [base, existingQuery] = url.split('?');
  
  if (!existingQuery) return url;
  
  const params = parseQueryString(existingQuery);
  keys.forEach(key => delete params[key]);
  
  const queryString = buildQueryString(params);
  return base + queryString;
}

/**
 * Get domain from URL
 */
export function getDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Get path from URL
 */
export function getPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return null;
  }
}

/**
 * Check if URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(url);
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Join URL segments
 */
export function joinUrl(...segments: string[]): string {
  return segments
    .filter(Boolean)
    .map((segment, index) => {
      let s = segment;
      // Remove trailing slash except for first segment
      if (index > 0 && s.startsWith('/')) {
        s = s.slice(1);
      }
      // Remove trailing slash
      if (s.endsWith('/')) {
        s = s.slice(0, -1);
      }
      return s;
    })
    .join('/');
}

/**
 * Create URL with base
 */
export function createUrl(
  path: string,
  base: string = '',
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  let url = base ? joinUrl(base, path) : path;
  
  if (params) {
    url = updateQueryParams(url, params);
  }
  
  return url;
}

/**
 * Extract hash from URL
 */
export function getHash(url: string): string {
  const hashIndex = url.indexOf('#');
  return hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
}

/**
 * Get base URL (origin + pathname)
 */
export function getBaseUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname;
  } catch {
    return null;
  }
}

/**
 * Normalize URL (remove trailing slash, lowercase)
 */
export function normalizeUrl(url: string): string {
  let normalized = url.toLowerCase().trim();
  
  // Remove trailing slash (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  return normalized;
}

/**
 * Check if URLs are the same (ignoring protocol and www)
 */
export function isSameUrl(url1: string, url2: string): boolean {
  const normalize = (url: string) => {
    return url
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  };
  
  return normalize(url1) === normalize(url2);
}
