import { Metadata } from 'next';
import { QuestSystem, SAMPLE_QUESTS } from '@/components/QuestSystem';

export const metadata: Metadata = {
  title: 'Quests | TriVault',
  description: 'Complete quests and earn rewards',
};

export default function QuestsPage() {
  const handleClaim = (questId: string) => {
    console.log('Claiming quest:', questId);
    // In a real app, this would call an API or smart contract
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🎯 Quests</h1>
          <p className="text-gray-400 mt-2">
            Complete quests to earn XP and unlock rewards
          </p>
        </div>

        <QuestSystem quests={SAMPLE_QUESTS} onClaim={handleClaim} />
      </div>
    </div>
  );
}
