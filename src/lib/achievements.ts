export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  requirement: (data: AchievementData) => boolean
}

export interface AchievementData {
  sealsCollected: number
  hasAllSeals: boolean
  totalInteractions: number
  isEarlyAdopter: boolean
  referralCount: number
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-seal',
    name: 'First Steps',
    description: 'Collect your first seal',
    icon: '🌟',
    rarity: 'common',
    requirement: (data) => data.sealsCollected >= 1,
  },
  {
    id: 'half-way',
    name: 'Halfway There',
    description: 'Collect 2 seals',
    icon: '⭐',
    rarity: 'uncommon',
    requirement: (data) => data.sealsCollected >= 2,
  },
  {
    id: 'champion',
    name: 'TriVault Champion',
    description: 'Collect all 3 seals',
    icon: '🏆',
    rarity: 'rare',
    requirement: (data) => data.hasAllSeals,
  },
  {
    id: 'stability-master',
    name: 'Stability Master',
    description: 'Collect the Stability Seal',
    icon: '💵',
    rarity: 'common',
    requirement: (data) => data.sealsCollected >= 1,
  },
  {
    id: 'diamond-hands',
    name: 'Diamond Hands',
    description: 'Collect the Diamond Seal',
    icon: '💎',
    rarity: 'uncommon',
    requirement: (data) => data.sealsCollected >= 2,
  },
  {
    id: 'bridge-builder',
    name: 'Bridge Builder',
    description: 'Collect the Bridge Seal',
    icon: '🌉',
    rarity: 'uncommon',
    requirement: (data) => data.sealsCollected >= 3,
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 users to collect a seal',
    icon: '🚀',
    rarity: 'epic',
    requirement: (data) => data.isEarlyAdopter,
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Refer 5 friends who collect seals',
    icon: '📢',
    rarity: 'rare',
    requirement: (data) => data.referralCount >= 5,
  },
  {
    id: 'mega-influencer',
    name: 'Mega Influencer',
    description: 'Refer 25 friends who collect seals',
    icon: '🎤',
    rarity: 'epic',
    requirement: (data) => data.referralCount >= 25,
  },
  {
    id: 'og',
    name: 'OG Collector',
    description: 'Collect all seals within the first week',
    icon: '👑',
    rarity: 'legendary',
    requirement: (data) => data.hasAllSeals && data.isEarlyAdopter,
  },
]

export const RARITY_COLORS: Record<Achievement['rarity'], string> = {
  common: 'from-gray-500 to-gray-600',
  uncommon: 'from-green-500 to-green-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-yellow-500 to-orange-500',
}

export const RARITY_LABELS: Record<Achievement['rarity'], string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

export function getUnlockedAchievements(data: AchievementData): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.requirement(data))
}

export function getLockedAchievements(data: AchievementData): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => !achievement.requirement(data))
}

export function getAchievementProgress(data: AchievementData): number {
  const unlocked = getUnlockedAchievements(data).length
  return Math.round((unlocked / ACHIEVEMENTS.length) * 100)
}
