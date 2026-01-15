interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={`
        bg-gray-700
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
      aria-hidden="true"
    />
  )
}

// Card Skeleton for VaultCard loading state
export function VaultCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 p-1">
      <div className="bg-gray-900 rounded-xl p-6 h-full">
        {/* Icon placeholder */}
        <Skeleton variant="circular" width={48} height={48} className="mb-4" />
        
        {/* Title */}
        <Skeleton width="60%" height={24} className="mb-2" />
        
        {/* Description */}
        <Skeleton width="80%" height={16} className="mb-4" />
        
        {/* Stats */}
        <Skeleton width="40%" height={12} className="mb-4" />
        
        {/* Button */}
        <Skeleton variant="rounded" width="100%" height={44} />
      </div>
    </div>
  )
}

// Stats Skeleton
export function StatsSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={80} height={32} />
      <Skeleton variant="rounded" width={80} height={32} />
    </div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-800">
      <td className="py-3 px-4">
        <Skeleton width={40} height={20} />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton width={120} height={16} />
        </div>
      </td>
      <td className="py-3 px-4">
        <Skeleton width={60} height={16} />
      </td>
      <td className="py-3 px-4">
        <Skeleton width={80} height={16} />
      </td>
    </tr>
  )
}
