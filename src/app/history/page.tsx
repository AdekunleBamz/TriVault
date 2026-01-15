import { Metadata } from 'next';
import { TransactionHistory } from '@/components/TransactionHistory';

export const metadata: Metadata = {
  title: 'History | TriVault',
  description: 'View your seal collection transaction history',
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400 mt-2">
            View all your seal collection transactions
          </p>
        </div>

        <TransactionHistory />

        <div className="mt-8 p-6 bg-gray-800/50 rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Understanding Your History</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div>
              <h3 className="font-medium text-white mb-2">🦭 Seal Collected</h3>
              <p>When you successfully collect a seal from any vault</p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">⏳ Pending</h3>
              <p>Transaction submitted but not yet confirmed on Base</p>
            </div>
            <div>
              <h3 className="font-medium text-white mb-2">✅ Confirmed</h3>
              <p>Transaction successfully included in a block</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
