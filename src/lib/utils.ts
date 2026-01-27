import { formatEther, formatUnits } from 'viem'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with Tailwind CSS class conflict resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Format an Ethereum address to a shorter version
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return ''
  if (address.length < startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format ETH value with optional decimals
 */
export function formatETH(value: bigint, decimals = 6): string {
  const formatted = formatEther(value)
  const num = parseFloat(formatted)
  
  if (num === 0) return '0'
  if (num < 0.000001) return '< 0.000001'
  
  return num.toFixed(decimals).replace(/\.?0+$/, '')
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`
  if (num < 1000000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`
  return `${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}B`
}

/**
 * Format a timestamp to a relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp * 1000 // Convert to milliseconds

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (weeks < 4) return `${weeks}w ago`
  return `${months}mo ago`
}

/**
 * Format a timestamp to a date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a timestamp to a full date and time string
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

/**
 * Generate a shareable URL
 */
export function generateShareURL(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tri-vault.vercel.app'
  return `${baseUrl}${path}`
}

/**
 * Generate Twitter share URL
 */
export function generateTwitterShareURL(text: string, url?: string): string {
  const params = new URLSearchParams({
    text,
    ...(url && { url }),
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

/**
 * Generate Warpcast share URL
 */
export function generateWarpcastShareURL(text: string): string {
  const params = new URLSearchParams({ text })
  return `https://warpcast.com/~/compose?${params.toString()}`
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, i))
      }
    }
  }
  
  throw lastError
}
