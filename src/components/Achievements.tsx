'use client'

import { ACHIEVEMENTS, RARITY_COLORS, RARITY_LABELS, AchievementData, Achievement } from '@/lib/achievements'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import { Tooltip } from './ui/Tooltip'

interface AchievementsProps {
  data: AchievementData
}

export function Achievements({ data }: AchievementsProps) {
  const unlockedIds = new Set(
    ACHIEVEMENTS
      .filter((a) => a.requirement(data))
      .map((a) => a.id)
  )

  const totalUnlocked = unlockedIds.size
  const progressPercent = Math.round((totalUnlocked / ACHIEVEMENTS.length) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Achievements</CardTitle>
          <Badge variant="info">{totalUnlocked}/{ACHIEVEMENTS.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-medium">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id)
            
            return (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={isUnlocked}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked: boolean
}

function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  return (
    <Tooltip
      content={
        <div className="text-center">
          <p className="font-semibold">{achievement.name}</p>
          <p className="text-xs text-gray-300">{achievement.description}</p>
          <p className="text-xs mt-1">
            <span className={`font-medium ${isUnlocked ? 'text-green-400' : 'text-gray-400'}`}>
              {RARITY_LABELS[achievement.rarity]}
            </span>
          </p>
        </div>
      }
    >
      <div
        className={`
          relative aspect-square rounded-xl p-3
          flex flex-col items-center justify-center
          transition-all duration-200
          ${isUnlocked
            ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} hover:scale-105`
            : 'bg-gray-800 opacity-40 grayscale'
          }
        `}
      >
        <span className="text-3xl mb-1">{achievement.icon}</span>
        <span className="text-xs text-white text-center font-medium line-clamp-2">
          {achievement.name}
        </span>
        
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-50">🔒</span>
          </div>
        )}
      </div>
    </Tooltip>
  )
}

// Mini version for profile page
export function AchievementsMini({ data }: AchievementsProps) {
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.requirement(data))
  
  if (unlockedAchievements.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {unlockedAchievements.slice(0, 5).map((achievement) => (
        <Tooltip key={achievement.id} content={achievement.name}>
          <div
            className={`
              w-10 h-10 rounded-lg
              bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]}
              flex items-center justify-center
              text-xl
            `}
          >
            {achievement.icon}
          </div>
        </Tooltip>
      ))}
      {unlockedAchievements.length > 5 && (
        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-sm text-gray-400">
          +{unlockedAchievements.length - 5}
        </div>
      )}
    </div>
  )
}
