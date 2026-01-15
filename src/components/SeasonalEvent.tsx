'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Season {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  rewards: string[];
  isActive: boolean;
}

interface SeasonalEventProps {
  season: Season;
  userProgress?: {
    sealsCollected: number;
    rank: number;
    rewards: string[];
  };
  className?: string;
}

export function SeasonalEvent({ season, userProgress, className = '' }: SeasonalEventProps) {
  const now = new Date();
  const timeRemaining = season.endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="success" className="mb-2">
              {season.isActive ? 'Active Season' : 'Coming Soon'}
            </Badge>
            <h2 className="text-2xl font-bold text-white">{season.name}</h2>
            <p className="text-white/80 mt-1">{season.description}</p>
          </div>
          {season.isActive && (
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {daysRemaining}d {hoursRemaining}h
              </div>
              <div className="text-white/60 text-sm">remaining</div>
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rewards Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">🎁 Season Rewards</h3>
            <div className="space-y-3">
              {season.rewards.map((reward, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    {index + 1}
                  </div>
                  <span className="text-gray-300">{reward}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Section */}
          {userProgress && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">📊 Your Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Seals This Season</span>
                  <span className="text-2xl font-bold text-white">{userProgress.sealsCollected}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Current Rank</span>
                  <span className="text-2xl font-bold text-purple-400">#{userProgress.rank}</span>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400 block mb-2">Rewards Earned</span>
                  <div className="flex flex-wrap gap-2">
                    {userProgress.rewards.length > 0 ? (
                      userProgress.rewards.map((reward, index) => (
                        <Badge key={index} variant="success">{reward}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">Keep collecting to earn rewards!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {season.isActive && (
          <div className="mt-6 text-center">
            <Button variant="primary" size="lg">
              Start Collecting 🦭
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sample season data
export const CURRENT_SEASON: Season = {
  id: 'winter-2024',
  name: 'Winter Wonderland',
  description: 'Collect special winter seals and climb the seasonal leaderboard!',
  startDate: new Date('2024-12-01'),
  endDate: new Date('2024-12-31'),
  rewards: [
    'Exclusive Winter Seal Badge',
    'Limited Edition Profile Frame',
    'Bonus XP Multiplier (2x)',
    'Early Access to Spring Season',
  ],
  isActive: true,
};
