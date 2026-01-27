import { Metadata } from 'next';
import { Achievements } from '@/components/Achievements';

export const metadata: Metadata = {
  title: 'Achievements | TriVault',
  description: 'View your achievements and unlock new badges',
};

export default function AchievementsPage() {
  // Sample data - in production, this would come from user's actual data
  const achievementData = {
    sealsCollected: 5,
    hasAllSeals: false,
    totalInteractions: 10,
    isEarlyAdopter: true,
    referralCount: 0,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Achievements</h1>
          <p className="text-gray-400 mt-2">
            Track your progress and unlock badges
          </p>
        </div>

        <Achievements data={achievementData} />
      </div>
    </div>
  );
}
