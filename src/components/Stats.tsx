'use client'

import { SEALS, SEAL_FEE, TRIVAULT_CORE_ADDRESS, SEAL_VAULT_ADDRESS, REWARDS_VAULT_ADDRESS, ACHIEVEMENT_VAULT_ADDRESS, GOVERNANCE_VAULT_ADDRESS } from '@/config/contracts'
import { useSealVault, useRewardsVault, useTriVaultCore } from '@/hooks/useTriVault'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { formatETH, formatCompactNumber } from '@/lib/utils'

const TOTAL_SEALS = SEALS.length

export function Stats() {
  // Use the new hooks
  const { stats: sealStats, isLoadingStats } = useSealVault()
  const { stats: rewardsStats } = useRewardsVault()
  const { stats: coreStats, contracts } = useTriVaultCore()

  const totalSealsCollected = sealStats?.totalSealsCollected ?? 0

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Fees Collected"
          value={isLoadingStats ? undefined : (sealStats ? formatETH(sealStats.totalFeesCollected) : '0')}
          suffix="ETH"
          icon="💰"
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Total Seals Collected"
          value={isLoadingStats ? undefined : formatCompactNumber(totalSealsCollected)}
          icon="🦭"
          gradient="from-blue-500 to-purple-500"
        />
        <StatCard
          title="Total Staked"
          value={rewardsStats ? formatETH(rewardsStats.totalStaked) : '0'}
          suffix="ETH"
          icon="🔒"
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Fee Per Seal"
          value={SEAL_FEE}
          suffix="ETH"
          icon="🏷️"
          gradient="from-red-500 to-pink-500"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={coreStats ? coreStats.totalUsers.toString() : '0'}
          icon="👥"
          gradient="from-indigo-500 to-blue-500"
        />
        <StatCard
          title="Total Interactions"
          value={coreStats ? coreStats.totalInteractions.toString() : '0'}
          icon="🔥"
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          title="Rewards Pool"
          value={rewardsStats ? formatETH(rewardsStats.rewardsPool) : '0'}
          suffix="ETH"
          icon="💎"
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Current Season"
          value={rewardsStats ? rewardsStats.currentSeason.toString() : '1'}
          icon="🏆"
          gradient="from-cyan-500 to-blue-500"
        />
      </div>

      {/* Seal Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Seal Collection Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {SEALS.map((seal, index) => {
              const count = sealStats?.sealCounts ? Number(sealStats.sealCounts[index] || 0) : 0
              const percentage = totalSealsCollected > 0 
                ? ((count / totalSealsCollected) * 100).toFixed(1)
                : '0'

              return (
                <div key={seal.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{seal.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{seal.name}</h4>
                      <p className="text-xs text-gray-400">{seal.description}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Collections</span>
                      <span className="text-white font-medium">
                        {isLoadingStats ? (
                          <Skeleton width={40} height={16} />
                        ) : (
                          formatCompactNumber(count)
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${seal.color} transition-all duration-500`}
                        style={{ width: `${Math.min(Number(percentage), 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">{percentage}% of total</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ContractRow
              name="TriVault Core"
              description="Central controller and registry"
              address={TRIVAULT_CORE_ADDRESS}
              icon="🏛️"
            />
            <ContractRow
              name="Seal Vault"
              description="Seal collection contract"
              address={SEAL_VAULT_ADDRESS}
              icon="🦭"
            />
            <ContractRow
              name="Rewards Vault"
              description="Points, staking, and rewards"
              address={REWARDS_VAULT_ADDRESS}
              icon="💎"
            />
            <ContractRow
              name="Achievement Vault"
              description="Achievements and milestones"
              address={ACHIEVEMENT_VAULT_ADDRESS}
              icon="🏅"
            />
            <ContractRow
              name="Governance Vault"
              description="Community governance and voting"
              address={GOVERNANCE_VAULT_ADDRESS}
              icon="🗳️"
            />
          </div>
        </CardContent>
      </Card>

      {/* Network Info */}
      <Card>
        <CardHeader>
          <CardTitle>Network Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoRow label="Network" value="Base Mainnet" />
            <InfoRow label="Total Contracts" value="5" />
            <InfoRow label="Total Seal Types" value={TOTAL_SEALS.toString()} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | undefined
  suffix?: string
  icon: string
  gradient: string
}

function StatCard({ title, value, suffix, icon, gradient }: StatCardProps) {
  return (
    <Card gradient={gradient}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm mb-1">{title}</p>
          {value === undefined ? (
            <Skeleton width={80} height={32} />
          ) : (
            <p className="text-2xl font-bold text-white">
              {value}
              {suffix && <span className="text-lg text-gray-300 ml-1">{suffix}</span>}
            </p>
          )}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </Card>
  )
}

interface ContractRowProps {
  name: string
  description: string
  address: `0x${string}`
  icon: string
}

function ContractRow({ name, description, address, icon }: ContractRowProps) {
  const isDeployed = address !== '0x0000000000000000000000000000000000000000'
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <span className="font-medium text-white">{name}</span>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      {isDeployed ? (
        <a
          href={`https://basescan.org/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-blue-400 hover:underline"
        >
          {address.slice(0, 10)}...{address.slice(-8)}
        </a>
      ) : (
        <span className="text-sm text-gray-500">Not deployed</span>
      )}
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}
