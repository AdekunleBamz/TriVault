import { formatEther } from 'viem'

interface EthValueProps {
  wei: bigint
  decimals?: number
  showSymbol?: boolean
  className?: string
}

export function EthValue({
  wei,
  decimals = 6,
  showSymbol = true,
  className = '',
}: EthValueProps) {
  const formatted = formatEther(wei)
  const num = parseFloat(formatted)

  let display: string
  if (num === 0) {
    display = '0'
  } else if (num < 0.000001) {
    display = '< 0.000001'
  } else {
    display = num.toFixed(decimals).replace(/\.?0+$/, '')
  }

  return (
    <span className={`font-mono ${className}`}>
      {display}
      {showSymbol && <span className="ml-1 text-gray-400">ETH</span>}
    </span>
  )
}

interface GweiValueProps {
  wei: bigint
  decimals?: number
  className?: string
}

export function GweiValue({ wei, decimals = 2, className = '' }: GweiValueProps) {
  const gwei = Number(wei) / 1e9
  const display = gwei.toFixed(decimals).replace(/\.?0+$/, '')

  return (
    <span className={`font-mono ${className}`}>
      {display}
      <span className="ml-1 text-gray-400">Gwei</span>
    </span>
  )
}

interface UsdValueProps {
  usd: number
  className?: string
}

export function UsdValue({ usd, className = '' }: UsdValueProps) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd)

  return <span className={`font-mono ${className}`}>{formatted}</span>
}

interface EthWithUsdProps {
  wei: bigint
  ethPrice?: number
  className?: string
}

export function EthWithUsd({ wei, ethPrice, className = '' }: EthWithUsdProps) {
  const eth = parseFloat(formatEther(wei))
  const usd = ethPrice ? eth * ethPrice : null

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <EthValue wei={wei} />
      {usd !== null && (
        <span className="text-gray-500 text-sm">
          (~<UsdValue usd={usd} />)
        </span>
      )}
    </span>
  )
}
