import { Metadata } from 'next';
import { SeasonalEvent, CURRENT_SEASON } from '@/components/SeasonalEvent';

export const metadata: Metadata = {
  title: 'Season | TriVault',
  description: 'Current seasonal event and rewards',
};

export default function SeasonPage() {
  const userProgress = {
    sealsCollected: 12,
    rank: 47,
    rewards: ['5 XP Bonus', '15 XP Bonus'],
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SeasonalEvent season={CURRENT_SEASON} userProgress={userProgress} />
      </div>
    </div>
  );
}
