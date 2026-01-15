'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Quest {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  completed: boolean;
  type: 'daily' | 'weekly' | 'special';
}

interface QuestSystemProps {
  quests: Quest[];
  onClaim: (questId: string) => void;
  className?: string;
}

const typeLabels = {
  daily: { label: 'Daily', color: 'bg-blue-500/20 text-blue-400' },
  weekly: { label: 'Weekly', color: 'bg-purple-500/20 text-purple-400' },
  special: { label: 'Special', color: 'bg-yellow-500/20 text-yellow-400' },
};

export function QuestSystem({ quests, onClaim, className = '' }: QuestSystemProps) {
  const dailyQuests = quests.filter((q) => q.type === 'daily');
  const weeklyQuests = quests.filter((q) => q.type === 'weekly');
  const specialQuests = quests.filter((q) => q.type === 'special');

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🎯 Quests</CardTitle>
            <Badge variant="default">{completedCount}/{quests.length} Completed</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dailyQuests.length > 0 && (
              <QuestSection title="Daily Quests" quests={dailyQuests} onClaim={onClaim} />
            )}
            {weeklyQuests.length > 0 && (
              <QuestSection title="Weekly Quests" quests={weeklyQuests} onClaim={onClaim} />
            )}
            {specialQuests.length > 0 && (
              <QuestSection title="Special Quests" quests={specialQuests} onClaim={onClaim} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuestSectionProps {
  title: string;
  quests: Quest[];
  onClaim: (questId: string) => void;
}

function QuestSection({ title, quests, onClaim }: QuestSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
      <div className="space-y-3">
        {quests.map((quest) => (
          <QuestItem key={quest.id} quest={quest} onClaim={onClaim} />
        ))}
      </div>
    </div>
  );
}

interface QuestItemProps {
  quest: Quest;
  onClaim: (questId: string) => void;
}

function QuestItem({ quest, onClaim }: QuestItemProps) {
  const progress = Math.min((quest.progress / quest.total) * 100, 100);
  const canClaim = quest.progress >= quest.total && !quest.completed;

  return (
    <div className={`p-4 rounded-lg ${quest.completed ? 'bg-gray-800/30' : 'bg-gray-800'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium ${quest.completed ? 'text-gray-500' : 'text-white'}`}>
              {quest.title}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeLabels[quest.type].color}`}>
              {typeLabels[quest.type].label}
            </span>
          </div>
          <p className="text-sm text-gray-400">{quest.description}</p>
          
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  quest.completed ? 'bg-gray-500' : 'bg-purple-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-400">
              {quest.progress}/{quest.total}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-purple-400 mb-2">{quest.reward}</div>
          {quest.completed ? (
            <Badge variant="success">Claimed</Badge>
          ) : canClaim ? (
            <Button size="sm" variant="primary" onClick={() => onClaim(quest.id)}>
              Claim
            </Button>
          ) : (
            <Badge variant="default">In Progress</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Sample quests data
export const SAMPLE_QUESTS: Quest[] = [
  {
    id: 'daily-1',
    title: 'First Collection of the Day',
    description: 'Collect at least 1 seal today',
    reward: '10 XP',
    progress: 0,
    total: 1,
    completed: false,
    type: 'daily',
  },
  {
    id: 'daily-2',
    title: 'Vault Explorer',
    description: 'Collect from 2 different vaults today',
    reward: '25 XP',
    progress: 1,
    total: 2,
    completed: false,
    type: 'daily',
  },
  {
    id: 'weekly-1',
    title: 'Dedicated Collector',
    description: 'Collect 10 seals this week',
    reward: '100 XP',
    progress: 3,
    total: 10,
    completed: false,
    type: 'weekly',
  },
  {
    id: 'special-1',
    title: 'Complete Collection',
    description: 'Collect a seal from all 3 vaults',
    reward: '🏆 Achievement',
    progress: 2,
    total: 3,
    completed: false,
    type: 'special',
  },
];
