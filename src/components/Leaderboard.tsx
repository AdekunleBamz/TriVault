'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useSealVault, useRewardsVault } from '@/hooks/useTriVault'
import { SEALS } from '@/config/contracts'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Tabs, TabPanel, useTabs } from './ui/Tabs'
import { SearchInput } from './ui/Input'
import { Badge, RankBadge } from './ui/Badge'
import { TableRowSkeleton } from './ui/Skeleton'
import { formatAddress } from '@/lib/utils'
import { useDebounce } from '@/hooks'

// Total seals now is 5
const TOTAL_SEALS = SEALS.length

// Mock data for demonstration - in production, this would come from an indexer or subgraph
const MOCK_LEADERBOARD_DATA = [
  { address: '0x1234567890123456789012345678901234567890', seals: 5, completedAt: Date.now() / 1000 - 86400 },
  { address: '0x2345678901234567890123456789012345678901', seals: 5, completedAt: Date.now() / 1000 - 172800 },
  { address: '0x3456789012345678901234567890123456789012', seals: 5, completedAt: Date.now() / 1000 - 259200 },
  { address: '0x4567890123456789012345678901234567890123', seals: 4, completedAt: null },
  { address: '0x5678901234567890123456789012345678901234', seals: 3, completedAt: null },
  { address: '0x6789012345678901234567890123456789012345', seals: 2, completedAt: null },
  { address: '0x7890123456789012345678901234567890123456', seals: 1, completedAt: null },
  { address: '0x8901234567890123456789012345678901234567', seals: 1, completedAt: null },
]

const tabs = [
  { id: 'all', label: 'All Time', icon: '🏆' },
  { id: 'weekly', label: 'This Week', icon: '📅' },
  { id: 'champions', label: 'Champions', icon: '👑' },
]

export function Leaderboard() {
  const { address: connectedAddress } = useAccount()
  const { activeTab, setActiveTab } = useTabs('all')
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  // Use the new hooks for stats
  const { stats: sealStats, isLoadingStats } = useSealVault()
  const { stats: rewardsStats, topUsers } = useRewardsVault()

  // Filter data based on tab and search
  const filteredData = MOCK_LEADERBOARD_DATA.filter((entry) => {
    // Filter by tab
    if (activeTab === 'champions' && entry.seals !== TOTAL_SEALS) return false
    
    // Filter by search
    if (debouncedSearch) {
      return entry.address.toLowerCase().includes(debouncedSearch.toLowerCase())
    }
    
    return true
  })

  // Sort by seals (desc) and completion time (asc)
  const sortedData = [...filteredData].sort((a, b) => {
    if (b.seals !== a.seals) return b.seals - a.seals
    if (a.completedAt && b.completedAt) return a.completedAt - b.completedAt
    if (a.completedAt) return -1
    if (b.completedAt) return 1
    return 0
  })

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card gradient="from-blue-500 to-blue-600">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Seals Collected</p>
            <p className="text-3xl font-bold text-white">
              {isLoadingStats ? '...' : (
                sealStats ? sealStats.totalSealsCollected.toLocaleString() : '0'
              )}
            </p>
          </div>
        </Card>
        
        <Card gradient="from-purple-500 to-purple-600">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Champions ({TOTAL_SEALS}/{TOTAL_SEALS})</p>
            <p className="text-3xl font-bold text-white">
              {MOCK_LEADERBOARD_DATA.filter(d => d.seals === TOTAL_SEALS).length}
            </p>
          </div>
        </Card>
        
        <Card gradient="from-indigo-500 to-indigo-600">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Fees (ETH)</p>
            <p className="text-3xl font-bold text-white">
              {isLoadingStats ? '...' : (
                sealStats ? (Number(sealStats.totalFeesCollected) / 1e18).toFixed(5) : '0'
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Top Collectors</CardTitle>
            <div className="w-full md:w-64">
              <SearchInput
                placeholder="Search by address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>
          </div>
        </CardHeader>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
          className="mb-4"
        />

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="py-3 px-4 text-gray-400 font-medium">Rank</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Address</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Seals</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingStats ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No results found
                    </td>
                  </tr>
                ) : (
                  sortedData.map((entry, index) => (
                    <tr
                      key={entry.address}
                      className={`
                        border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors
                        ${entry.address.toLowerCase() === connectedAddress?.toLowerCase() ? 'bg-blue-900/20' : ''}
                      `}
                    >
                      <td className="py-3 px-4">
                        <RankBadge rank={index + 1} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-gray-300">
                            {formatAddress(entry.address)}
                          </span>
                          {entry.address.toLowerCase() === connectedAddress?.toLowerCase() && (
                            <Badge variant="info" size="sm">You</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {SEALS.map((seal, sealIndex) => (
                            <span
                              key={seal.id}
                              className={`text-lg ${entry.seals > sealIndex ? 'opacity-100' : 'opacity-30'}`}
                              title={seal.name}
                            >
                              {seal.icon}
                            </span>
                          ))}
                          <span className="ml-2 text-sm text-gray-400">
                            {entry.seals}/{TOTAL_SEALS}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {entry.seals === TOTAL_SEALS ? (
                          <Badge variant="success" size="sm">👑 Champion</Badge>
                        ) : (
                          <Badge variant="default" size="sm">In Progress</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
