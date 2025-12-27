'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { TRIVAULT_ADDRESS, TRIVAULT_ABI, VAULTS, CREATOR_FEE } from '@/config/contracts'
import { useState, useEffect } from 'react'

interface VaultCardProps {
  vault: typeof VAULTS[number]
  isSealed: boolean
  interactionCount: bigint
  onCollect: () => void
  isPending: boolean
  isConfirming: boolean
}

function VaultCard({ vault, isSealed, interactionCount, onCollect, isPending, isConfirming }: VaultCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${vault.color} p-1`}>
      <div className="bg-gray-900 rounded-xl p-6 h-full">
        {/* Seal badge */}
        {isSealed && (
          <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            ✓ SEALED
          </div>
        )}
        
        {/* Icon */}
        <div className="text-5xl mb-4">{vault.icon}</div>
        
        {/* Info */}
        <h3 className="text-xl font-bold text-white mb-1">{vault.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{vault.description}</p>
        
        {/* Stats */}
        <div className="text-gray-500 text-xs mb-4">
          {interactionCount.toString()} collectors
        </div>
        
        {/* Button */}
        <button
          onClick={onCollect}
          disabled={isSealed || isPending || isConfirming}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            isSealed
              ? 'bg-green-600 text-white cursor-not-allowed'
              : isPending || isConfirming
              ? 'bg-gray-600 text-gray-300 cursor-wait'
              : `bg-gradient-to-r ${vault.color} text-white hover:opacity-90`
          }`}
        >
          {isSealed
            ? '✓ Collected'
            : isPending
            ? 'Confirm in wallet...'
            : isConfirming
            ? 'Confirming...'
            : `Collect Seal (${CREATOR_FEE} ETH)`}
        </button>
      </div>
    </div>
  )
}

export function VaultGrid() {
  const { address, isConnected } = useAccount()
  const [activeVault, setActiveVault] = useState<number | null>(null)

  // Read user seals
  const { data: userSeals, refetch: refetchSeals } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'getUserSeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Read stats
  const { data: stats, refetch: refetchStats } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'getStats',
  })

  // Check if user has all seals
  const { data: hasAllSeals } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'hasAllSeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Write contract
  const { writeContract, data: hash, isPending, reset } = useWriteContract()

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Refetch after successful transaction
  useEffect(() => {
    if (isSuccess) {
      refetchSeals()
      refetchStats()
      setActiveVault(null)
      reset()
    }
  }, [isSuccess, refetchSeals, refetchStats, reset])

  const handleCollect = (vaultNumber: number) => {
    setActiveVault(vaultNumber)
    writeContract({
      address: TRIVAULT_ADDRESS,
      abi: TRIVAULT_ABI,
      functionName: 'collectSeal',
      args: [vaultNumber],
      value: parseEther(CREATOR_FEE),
    })
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400">Connect your wallet to start collecting seals</p>
      </div>
    )
  }

  return (
    <div>
      {/* Progress */}
      {hasAllSeals && (
        <div className="mb-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-bold text-white">All Seals Collected!</h2>
          <p className="text-yellow-100">You&apos;ve completed the TriVault challenge!</p>
        </div>
      )}

      {/* Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VAULTS.map((vault, index) => (
          <VaultCard
            key={vault.id}
            vault={vault}
            isSealed={userSeals?.[index] ?? false}
            interactionCount={stats ? stats[index + 1] : BigInt(0)}
            onCollect={() => handleCollect(vault.id)}
            isPending={isPending && activeVault === vault.id}
            isConfirming={isConfirming && activeVault === vault.id}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📊 Global Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {stats ? (Number(stats[0]) / 1e18).toFixed(6) : '0'}
            </div>
            <div className="text-gray-400 text-sm">Total Fees (ETH)</div>
          </div>
          {VAULTS.map((vault, index) => (
            <div key={vault.id}>
              <div className="text-2xl font-bold text-white">
                {stats ? stats[index + 1].toString() : '0'}
              </div>
              <div className="text-gray-400 text-sm">{vault.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
