'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { useAchievements } from '@/hooks/useAchievements';
import { Tooltip } from '@/components/ui/Tooltip';

interface SealCollectionProps {
  userSeals: boolean[];
  totalSeals: number;
  className?: string;
}

const vaultInfo = [
  { name: 'Ruby', emoji: '🔴', color: 'from-red-500 to-rose-600' },
  { name: 'Emerald', emoji: '🟢', color: 'from-green-500 to-emerald-600' },
  { name: 'Sapphire', emoji: '🔵', color: 'from-blue-500 to-indigo-600' },
];

export function SealCollection({ userSeals, totalSeals, className = '' }: SealCollectionProps) {
  const collectedCount = userSeals.filter(Boolean).length;
  const progress = (collectedCount / 3) * 100;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Collection</span>
          <Badge variant="default">
            {collectedCount}/3 Seals
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProgressBar value={progress} className="mb-6" showLabel />
        
        <div className="grid grid-cols-3 gap-4">
          {vaultInfo.map((vault, index) => (
            <SealCard
              key={vault.name}
              vault={vault}
              collected={userSeals[index]}
              vaultId={index}
            />
          ))}
        </div>

        {collectedCount === 3 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg text-center">
            <span className="text-2xl mb-2 block">🎉</span>
            <p className="text-white font-medium">Congratulations!</p>
            <p className="text-gray-400 text-sm">You&apos;ve collected all seals!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SealCardProps {
  vault: typeof vaultInfo[number];
  collected: boolean;
  vaultId: number;
}

function SealCard({ vault, collected, vaultId }: SealCardProps) {
  return (
    <Tooltip content={collected ? `${vault.name} seal collected!` : `Collect from ${vault.name} vault`}>
      <div
        className={`relative aspect-square rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
          collected
            ? `bg-gradient-to-br ${vault.color} shadow-lg`
            : 'bg-gray-800 border-2 border-dashed border-gray-600'
        }`}
      >
        <span className={`text-4xl ${collected ? '' : 'grayscale opacity-50'}`}>
          {vault.emoji}
        </span>
        <span className={`mt-2 text-sm font-medium ${collected ? 'text-white' : 'text-gray-500'}`}>
          {vault.name}
        </span>
        {collected && (
          <span className="absolute top-2 right-2 text-lg">✓</span>
        )}
      </div>
    </Tooltip>
  );
}

interface CollectionStatsProps {
  totalCollectors: number;
  totalSeals: number;
  userRank?: number;
  className?: string;
}

export function CollectionStats({
  totalCollectors,
  totalSeals,
  userRank,
  className = '',
}: CollectionStatsProps) {
  const stats = [
    { label: 'Total Collectors', value: totalCollectors, icon: '👥' },
    { label: 'Seals Collected', value: totalSeals, icon: '🦭' },
    { label: 'Your Rank', value: userRank || '-', icon: '🏆' },
  ];

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-gray-800/50 rounded-xl p-4 text-center"
        >
          <span className="text-2xl">{stat.icon}</span>
          <div className="mt-2 text-2xl font-bold text-white">{stat.value}</div>
          <div className="text-xs text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
