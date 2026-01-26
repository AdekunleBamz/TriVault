/**
 * Simple in-memory rate limiter for API routes
 */

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 100 }
): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = store.get(identifier)

  if (store.size > 10000) {
    cleanupExpiredEntries()
  }

  if (!entry || now > entry.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetIn: entry.resetTime - now,
    }
  }

  entry.count++
  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetIn: number,
  limit: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + resetIn / 1000).toString(),
  }
}

/**
 * Create a rate limiter with specific config
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (identifier: string) => checkRateLimit(identifier, config)
}

// Pre-configured rate limiters
export const apiRateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 100 })
export const authRateLimiter = createRateLimiter({ windowMs: 300000, maxRequests: 10 })
export const strictRateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 10 })
