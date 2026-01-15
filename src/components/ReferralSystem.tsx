'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCompactNumber } from '@/lib/numbers';

interface ReferralStats {
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  earnings: string;
}

interface ReferralSystemProps {
  userAddress?: string;
  stats?: ReferralStats;
  className?: string;
}

export function ReferralSystem({ userAddress, stats, className = '' }: ReferralSystemProps) {
  const [copied, setCopied] = React.useState(false);
  const referralCode = stats?.code || 'SEAL2024';
  const referralLink = `https://trivault.app?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎁 Referral Program
            <Badge variant="success">Active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-6">
            Invite friends to TriVault and earn rewards when they collect seals!
          </p>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <label className="block text-sm text-gray-400 mb-2">Your Referral Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white font-mono text-sm"
              />
              <Button onClick={handleCopy} variant="primary">
                {copied ? '✓ Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatCompactNumber(stats?.totalReferrals || 0)}
              </div>
              <div className="text-sm text-gray-400">Total Referrals</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {formatCompactNumber(stats?.activeReferrals || 0)}
              </div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {stats?.earnings || '0'} ETH
              </div>
              <div className="text-sm text-gray-400">Earnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-white">Share Your Link</h4>
                <p className="text-sm text-gray-400">Copy and share your unique referral link with friends</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-white">Friends Join</h4>
                <p className="text-sm text-gray-400">When friends sign up using your link, they&apos;re connected to you</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-white">Earn Rewards</h4>
                <p className="text-sm text-gray-400">Receive a portion of fees when your referrals collect seals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
