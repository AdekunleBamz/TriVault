'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';

interface DailyStreakProps {
  currentStreak: number;
  longestStreak: number;
  lastCollectionDate?: Date;
  className?: string;
}

export function DailyStreak({
  currentStreak,
  longestStreak,
  lastCollectionDate,
  className = '',
}: DailyStreakProps) {
  const streakBonuses = [
    { days: 3, reward: '5 XP Bonus' },
    { days: 7, reward: '15 XP Bonus' },
    { days: 14, reward: '30 XP Bonus + Badge' },
    { days: 30, reward: '100 XP Bonus + Special Badge' },
  ];

  const nextMilestone = streakBonuses.find((b) => b.days > currentStreak);
  const daysToNext = nextMilestone ? nextMilestone.days - currentStreak : 0;

  const isActiveToday = lastCollectionDate
    ? new Date().toDateString() === lastCollectionDate.toDateString()
    : false;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Daily Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            <div className={`text-6xl font-bold ${currentStreak > 0 ? 'text-orange-500' : 'text-gray-500'}`}>
              {currentStreak}
            </div>
            <div className="text-gray-400">day streak</div>
            {isActiveToday && (
              <div className="text-green-400 text-sm mt-1">✓ Collected today</div>
            )}
          </div>
        </div>

        {nextMilestone && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Next milestone</span>
              <span className="text-white">{daysToNext} days</span>
            </div>
            <ProgressBar
              value={currentStreak}
              max={nextMilestone.days}
              color="warning"
            />
            <div className="text-sm text-purple-400 mt-2">
              Reward: {nextMilestone.reward}
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 mb-4">
          {Array.from({ length: 7 }).map((_, index) => {
            const dayNum = index + 1;
            const isCompleted = dayNum <= (currentStreak % 7 || 7);
            const isToday = dayNum === (currentStreak % 7 || 7) && isActiveToday;

            return (
              <div
                key={index}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  isCompleted
                    ? isToday
                      ? 'bg-orange-500 text-white scale-110'
                      : 'bg-orange-500/20 text-orange-400'
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                {isCompleted ? '🔥' : dayNum}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-sm text-gray-400 pt-4 border-t border-gray-700">
          <span>Longest streak</span>
          <span className="text-white font-medium">{longestStreak} days</span>
        </div>
      </CardContent>
    </Card>
  );
}
