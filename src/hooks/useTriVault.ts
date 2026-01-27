'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import {
  TRIVAULT_CORE_ADDRESS,
  SEAL_VAULT_ADDRESS,
  REWARDS_VAULT_ADDRESS,
  ACHIEVEMENT_VAULT_ADDRESS,
  GOVERNANCE_VAULT_ADDRESS,
  TRIVAULT_CORE_ABI,
  SEAL_VAULT_ABI,
  REWARDS_VAULT_ABI,
  ACHIEVEMENT_VAULT_ABI,
  GOVERNANCE_VAULT_ABI,
  SEAL_FEE,
  PROPOSAL_FEE,
  // Legacy exports
  TRIVAULT_ADDRESS,
  TRIVAULT_ABI,
  CREATOR_FEE,
} from '@/config/contracts'
import { useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/ToastProvider'

// ============ Core Hook ============

export function useTriVaultCore() {
  const { address, isConnected } = useAccount()

  // Read user info from core
  const {
    data: userInfo,
    isLoading: isLoadingUserInfo,
    refetch: refetchUserInfo,
  } = useReadContract({
    address: TRIVAULT_CORE_ADDRESS,
    abi: TRIVAULT_CORE_ABI,
    functionName: 'getUserInfo',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Read protocol stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useReadContract({
    address: TRIVAULT_CORE_ADDRESS,
    abi: TRIVAULT_CORE_ABI,
    functionName: 'getStats',
  })

  // Read contract addresses
  const { data: contracts, refetch: refetchContracts } = useReadContract({
    address: TRIVAULT_CORE_ADDRESS,
    abi: TRIVAULT_CORE_ABI,
    functionName: 'getContracts',
  })

  // Check if paused
  const { data: isPaused } = useReadContract({
    address: TRIVAULT_CORE_ADDRESS,
    abi: TRIVAULT_CORE_ABI,
    functionName: 'paused',
  })

  const refetchAll = useCallback(() => {
    refetchUserInfo()
    refetchStats()
    refetchContracts()
  }, [refetchUserInfo, refetchStats, refetchContracts])

  return {
    address,
    isConnected,
    userInfo: userInfo ? {
      registered: userInfo[0],
      registrationTime: userInfo[1],
      interactionCount: userInfo[2],
    } : null,
    stats: stats ? {
      totalUsers: stats[0],
      totalInteractions: stats[1],
      totalFees: stats[2],
    } : null,
    contracts: contracts ? {
      sealVault: contracts[0],
      rewardsVault: contracts[1],
      achievementVault: contracts[2],
      governanceVault: contracts[3],
    } : null,
    isPaused: isPaused ?? false,
    isLoadingUserInfo,
    isLoadingStats,
    refetchAll,
  }
}

// ============ Seal Vault Hook ============

export function useSealVault() {
  const { address, isConnected } = useAccount()

  // Read user seals
  const {
    data: userSeals,
    isLoading: isLoadingSeals,
    refetch: refetchSeals,
  } = useReadContract({
    address: SEAL_VAULT_ADDRESS,
    abi: SEAL_VAULT_ABI,
    functionName: 'getUserSeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Check if user has all seals
  const { data: hasAllSeals, refetch: refetchHasAllSeals } = useReadContract({
    address: SEAL_VAULT_ADDRESS,
    abi: SEAL_VAULT_ABI,
    functionName: 'hasAllSeals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Get seal count
  const { data: sealCount, refetch: refetchSealCount } = useReadContract({
    address: SEAL_VAULT_ADDRESS,
    abi: SEAL_VAULT_ABI,
    functionName: 'getSealCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Read contract stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useReadContract({
    address: SEAL_VAULT_ADDRESS,
    abi: SEAL_VAULT_ABI,
    functionName: 'getStats',
  })

  // Get all seal info
  const { data: allSealInfo, refetch: refetchSealInfo } = useReadContract({
    address: SEAL_VAULT_ADDRESS,
    abi: SEAL_VAULT_ABI,
    functionName: 'getAllSealInfo',
  })

  const sealsCollected = sealCount ? Number(sealCount) : 0
  const totalSeals = stats ? Number(stats[0]) : 0

  const refetchAll = useCallback(() => {
    refetchSeals()
    refetchHasAllSeals()
    refetchSealCount()
    refetchStats()
    refetchSealInfo()
  }, [refetchSeals, refetchHasAllSeals, refetchSealCount, refetchStats, refetchSealInfo])

  return {
    address,
    isConnected,
    userSeals: userSeals ?? [false, false, false, false, false],
    hasAllSeals: hasAllSeals ?? false,
    sealsCollected,
    isLoadingSeals,
    stats: stats ? {
      totalSealsCollected: Number(stats[0]),
      totalFeesCollected: stats[1],
      sealCounts: stats[2],
    } : null,
    allSealInfo,
    isLoadingStats,
    refetchAll,
    refetchSeals,
    refetchStats,
  }
}

// ============ Collect Seal Hook ============

export function useCollectSeal() {
  const { success, error: showError } = useToast()
  const { refetchAll } = useSealVault()

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

  useEffect(() => {
    if (isSuccess) {
      success('Seal collected!', 'Your seal has been recorded on-chain')
      refetchAll()
      reset()
    }
  }, [isSuccess, success, refetchAll, reset])

  useEffect(() => {
    const error = writeError || txError
    if (error) {
      const message = getErrorMessage(error)
      showError('Transaction failed', message)
    }
  }, [writeError, txError, showError])

  const collectSeal = useCallback(
    (sealType: number) => {
      writeContract({
        address: SEAL_VAULT_ADDRESS,
        abi: SEAL_VAULT_ABI,
        functionName: 'collectSeal',
        args: [sealType],
        value: parseEther(SEAL_FEE),
      })
    },
    [writeContract]
  )

  const collectMultipleSeals = useCallback(
    (sealTypes: number[]) => {
      const totalFee = parseEther(SEAL_FEE) * BigInt(sealTypes.length)
      writeContract({
        address: SEAL_VAULT_ADDRESS,
        abi: SEAL_VAULT_ABI,
        functionName: 'collectMultipleSeals',
        args: [sealTypes],
        value: totalFee,
      })
    },
    [writeContract]
  )

  return {
    collectSeal,
    collectMultipleSeals,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || txError,
    reset,
  }
}

// ============ Rewards Vault Hook ============

export function useRewardsVault() {
  const { address, isConnected } = useAccount()

  // Get user reward stats
  const {
    data: rewardStats,
    isLoading: isLoadingRewards,
    refetch: refetchRewards,
  } = useReadContract({
    address: REWARDS_VAULT_ADDRESS,
    abi: REWARDS_VAULT_ABI,
    functionName: 'getUserRewardStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Get contract stats
  const {
    data: stats,
    refetch: refetchStats,
  } = useReadContract({
    address: REWARDS_VAULT_ADDRESS,
    abi: REWARDS_VAULT_ABI,
    functionName: 'getStats',
  })

  // Get top users
  const { data: topUsers, refetch: refetchLeaderboard } = useReadContract({
    address: REWARDS_VAULT_ADDRESS,
    abi: REWARDS_VAULT_ABI,
    functionName: 'getTopUsers',
    args: [BigInt(10)],
  })

  const refetchAll = useCallback(() => {
    refetchRewards()
    refetchStats()
    refetchLeaderboard()
  }, [refetchRewards, refetchStats, refetchLeaderboard])

  return {
    address,
    isConnected,
    userRewards: rewardStats ? {
      points: rewardStats[0],
      lifetimePoints: rewardStats[1],
      staked: rewardStats[2],
      claimed: rewardStats[3],
      claimable: rewardStats[4],
    } : null,
    stats: stats ? {
      totalStaked: stats[0],
      rewardsPool: stats[1],
      totalPointsDistributed: stats[2],
      currentSeason: stats[3],
    } : null,
    topUsers: topUsers ? {
      addresses: topUsers[0],
      points: topUsers[1],
    } : null,
    isLoadingRewards,
    refetchAll,
  }
}

// ============ Staking Hook ============

export function useStaking() {
  const { success, error: showError } = useToast()
  const { refetchAll } = useRewardsVault()

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

  useEffect(() => {
    if (isSuccess) {
      success('Transaction successful!', 'Your staking action has been completed')
      refetchAll()
      reset()
    }
  }, [isSuccess, success, refetchAll, reset])

  useEffect(() => {
    const error = writeError || txError
    if (error) {
      showError('Transaction failed', getErrorMessage(error))
    }
  }, [writeError, txError, showError])

  const stake = useCallback(
    (amount: string) => {
      writeContract({
        address: REWARDS_VAULT_ADDRESS,
        abi: REWARDS_VAULT_ABI,
        functionName: 'stake',
        value: parseEther(amount),
      })
    },
    [writeContract]
  )

  const unstake = useCallback(
    (amount: string) => {
      writeContract({
        address: REWARDS_VAULT_ADDRESS,
        abi: REWARDS_VAULT_ABI,
        functionName: 'unstake',
        args: [parseEther(amount)],
      })
    },
    [writeContract]
  )

  const claimRewards = useCallback(() => {
    writeContract({
      address: REWARDS_VAULT_ADDRESS,
      abi: REWARDS_VAULT_ABI,
      functionName: 'claimRewards',
    })
  }, [writeContract])

  return {
    stake,
    unstake,
    claimRewards,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || txError,
    reset,
  }
}

// ============ Achievement Vault Hook ============

export function useAchievementVault() {
  const { address, isConnected } = useAccount()

  // Get user achievements
  const {
    data: userAchievements,
    isLoading: isLoadingAchievements,
    refetch: refetchUserAchievements,
  } = useReadContract({
    address: ACHIEVEMENT_VAULT_ADDRESS,
    abi: ACHIEVEMENT_VAULT_ABI,
    functionName: 'getUserAchievementsDetailed',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Get achievement count
  const { data: achievementCount, refetch: refetchCount } = useReadContract({
    address: ACHIEVEMENT_VAULT_ADDRESS,
    abi: ACHIEVEMENT_VAULT_ABI,
    functionName: 'getAchievementCount',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Get all achievements
  const { data: allAchievements, refetch: refetchAllAchievements } = useReadContract({
    address: ACHIEVEMENT_VAULT_ADDRESS,
    abi: ACHIEVEMENT_VAULT_ABI,
    functionName: 'getAllAchievements',
  })

  // Get contract stats
  const { data: stats, refetch: refetchStats } = useReadContract({
    address: ACHIEVEMENT_VAULT_ADDRESS,
    abi: ACHIEVEMENT_VAULT_ABI,
    functionName: 'getStats',
  })

  const refetchAll = useCallback(() => {
    refetchUserAchievements()
    refetchCount()
    refetchAllAchievements()
    refetchStats()
  }, [refetchUserAchievements, refetchCount, refetchAllAchievements, refetchStats])

  return {
    address,
    isConnected,
    userAchievements: userAchievements ? {
      ids: userAchievements[0],
      names: userAchievements[1],
      unlockTimes: userAchievements[2],
    } : null,
    achievementCount: achievementCount ? Number(achievementCount) : 0,
    allAchievements,
    stats: stats ? {
      totalAchievements: Number(stats[0]),
      totalUnlocked: Number(stats[1]),
    } : null,
    isLoadingAchievements,
    refetchAll,
  }
}

// ============ Governance Vault Hook ============

export function useGovernanceVault() {
  const { address, isConnected } = useAccount()

  // Get user voting power
  const {
    data: votingPower,
    isLoading: isLoadingVotingPower,
    refetch: refetchVotingPower,
  } = useReadContract({
    address: GOVERNANCE_VAULT_ADDRESS,
    abi: GOVERNANCE_VAULT_ABI,
    functionName: 'getUserVotingPower',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Get user proposals
  const { data: userProposals, refetch: refetchUserProposals } = useReadContract({
    address: GOVERNANCE_VAULT_ADDRESS,
    abi: GOVERNANCE_VAULT_ABI,
    functionName: 'getUserProposals',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })

  // Get active proposals
  const { data: activeProposals, refetch: refetchActiveProposals } = useReadContract({
    address: GOVERNANCE_VAULT_ADDRESS,
    abi: GOVERNANCE_VAULT_ABI,
    functionName: 'getActiveProposals',
  })

  // Get contract stats
  const { data: stats, refetch: refetchStats } = useReadContract({
    address: GOVERNANCE_VAULT_ADDRESS,
    abi: GOVERNANCE_VAULT_ABI,
    functionName: 'getStats',
  })

  const refetchAll = useCallback(() => {
    refetchVotingPower()
    refetchUserProposals()
    refetchActiveProposals()
    refetchStats()
  }, [refetchVotingPower, refetchUserProposals, refetchActiveProposals, refetchStats])

  return {
    address,
    isConnected,
    votingPower: votingPower ? Number(votingPower) : 0,
    userProposals: userProposals ?? [],
    activeProposals: activeProposals ?? [],
    stats: stats ? {
      totalProposals: Number(stats[0]),
      totalVotes: Number(stats[1]),
      activeCount: Number(stats[2]),
    } : null,
    isLoadingVotingPower,
    refetchAll,
  }
}

// ============ Governance Actions Hook ============

export function useGovernanceActions() {
  const { success, error: showError } = useToast()
  const { refetchAll } = useGovernanceVault()

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

  useEffect(() => {
    if (isSuccess) {
      success('Transaction successful!', 'Your governance action has been completed')
      refetchAll()
      reset()
    }
  }, [isSuccess, success, refetchAll, reset])

  useEffect(() => {
    const error = writeError || txError
    if (error) {
      showError('Transaction failed', getErrorMessage(error))
    }
  }, [writeError, txError, showError])

  const createProposal = useCallback(
    (title: string, description: string, duration: bigint = BigInt(259200)) => { // 3 days default
      writeContract({
        address: GOVERNANCE_VAULT_ADDRESS,
        abi: GOVERNANCE_VAULT_ABI,
        functionName: 'createProposal',
        args: [title, description, duration],
        value: parseEther(PROPOSAL_FEE),
      })
    },
    [writeContract]
  )

  const vote = useCallback(
    (proposalId: `0x${string}`, support: boolean) => {
      writeContract({
        address: GOVERNANCE_VAULT_ADDRESS,
        abi: GOVERNANCE_VAULT_ABI,
        functionName: 'vote',
        args: [proposalId, support],
      })
    },
    [writeContract]
  )

  const executeProposal = useCallback(
    (proposalId: `0x${string}`) => {
      writeContract({
        address: GOVERNANCE_VAULT_ADDRESS,
        abi: GOVERNANCE_VAULT_ABI,
        functionName: 'executeProposal',
        args: [proposalId],
      })
    },
    [writeContract]
  )

  const cancelProposal = useCallback(
    (proposalId: `0x${string}`) => {
      writeContract({
        address: GOVERNANCE_VAULT_ADDRESS,
        abi: GOVERNANCE_VAULT_ABI,
        functionName: 'cancelProposal',
        args: [proposalId],
      })
    },
    [writeContract]
  )

  return {
    createProposal,
    vote,
    executeProposal,
    cancelProposal,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError || txError,
    reset,
  }
}

// ============ Legacy Hook (Backward Compatibility) ============

export function useTriVault() {
  const { address, isConnected } = useAccount()
  const sealVault = useSealVault()

  // Map to legacy format
  return {
    address,
    isConnected,
    userSeals: sealVault.userSeals,
    hasAllSeals: sealVault.hasAllSeals,
    sealsCollected: sealVault.sealsCollected,
    isLoadingSeals: sealVault.isLoadingSeals,
    stats: sealVault.stats,
    totalInteractions: sealVault.stats?.totalSealsCollected ?? 0,
    isLoadingStats: sealVault.isLoadingStats,
    refetchAll: sealVault.refetchAll,
    refetchSeals: sealVault.refetchSeals,
    refetchStats: sealVault.refetchStats,
  }
}

// ============ Helper Functions ============

function getErrorMessage(error: Error): string {
  const message = error.message.toLowerCase()
  
  if (message.includes('insufficient')) {
    return 'Insufficient ETH for the transaction fee'
  }
  if (message.includes('already sealed') || message.includes('sealalreadycollected')) {
    return 'You have already collected this seal'
  }
  if (message.includes('rejected') || message.includes('denied')) {
    return 'Transaction was rejected'
  }
  if (message.includes('network')) {
    return 'Network error. Please check your connection'
  }
  if (message.includes('already voted') || message.includes('alreadyvoted')) {
    return 'You have already voted on this proposal'
  }
  if (message.includes('voting period ended') || message.includes('votingperiodended')) {
    return 'The voting period has ended'
  }
  if (message.includes('insufficient points') || message.includes('insufficientpoints')) {
    return 'You need more points to perform this action'
  }
  if (message.includes('stake amount too low') || message.includes('stakeamounttoolow')) {
    return 'Stake amount is below the minimum required'
  }
  if (message.includes('no rewards') || message.includes('norewardstoclaim')) {
    return 'No rewards available to claim'
  }
  
  return 'An unexpected error occurred'
}
