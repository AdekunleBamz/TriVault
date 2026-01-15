// Application Constants

export const APP_NAME = 'TriVault'
export const APP_DESCRIPTION = 'Collect seals on Base blockchain'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tri-vault.vercel.app'

// Network
export const SUPPORTED_CHAIN_ID = 8453 // Base mainnet
export const SUPPORTED_CHAIN_NAME = 'Base'

// Contract
export const CREATOR_FEE_WEI = BigInt('10000000000000') // 0.00001 ETH in wei
export const CREATOR_FEE_ETH = '0.00001'
export const TOTAL_VAULTS = 3

// UI Constants
export const TOAST_DURATION = 5000
export const TOAST_ERROR_DURATION = 7000
export const MAX_TOASTS = 5
export const DEBOUNCE_DELAY = 300
export const ANIMATION_DURATION = 200

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

// Social Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/trivault',
  farcaster: 'https://warpcast.com/trivault',
  github: 'https://github.com/trivault',
  discord: 'https://discord.gg/trivault',
} as const

// External Links
export const EXTERNAL_LINKS = {
  basescan: 'https://basescan.org',
  base: 'https://base.org',
  farcaster: 'https://farcaster.xyz',
  coinbase: 'https://coinbase.com',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'trivault-theme',
  notifications: 'trivault-notifications',
  referralCode: 'trivault-referral',
  lastVisit: 'trivault-last-visit',
} as const

// Error Codes
export const ERROR_CODES = {
  INSUFFICIENT_FEE: 'INSUFFICIENT_FEE',
  ALREADY_SEALED: 'ALREADY_SEALED',
  INVALID_VAULT: 'INVALID_VAULT',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

// Error Messages
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.INSUFFICIENT_FEE]: 'Insufficient ETH for the seal fee',
  [ERROR_CODES.ALREADY_SEALED]: 'You have already collected this seal',
  [ERROR_CODES.INVALID_VAULT]: 'Invalid vault number',
  [ERROR_CODES.WALLET_NOT_CONNECTED]: 'Please connect your wallet first',
  [ERROR_CODES.TRANSACTION_FAILED]: 'Transaction failed. Please try again',
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection',
}

// Rarity Thresholds
export const RARITY_THRESHOLDS = {
  common: 0,
  uncommon: 25,
  rare: 50,
  epic: 75,
  legendary: 90,
} as const

// Time Constants (in seconds)
export const TIME = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
} as const
