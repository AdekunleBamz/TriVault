/**
 * TriVault Environment Configuration
 * Centralized environment variable management
 */

// Runtime environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_TEST = process.env.NODE_ENV === 'test';

// App URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Chain configuration
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453', 10);
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';

// Contract addresses
export const TRIVAULT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TRIVAULT_ADDRESS || '0xC3319C80FF4fC435ca8827C35A013E64B762ff48';

// API Keys (only available server-side)
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
export const ANALYTICS_API_KEY = process.env.ANALYTICS_API_KEY;

// Feature flags
export const FEATURE_FLAGS = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableLeaderboard: process.env.NEXT_PUBLIC_ENABLE_LEADERBOARD !== 'false',
  enableAchievements: process.env.NEXT_PUBLIC_ENABLE_ACHIEVEMENTS !== 'false',
  enableSharing: process.env.NEXT_PUBLIC_ENABLE_SHARING !== 'false',
  enableReferrals: process.env.NEXT_PUBLIC_ENABLE_REFERRALS === 'true',
  debugMode: process.env.NEXT_PUBLIC_DEBUG === 'true',
} as const;

// Social links
export const SOCIAL_LINKS = {
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/trivault',
  farcaster: process.env.NEXT_PUBLIC_FARCASTER_URL || 'https://warpcast.com/trivault',
  github: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/trivault',
  discord: process.env.NEXT_PUBLIC_DISCORD_URL,
} as const;

// Rate limiting
export const RATE_LIMIT = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
};

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  leaderboard: parseInt(process.env.CACHE_TTL_LEADERBOARD || '60', 10),
  stats: parseInt(process.env.CACHE_TTL_STATS || '30', 10),
  userProfile: parseInt(process.env.CACHE_TTL_USER || '120', 10),
};

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'NEXT_PUBLIC_TRIVAULT_ADDRESS',
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get environment info for debugging
 */
export function getEnvInfo(): Record<string, unknown> {
  return {
    nodeEnv: process.env.NODE_ENV,
    isProduction: IS_PRODUCTION,
    isDevelopment: IS_DEVELOPMENT,
    appUrl: APP_URL,
    chainId: CHAIN_ID,
    featureFlags: FEATURE_FLAGS,
  };
}
