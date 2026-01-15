'use client'

import { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { TRIVAULT_ADDRESS, TRIVAULT_ABI, VAULTS } from '@/config/contracts'
import { formatAddress, formatRelativeTime } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'

interface ActivityItem {
  id: string
  user: string
  vaultNumber: number
  timestamp: number
  transactionHash: string
}

// Mock data for demonstration - would come from event logs in production
const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    user: '0x1234567890123456789012345678901234567890',
    vaultNumber: 1,
    timestamp: Math.floor(Date.now() / 1000) - 300,
    transactionHash: '0xabc123...',
  },
  {
    id: '2',
    user: '0x2345678901234567890123456789012345678901',
    vaultNumber: 3,
    timestamp: Math.floor(Date.now() / 1000) - 600,
    transactionHash: '0xdef456...',
  },
  {
    id: '3',
    user: '0x3456789012345678901234567890123456789012',
    vaultNumber: 2,
    timestamp: Math.floor(Date.now() / 1000) - 1200,
    transactionHash: '0xghi789...',
  },
  {
    id: '4',
    user: '0x4567890123456789012345678901234567890123',
    vaultNumber: 1,
    timestamp: Math.floor(Date.now() / 1000) - 2400,
    transactionHash: '0xjkl012...',
  },
  {
    id: '5',
    user: '0x5678901234567890123456789012345678901234',
    vaultNumber: 2,
    timestamp: Math.floor(Date.now() / 1000) - 3600,
    transactionHash: '0xmno345...',
  },
]

interface ActivityFeedProps {
  limit?: number
  showHeader?: boolean
}

export function ActivityFeed({ limit = 5, showHeader = true }: ActivityFeedProps) {
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading activity
  useEffect(() => {
    const timer = setTimeout(() => {
      setActivity(MOCK_ACTIVITY.slice(0, limit))
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [limit])

  const getVaultInfo = (vaultNumber: number) => {
    return VAULTS.find((v) => v.id === vaultNumber) || VAULTS[0]
  }

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton width="60%" height={16} className="mb-1" />
                  <Skeleton width="40%" height={12} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activity.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No recent activity yet. Be the first to collect a seal!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {activity.map((item) => {
            const vault = getVaultInfo(item.vaultNumber)
            
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${vault.color} flex items-center justify-center text-lg`}>
                  {vault.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-mono">{formatAddress(item.user)}</span>
                    <span className="text-gray-400"> collected </span>
                    <span className="font-medium">{vault.name}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
                <a
                  href={`https://basescan.org/tx/${item.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="View transaction"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
