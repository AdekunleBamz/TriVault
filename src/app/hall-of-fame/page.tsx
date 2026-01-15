import { Metadata } from 'next';
import { HallOfFame, SAMPLE_HALL_OF_FAME } from '@/components/HallOfFame';

export const metadata: Metadata = {
  title: 'Hall of Fame | TriVault',
  description: 'Top seal collectors of all time',
};

export default function HallOfFamePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🏛️ Hall of Fame</h1>
          <p className="text-gray-400 mt-2">
            Honoring the greatest seal collectors of all time
          </p>
        </div>

        <HallOfFame entries={SAMPLE_HALL_OF_FAME} />
      </div>
    </div>
  );
}
