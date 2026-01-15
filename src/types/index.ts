// Vault-related types
export interface Vault {
  id: number
  name: string
  description: string
  icon: string
  color: string
  address: `0x${string}`
}

// User data types
export interface UserSeals {
  vault1: boolean
  vault2: boolean
  vault3: boolean
}

export interface UserProfile {
  address: `0x${string}`
  seals: boolean[]
  hasAllSeals: boolean
  sealsCount: number
  firstSealTimestamp?: number
  completionTimestamp?: number
}

// Leaderboard types
export interface LeaderboardEntry {
  address: `0x${string}`
  sealsCount: number
  completedAt: number | null
  rank: number
}

export interface LeaderboardFilters {
  timeRange: 'all' | 'weekly' | 'daily'
  status: 'all' | 'champions' | 'in-progress'
  searchQuery: string
}

// Activity types
export interface ActivityItem {
  id: string
  user: `0x${string}`
  vaultNumber: number
  timestamp: number
  transactionHash: `0x${string}`
  blockNumber: number
}

// Transaction types
export interface TransactionState {
  isPending: boolean
  isConfirming: boolean
  isSuccess: boolean
  isError: boolean
  error?: Error
}

// Contract stats
export interface ContractStats {
  totalFeesCollected: bigint
  vault1Count: bigint
  vault2Count: bigint
  vault3Count: bigint
  totalInteractions: number
}

// Share types
export interface ShareData {
  sealsCollected: number
  isChampion: boolean
  address?: `0x${string}`
  timestamp?: number
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Notification types
export interface NotificationSettings {
  enabled: boolean
  sealCollected: boolean
  newChampion: boolean
  milestones: boolean
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: AppError
}
