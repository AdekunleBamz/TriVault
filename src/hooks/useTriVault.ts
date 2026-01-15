'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { TRIVAULT_ADDRESS, TRIVAULT_ABI, CREATOR_FEE } from '@/config/contracts'
import { useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/ToastProvider'

export function useTriVault() {
  const { address, isConnected } = useAccount()

  // Read user seals
  const {
    data: userSeals,
    isLoading: isLoadingSeals,
    refetch: refetchSeals,
  } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'getUserSeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Check if user has all seals
  const { data: hasAllSeals, refetch: refetchHasAllSeals } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'hasAllSeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Read contract stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'getStats',
  })

  // Calculate derived values
  const sealsCollected = userSeals ? userSeals.filter(Boolean).length : 0
  const totalInteractions = stats
    ? Number(stats[1]) + Number(stats[2]) + Number(stats[3])
    : 0

  // Refetch all data
  const refetchAll = useCallback(() => {
    refetchSeals()
    refetchHasAllSeals()
    refetchStats()
  }, [refetchSeals, refetchHasAllSeals, refetchStats])

  return {
    // Connection state
    address,
    isConnected,
    
    // User data
    userSeals: userSeals ?? [false, false, false],
    hasAllSeals: hasAllSeals ?? false,
    sealsCollected,
    isLoadingSeals,
    
    // Contract stats
    stats,
    totalInteractions,
    isLoadingStats,
    
    // Actions
    refetchAll,
    refetchSeals,
    refetchStats,
  }
}

export function useCollectSeal() {
  const { success, error: showError } = useToast()
  const { refetchAll } = useTriVault()

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({ hash })

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess) {
      success('Seal collected!', 'Your seal has been recorded on-chain')
      refetchAll()
      reset()
    }
  }, [isSuccess, success, refetchAll, reset])

  // Handle errors
  useEffect(() => {
    const error = writeError || txError
    if (error) {
      const message = getErrorMessage(error)
      showError('Transaction failed', message)
    }
  }, [writeError, txError, showError])

  const collectSeal = useCallback(
    (vaultNumber: number) => {
      writeContract({
        address: TRIVAULT_ADDRESS,
        abi: TRIVAULT_ABI,
        functionName: 'collectSeal',
        args: [vaultNumber],
        value: parseEther(CREATOR_FEE),
      })
    },
    [writeContract]
  )

  return {
    collectSeal,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || txError,
    reset,
  }
}

// Helper to parse error messages
function getErrorMessage(error: Error): string {
  const message = error.message.toLowerCase()
  
  if (message.includes('insufficient')) {
    return 'Insufficient ETH for the transaction fee'
  }
  if (message.includes('already sealed') || message.includes('alreadysealed')) {
    return 'You have already collected this seal'
  }
  if (message.includes('rejected') || message.includes('denied')) {
    return 'Transaction was rejected'
  }
  if (message.includes('network')) {
    return 'Network error. Please check your connection'
  }
  
  return 'An unexpected error occurred'
}
