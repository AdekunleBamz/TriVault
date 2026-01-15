'use client'

import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { TRIVAULT_ADDRESS, TRIVAULT_ABI, VAULTS } from '@/config/contracts'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Badge, SealBadge } from './ui/Badge'
import { Skeleton } from './ui/Skeleton'
import { ShareModal } from './ShareModal'
import { formatAddress } from '@/lib/utils'
import { useClipboard } from '@/hooks'
import { useToast } from './ui/ToastProvider'
import Link from 'next/link'

export function ProfileView() {
  const { address, isConnected } = useAccount()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const { copy } = useClipboard()
  const { success } = useToast()

  // Read user seals
  const { data: userSeals, isLoading: isLoadingSeals } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'getUserSeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Check if user has all seals
  const { data: hasAllSeals } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'hasAllSeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  const sealsCollected = userSeals ? userSeals.filter(Boolean).length : 0

  const handleCopyAddress = async () => {
    if (address) {
      await copy(address)
      success('Address copied!')
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-400 mb-6">Connect your wallet to view your profile</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card gradient={hasAllSeals ? 'from-yellow-500 to-orange-500' : 'from-blue-500 to-purple-500'}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl">
            {hasAllSeals ? '🏆' : '👤'}
          </div>
          
          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {formatAddress(address!, 10, 6)}
              </h2>
              <button
                onClick={handleCopyAddress}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Copy address"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2">
              {hasAllSeals ? (
                <Badge variant="success">👑 TriVault Champion</Badge>
              ) : (
                <Badge variant="info">{sealsCollected}/3 Seals Collected</Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsShareModalOpen(true)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              }
            >
              Share
            </Button>
            <a
              href={`https://basescan.org/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">View on BaseScan</Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Seals Collection */}
      <Card>
        <CardHeader>
          <CardTitle>Your Seals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VAULTS.map((vault, index) => {
              const isCollected = userSeals?.[index] ?? false
              
              return (
                <div
                  key={vault.id}
                  className={`
                    relative overflow-hidden rounded-xl p-4
                    ${isCollected 
                      ? `bg-gradient-to-br ${vault.color}` 
                      : 'bg-gray-800 opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{vault.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white">{vault.name}</h4>
                      {isLoadingSeals ? (
                        <Skeleton width={80} height={20} />
                      ) : (
                        <SealBadge sealed={isCollected} />
                      )}
                    </div>
                  </div>
                  
                  {isCollected && (
                    <div className="absolute top-2 right-2">
                      <span className="text-2xl">✓</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Completion</span>
                <span className="text-white font-medium">{sealsCollected}/3 ({Math.round((sealsCollected / 3) * 100)}%)</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(sealsCollected / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Next Steps */}
            {!hasAllSeals && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Next Steps</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Collect {3 - sealsCollected} more seal{3 - sealsCollected > 1 ? 's' : ''} to become a TriVault Champion!
                </p>
                <Link href="/">
                  <Button>Continue Collecting</Button>
                </Link>
              </div>
            )}

            {hasAllSeals && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">🎉 Congratulations!</h4>
                <p className="text-gray-300 text-sm">
                  You&apos;ve completed the TriVault challenge! Share your achievement with friends.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sealsCollected={sealsCollected}
        address={address}
      />
    </div>
  )
}
