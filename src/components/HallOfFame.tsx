'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/date';
import { AddressAvatar } from '@/components/ui/Avatar';

interface HallOfFameEntry {
  rank: number;
  address: string;
  displayName?: string;
  totalSeals: number;
  achievements: number;
  joinedAt: Date;
  streak?: number;
}

interface HallOfFameProps {
  entries: HallOfFameEntry[];
  className?: string;
}

const medalEmojis = ['🥇', '🥈', '🥉'];

export function HallOfFame({ entries, className = '' }: HallOfFameProps) {
  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏛️ Hall of Fame
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 0, 2].map((index) => {
            const entry = topThree[index];
            if (!entry) return <div key={index} />;
            
            return (
              <div
                key={entry.address}
                className={`text-center ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}
              >
                <div
                  className={`rounded-xl p-4 ${
                    entry.rank === 1
                      ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 ring-2 ring-yellow-500/50'
                      : entry.rank === 2
                      ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/20'
                      : 'bg-gradient-to-br from-amber-600/20 to-amber-700/20'
                  }`}
                >
                  <div className="text-4xl mb-2">{medalEmojis[entry.rank - 1]}</div>
                  <AddressAvatar
                    address={entry.address}
                    size={entry.rank === 1 ? 'xl' : 'lg'}
                    className="mx-auto mb-2"
                  />
                  <div className="font-medium text-white truncate">
                    {entry.displayName || `${entry.address.slice(0, 6)}...`}
                  </div>
                  <div className="text-2xl font-bold text-white">{entry.totalSeals}</div>
                  <div className="text-xs text-gray-400">seals</div>
                  {entry.streak && entry.streak > 7 && (
                    <Badge variant="warning" className="mt-2">
                      🔥 {entry.streak}d streak
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest of the list */}
        {rest.length > 0 && (
          <div className="space-y-2">
            {rest.map((entry) => (
              <div
                key={entry.address}
                className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="w-8 text-center font-bold text-gray-400">
                  #{entry.rank}
                </div>
                <AddressAvatar address={entry.address} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {entry.displayName || `${entry.address.slice(0, 8)}...${entry.address.slice(-6)}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    Joined {formatRelativeTime(entry.joinedAt.getTime())}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{entry.totalSeals}</div>
                  <div className="text-xs text-gray-400">{entry.achievements} 🏆</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sample data
export const SAMPLE_HALL_OF_FAME: HallOfFameEntry[] = [
  {
    rank: 1,
    address: '0x1234567890abcdef1234567890abcdef12345678',
    displayName: 'SealMaster',
    totalSeals: 247,
    achievements: 15,
    joinedAt: new Date('2024-01-15'),
    streak: 42,
  },
  {
    rank: 2,
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    displayName: 'VaultKing',
    totalSeals: 189,
    achievements: 12,
    joinedAt: new Date('2024-02-01'),
    streak: 28,
  },
  {
    rank: 3,
    address: '0x7890abcdef1234567890abcdef1234567890abcd',
    displayName: 'Collector.eth',
    totalSeals: 156,
    achievements: 10,
    joinedAt: new Date('2024-01-20'),
  },
];
