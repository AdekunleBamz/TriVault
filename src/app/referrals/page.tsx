import { Metadata } from 'next';
import { ReferralSystem } from '@/components/ReferralSystem';

export const metadata: Metadata = {
  title: 'Referrals | TriVault',
  description: 'Invite friends and earn rewards with TriVault referral program',
};

export default function ReferralsPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Referral Program</h1>
          <p className="text-gray-400 mt-2">
            Invite friends to TriVault and earn rewards together
          </p>
        </div>

        <ReferralSystem />
      </div>
    </div>
  );
}
