'use client'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variantClasses = {
  default: 'bg-gray-700 text-gray-300',
  success: 'bg-green-900/50 text-green-400 border border-green-700',
  warning: 'bg-yellow-900/50 text-yellow-400 border border-yellow-700',
  error: 'bg-red-900/50 text-red-400 border border-red-700',
  info: 'bg-blue-900/50 text-blue-400 border border-blue-700',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

// Specialized badges for the app
export function SealBadge({ sealed }: { sealed: boolean }) {
  return sealed ? (
    <Badge variant="success" size="sm">
      ✓ Sealed
    </Badge>
  ) : (
    <Badge variant="default" size="sm">
      Not Collected
    </Badge>
  )
}

export function StatusBadge({ status }: { status: 'pending' | 'success' | 'failed' }) {
  const variants = {
    pending: 'warning' as const,
    success: 'success' as const,
    failed: 'error' as const,
  }

  const labels = {
    pending: '⏳ Pending',
    success: '✓ Success',
    failed: '✕ Failed',
  }

  return (
    <Badge variant={variants[status]} size="sm">
      {labels[status]}
    </Badge>
  )
}

export function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Badge variant="success" size="sm">🥇 #1</Badge>
  }
  if (rank === 2) {
    return <Badge variant="info" size="sm">🥈 #2</Badge>
  }
  if (rank === 3) {
    return <Badge variant="warning" size="sm">🥉 #3</Badge>
  }
  return <Badge variant="default" size="sm">#{rank}</Badge>
}
