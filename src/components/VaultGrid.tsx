'use client'

import { useAccount } from 'wagmi'
import { SEALS, SEAL_FEE } from '@/config/contracts'
import { useState, useCallback } from 'react'
import { useSealVault, useCollectSeal } from '@/hooks/useTriVault'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

interface SealCardProps {
  seal: typeof SEALS[number]
  isCollected: boolean
  collectorCount: number
  onCollect: () => void
  isPending: boolean
  isConfirming: boolean
}

function SealCard({ seal, isCollected, collectorCount, onCollect, isPending, isConfirming }: SealCardProps) {
  const isLoading = isPending || isConfirming

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${seal.color} p-[2px]`}>
      <div className="bg-gray-900 rounded-xl p-5 h-full flex flex-col">
        {/* Collected badge */}
        {isCollected && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
            ✓ COLLECTED
          </div>
        )}
        
        {/* Icon */}
        <div className="text-5xl mb-3 filter drop-shadow-lg">{seal.icon}</div>
        
        {/* Info */}
        <h3 className="text-lg font-bold text-white mb-1">{seal.name}</h3>
        <p className="text-gray-400 text-sm mb-3 flex-grow">{seal.description}</p>
        
        {/* Stats */}
        <div className="text-gray-500 text-xs mb-3 flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
          {collectorCount.toLocaleString()} collectors
        </div>
        
        {/* Button */}
        <Button
          onClick={onCollect}
          disabled={isCollected || isLoading}
          isLoading={isLoading}
          variant={isCollected ? 'secondary' : 'primary'}
          className={`w-full ${!isCollected && !isLoading ? `bg-gradient-to-r ${seal.color}` : ''}`}
        >
          {isCollected
            ? '✓ Collected'
            : isPending
            ? 'Confirm in wallet...'
            : isConfirming
            ? 'Confirming...'
            : `Collect (${SEAL_FEE} ETH)`}
        </Button>
      </div>
    </Card>
  )
}

function SealCardSkeleton() {
  return (
    <Card className="p-5 h-full">
      <Skeleton className="w-12 h-12 mb-3" />
      <Skeleton className="w-3/4 h-6 mb-2" />
      <Skeleton className="w-full h-4 mb-1" />
      <Skeleton className="w-1/2 h-4 mb-3" />
      <Skeleton className="w-full h-10" />
    </Card>
  )
}

export function VaultGrid() {
  const { isConnected } = useAccount()
  const { userSeals, hasAllSeals, stats, isLoadingSeals } = useSealVault()
  const { collectSeal, collectMultipleSeals, isPending, isConfirming } = useCollectSeal()
  const [activeSeal, setActiveSeal] = useState<number | null>(null)

  const handleCollect = useCallback((sealType: number) => {
    setActiveSeal(sealType)
    collectSeal(sealType)
  }, [collectSeal])

  const handleCollectAll = useCallback(() => {
    const uncollectedSeals = SEALS
      .filter((_, index) => !userSeals[index])
      .map(seal => seal.id)
    
    if (uncollectedSeals.length > 0) {
      setActiveSeal(-1) // -1 indicates "all"
      collectMultipleSeals(uncollectedSeals)
    }
  }, [userSeals, collectMultipleSeals])

  // Get seal counts from stats
  const getSealCount = (index: number): number => {
    if (!stats?.sealCounts) return 0
    return Number(stats.sealCounts[index] || 0)
  }

  const collectedCount = userSeals.filter(Boolean).length
  const uncollectedCount = SEALS.length - collectedCount

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to start collecting seals</p>
      </div>
    )
  }

  if (isLoadingSeals) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <SealCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Completion Banner */}
      {hasAllSeals && (
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-white">All 5 Seals Collected!</h2>
          <p className="text-yellow-100">You&apos;ve completed the TriVault Seal Collection!</p>
        </Card>
      )}

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Collection Progress</span>
          <span className="text-sm text-gray-400">{collectedCount}/{SEALS.length} Seals</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${(collectedCount / SEALS.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Collect All Button */}
      {uncollectedCount > 1 && (
        <Button
          onClick={handleCollectAll}
          disabled={isPending || isConfirming}
          isLoading={activeSeal === -1 && (isPending || isConfirming)}
          variant="primary"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {isPending && activeSeal === -1
            ? 'Confirm in wallet...'
            : isConfirming && activeSeal === -1
            ? 'Confirming...'
            : `Collect All ${uncollectedCount} Seals (${(parseFloat(SEAL_FEE) * uncollectedCount).toFixed(5)} ETH)`}
        </Button>
      )}

      {/* Seal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {SEALS.map((seal, index) => (
          <SealCard
            key={seal.id}
            seal={seal}
            isCollected={userSeals[index] ?? false}
            collectorCount={getSealCount(index)}
            onCollect={() => handleCollect(seal.id)}
            isPending={isPending && activeSeal === seal.id}
            isConfirming={isConfirming && activeSeal === seal.id}
          />
        ))}
      </div>

      {/* Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Global Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xl font-bold text-blue-400">
              {stats ? stats.totalSealsCollected.toLocaleString() : '0'}
            </div>
            <div className="text-gray-400 text-xs">Total Collected</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xl font-bold text-green-400">
              {stats ? (Number(stats.totalFeesCollected) / 1e18).toFixed(4) : '0'}
            </div>
            <div className="text-gray-400 text-xs">Fees (ETH)</div>
          </div>
          {SEALS.slice(0, 4).map((seal, index) => (
            <div key={seal.id} className="bg-gray-800 rounded-lg p-3">
              <div className="text-xl font-bold text-white">
                {getSealCount(index).toLocaleString()}
              </div>
              <div className="text-gray-400 text-xs flex items-center justify-center gap-1">
                <span>{seal.icon}</span>
                {seal.name}
              </div>
            </div>
          ))}
        </div>
        {/* Fifth seal stat */}
        <div className="mt-4 flex justify-center">
          <div className="bg-gray-800 rounded-lg p-3 text-center min-w-[120px]">
            <div className="text-xl font-bold text-white">
              {getSealCount(4).toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs flex items-center justify-center gap-1">
              <span>{SEALS[4]?.icon}</span>
              {SEALS[4]?.name}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
