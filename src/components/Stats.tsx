'use client'

import { useReadContract } from 'wagmi'
import { TRIVAULT_ADDRESS, TRIVAULT_ABI, VAULTS } from '@/config/contracts'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Skeleton } from './ui/Skeleton'
import { formatETH, formatCompactNumber } from '@/lib/utils'

export function Stats() {
  // Read stats from contract
  const { data: stats, isLoading: isLoadingStats } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'getStats',
  })

  // Read creator address
  const { data: creator, isLoading: isLoadingCreator } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'creator',
  })

  // Read fee constant
  const { data: creatorFee, isLoading: isLoadingFee } = useReadContract({
    address: TRIVAULT_ADDRESS,
    abi: TRIVAULT_ABI,
    functionName: 'CREATOR_FEE',
  })

  const totalInteractions = stats 
    ? Number(stats[1]) + Number(stats[2]) + Number(stats[3]) 
    : 0

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Fees Collected"
          value={isLoadingStats ? undefined : (stats ? formatETH(stats[0]) : '0')}
          suffix="ETH"
          icon="💰"
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Total Interactions"
          value={isLoadingStats ? undefined : formatCompactNumber(totalInteractions)}
          icon="🔥"
          gradient="from-red-500 to-pink-500"
        />
        <StatCard
          title="Fee Per Seal"
          value={isLoadingFee ? undefined : (creatorFee ? formatETH(creatorFee) : '0.00001')}
          suffix="ETH"
          icon="🏷️"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Contract Status"
          value="Active"
          icon="✅"
          gradient="from-green-500 to-emerald-500"
        />
      </div>

      {/* Vault Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Vault Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VAULTS.map((vault, index) => {
              const count = stats ? Number(stats[index + 1]) : 0
              const percentage = totalInteractions > 0 
                ? ((count / totalInteractions) * 100).toFixed(1)
                : '0'

              return (
                <div key={vault.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{vault.icon}</span>
                    <div>
                      <h4 className="font-semibold text-white">{vault.name}</h4>
                      <p className="text-sm text-gray-400">{vault.description}</p>
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
                        className={`h-full bg-gradient-to-r ${vault.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
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
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              label="Contract Address"
              value={TRIVAULT_ADDRESS}
              isAddress
              isLoading={false}
            />
            <InfoRow
              label="Creator Address"
              value={creator as string}
              isAddress
              isLoading={isLoadingCreator}
            />
            <InfoRow
              label="Network"
              value="Base Mainnet"
              isLoading={false}
            />
            <InfoRow
              label="Total Vaults"
              value="3"
              isLoading={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vault Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>Vault Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {VAULTS.map((vault) => (
              <div key={vault.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{vault.icon}</span>
                  <span className="font-medium text-white">{vault.name}</span>
                </div>
                <a
                  href={`https://basescan.org/address/${vault.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-blue-400 hover:underline"
                >
                  {vault.address.slice(0, 10)}...{vault.address.slice(-8)}
                </a>
              </div>
            ))}
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

interface InfoRowProps {
  label: string
  value: string | undefined
  isAddress?: boolean
  isLoading: boolean
}

function InfoRow({ label, value, isAddress, isLoading }: InfoRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
      <span className="text-gray-400 text-sm">{label}</span>
      {isLoading ? (
        <Skeleton width={200} height={20} />
      ) : isAddress && value ? (
        <a
          href={`https://basescan.org/address/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-blue-400 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="font-medium text-white">{value}</span>
      )}
    </div>
  )
}
